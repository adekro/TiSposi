import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events.js";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publicId =
    typeof req.query.publicId === "string" ? req.query.publicId : "";
  if (!publicId.trim()) {
    return res.status(400).json({ error: "Parametro publicId mancante" });
  }

  try {
    const event = await getEventByPublicId(publicId);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    const body = req.body as Record<string, unknown>;
    const song = typeof body?.song === "string" ? body.song.trim() : "";
    const artist = typeof body?.artist === "string" ? body.artist.trim() : null;
    const requestedBy =
      typeof body?.requestedBy === "string" ? body.requestedBy.trim() : null;

    if (!song || song.length < 1 || song.length > 200) {
      return res
        .status(400)
        .json({
          error: "Il titolo della canzone è obbligatorio (max 200 caratteri).",
        });
    }

    if (artist && artist.length > 200) {
      return res
        .status(400)
        .json({
          error: "Il nome dell'artista non può superare 200 caratteri.",
        });
    }

    if (requestedBy && requestedBy.length > 100) {
      return res
        .status(400)
        .json({ error: "Il nome non può superare 100 caratteri." });
    }

    const supabase = getServiceSupabaseClient();
    const { error: insertError } = await supabase
      .from("music_requests")
      .insert({
        event_id: event.id,
        song,
        artist: artist || null,
        requested_by: requestedBy || null,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[music] Errore:", err);
    return res.status(500).json({ error: "Errore interno del server" });
  }
}
