import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events.js";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

interface MusicRequestRow {
  id: string;
  song: string;
  artist: string | null;
  requested_by: string | null;
  created_at: string;
  approved: boolean;
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
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

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("music_requests")
      .select("id, song, artist, requested_by, created_at, approved")
      .eq("event_id", event.id)
      .eq("approved", true)
      .order("created_at", { ascending: true })
      .returns<MusicRequestRow[]>();

    if (error) throw new Error(error.message);

    const items = (data ?? []).map((r) => ({
      id: r.id,
      song: r.song,
      artist: r.artist,
      requestedBy: r.requested_by,
      createdAt: r.created_at,
      approved: r.approved,
    }));

    return res.status(200).json({ items });
  } catch (err) {
    console.error("[music GET] Errore:", err);
    return res.status(500).json({ error: "Errore interno del server" });
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handlePost(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}
