import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function resolveOwnerEvent(
  supabase: ReturnType<typeof getServiceSupabaseClient>,
  authHeader: string | undefined,
) {
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, event: null, status: 401, error: "Non autenticato" };
  }
  const token = authHeader.slice(7);

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return { user: null, event: null, status: 401, error: "Token non valido" };
  }

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (eventErr || !event) {
    return {
      user,
      event: null,
      status: 404,
      error: "Evento non trovato",
    };
  }

  return { user, event, status: 200, error: null };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getServiceSupabaseClient();

  // ── GET: serve l'immagine di sfondo ─────────────────────────────────────────
  if (req.method === "GET") {
    const eventId =
      typeof req.query.eventId === "string" ? req.query.eventId.trim() : "";
    if (!eventId) {
      return res.status(400).json({ error: "Parametro eventId mancante" });
    }

    const { data, error } = await supabase
      .from("event_backgrounds")
      .select("image_base64, image_mime_type")
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Nessuna immagine di sfondo" });
    }

    const imgBuffer = Buffer.from(data.image_base64 as string, "base64");
    res.setHeader("Content-Type", data.image_mime_type as string);
    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).send(imgBuffer);
  }

  // ── POST: carica/sostituisce l'immagine di sfondo ────────────────────────────
  if (req.method === "POST") {
    const { event, status, error } = await resolveOwnerEvent(
      supabase,
      req.headers.authorization,
    );
    if (!event) {
      return res.status(status).json({ error });
    }

    const contentType = (req.headers["content-type"] ?? "")
      .split(";")[0]
      .trim();
    if (!ALLOWED_MIME.has(contentType)) {
      return res.status(415).json({
        error: `Tipo file non supportato: ${contentType}. Usa JPEG, PNG o WebP.`,
      });
    }

    const rawBody = await readRawBody(req);
    if (rawBody.length === 0) {
      return res.status(400).json({ error: "Nessun file ricevuto" });
    }
    if (rawBody.length > MAX_SIZE_BYTES) {
      return res.status(413).json({ error: "File troppo grande (max 4 MB)" });
    }

    const base64 = rawBody.toString("base64");
    const { error: upsertErr } = await supabase
      .from("event_backgrounds")
      .upsert(
        {
          event_id: event.id,
          image_base64: base64,
          image_mime_type: contentType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id" },
      );

    if (upsertErr) {
      return res.status(500).json({ error: upsertErr.message });
    }

    return res
      .status(200)
      .json({ ok: true, url: `/api/upload-bg?eventId=${event.id as string}` });
  }

  // ── DELETE: rimuove l'immagine di sfondo ─────────────────────────────────────
  if (req.method === "DELETE") {
    const { event, status, error } = await resolveOwnerEvent(
      supabase,
      req.headers.authorization,
    );
    if (!event) {
      return res.status(status).json({ error });
    }

    const { error: delErr } = await supabase
      .from("event_backgrounds")
      .delete()
      .eq("event_id", event.id);

    if (delErr) {
      return res.status(500).json({ error: delErr.message });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
