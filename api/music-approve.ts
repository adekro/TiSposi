import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non autenticato" });
  }
  const token = authHeader.slice(7);

  const entryId =
    typeof req.query.id === "string" ? req.query.id.trim() : "";
  if (!entryId) {
    return res.status(400).json({ error: "Parametro id mancante" });
  }

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
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (eventErr || !event) {
    return res.status(404).json({ error: "Evento non trovato" });
  }

  // Aggiorna approved — il check su event_id garantisce l'ownership
  const { error: updateErr } = await supabase
    .from("music_requests")
    .update({ approved: true })
    .eq("id", entryId)
    .eq("event_id", event.id);

  if (updateErr) {
    console.error("[music-approve] DB error:", updateErr.message);
    return res.status(500).json({ error: "Errore durante l'approvazione" });
  }

  return res.status(204).end();
}
