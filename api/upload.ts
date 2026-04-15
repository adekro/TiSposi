import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events.js";
import { uploadDriveDedica, uploadDrivePhoto } from "./_lib/drive.js";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

// Disabilita il bodyParser di Vercel: leggiamo il raw stream direttamente
export const config = {
  api: {
    bodyParser: false,
  },
};

// Tipi MIME ammessi per le foto
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_DRIVE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_SUPABASE_DB_IMAGE_BYTES = 4 * 1024 * 1024;

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publicId =
    typeof req.query.publicId === "string" ? req.query.publicId : "";
  if (!publicId.trim()) {
    return res.status(400).json({ error: "Parametro publicId mancante" });
  }

  const contentType = (req.headers["content-type"] ?? "").split(";")[0].trim();

  try {
    const event = await getEventByPublicId(publicId);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    // ── Dedica testuale (JSON) ────────────────────────────────────────
    if (contentType === "application/json") {
      const rawBody = await readRawBody(req);
      const body = JSON.parse(rawBody.toString("utf8")) as { testo?: unknown };
      const testo = typeof body.testo === "string" ? body.testo.trim() : "";
      if (testo.length < 2 || testo.length > 500) {
        return res
          .status(400)
          .json({ error: "Testo non valido (2-500 caratteri)" });
      }

      if (event.storage_provider === "google_drive") {
        if (!event.google_drive_folder_id) {
          return res
            .status(500)
            .json({ error: "Evento configurato senza cartella Google Drive" });
        }

        const uploaded = await uploadDriveDedica(
          event.google_drive_folder_id,
          testo,
        );
        return res.status(200).json(uploaded);
      }

      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase
        .from("gallery_entries")
        .insert({
          event_id: event.id,
          type: "dedica",
          text_content: testo,
        })
        .select("id, created_at")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({
        id: data.id,
        timestamp: data.created_at,
      });
    }

    // ── Upload foto (binary stream) ───────────────────────────────────
    // Il frontend invia il file direttamente come body binario con Content-Type
    // corretto (niente multipart), evitando qualsiasi parsing complesso.
    if (!ALLOWED_MIME.has(contentType)) {
      return res.status(415).json({
        error: `Tipo file non supportato: ${contentType}. Usa JPEG, PNG o WebP.`,
      });
    }

    const rawBody = await readRawBody(req);

    if (rawBody.length === 0) {
      return res.status(400).json({ error: "Nessun file ricevuto" });
    }

    const maxSizeBytes =
      event.storage_provider === "supabase_db"
        ? MAX_SUPABASE_DB_IMAGE_BYTES
        : MAX_DRIVE_SIZE_BYTES;
    if (rawBody.length > maxSizeBytes) {
      const maxSizeLabel =
        event.storage_provider === "supabase_db" ? "4MB" : "10MB";
      return res
        .status(413)
        .json({ error: `File troppo grande (max ${maxSizeLabel})` });
    }

    if (event.storage_provider === "google_drive") {
      if (!event.google_drive_folder_id) {
        return res
          .status(500)
          .json({ error: "Evento configurato senza cartella Google Drive" });
      }

      const uploaded = await uploadDrivePhoto(
        event.google_drive_folder_id,
        contentType,
        rawBody,
      );
      return res.status(200).json(uploaded);
    }

    const base64 = rawBody.toString("base64");
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("gallery_entries")
      .insert({
        event_id: event.id,
        type: "photo",
        photo_base64: base64,
        photo_mime_type: contentType,
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      id: data.id,
      url: `data:${contentType};base64,${base64}`,
      timestamp: data.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[upload] Errore:", message, err);
    return res
      .status(500)
      .json({ error: "Errore durante il caricamento", detail: message });
  }
}
