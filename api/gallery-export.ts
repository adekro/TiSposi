import type { VercelRequest, VercelResponse } from "@vercel/node";
import JSZip from "jszip";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non autenticato" });
  }
  const token = authHeader.slice(7);

  const supabase = getServiceSupabaseClient();

  // Verifica JWT
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ error: "Token non valido" });
  }

  // Recupera evento dell'owner
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("id, public_id, storage_provider, google_drive_folder_id")
    .eq("owner_user_id", user.id)
    .maybeSingle<{
      id: string;
      public_id: string;
      storage_provider: string;
      google_drive_folder_id: string | null;
    }>();

  if (eventErr || !event) {
    return res.status(404).json({ error: "Evento non trovato" });
  }

  const zip = new JSZip();

  if (event.storage_provider === "supabase_db") {
    const { data: photos, error: photosErr } = await supabase
      .from("gallery_entries")
      .select("id, photo_base64, photo_mime_type, created_at")
      .eq("event_id", event.id)
      .eq("type", "photo")
      .order("created_at", { ascending: true });

    if (photosErr) {
      return res.status(500).json({ error: "Errore nel recupero delle foto" });
    }

    for (const photo of photos ?? []) {
      if (!photo.photo_base64 || !photo.photo_mime_type) continue;
      const ext = (photo.photo_mime_type as string)
        .split("/")[1]
        .replace("jpeg", "jpg");
      const ts = new Date(photo.created_at as string)
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      const filename = `foto_${ts}_${(photo.id as string).slice(0, 8)}.${ext}`;
      zip.file(filename, Buffer.from(photo.photo_base64 as string, "base64"));
    }
  } else if (event.storage_provider === "google_drive") {
    if (!event.google_drive_folder_id) {
      return res
        .status(500)
        .json({ error: "Cartella Google Drive non configurata" });
    }

    const { google } = await import("googleapis");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) {
      return res
        .status(500)
        .json({ error: "Credenziali Google mancanti sul server" });
    }

    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: "v3", auth: oauth2 });

    const listRes = await drive.files.list({
      q: `'${event.google_drive_folder_id}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,createdTime)",
      orderBy: "createdTime asc",
      pageSize: 200,
    });

    const files = listRes.data.files ?? [];

    for (const file of files) {
      if (!file.id || !file.name) continue;
      if (file.name.startsWith("dedica_")) continue;
      if (
        !file.mimeType?.startsWith("image/") &&
        file.mimeType !== "application/octet-stream"
      )
        continue;

      const fileRes = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "arraybuffer" },
      );
      zip.file(file.name, Buffer.from(fileRes.data as ArrayBuffer));
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "STORE",
  });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="galleria-${event.public_id}.zip"`,
  );
  res.setHeader("Content-Length", String(zipBuffer.length));
  return res.status(200).send(zipBuffer);
}
