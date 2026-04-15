import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = typeof req.query.id === "string" ? req.query.id.trim() : "";
  if (!id) {
    return res.status(400).json({ error: "Parametro id mancante" });
  }

  try {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("gallery_entries")
      .select("photo_base64, photo_mime_type")
      .eq("id", id)
      .eq("type", "photo")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || !data.photo_base64 || !data.photo_mime_type) {
      return res.status(404).json({ error: "Foto non trovata" });
    }

    const buffer = Buffer.from(data.photo_base64, "base64");
    res.setHeader("Content-Type", data.photo_mime_type);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", buffer.length);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("[photo] Errore:", err);
    return res.status(500).json({ error: "Errore nel recupero della foto" });
  }
}
