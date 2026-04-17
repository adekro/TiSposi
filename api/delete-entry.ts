import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
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
    .select("id, storage_provider")
    .eq("owner_user_id", user.id)
    .maybeSingle<{ id: string; storage_provider: string }>();

  if (eventErr || !event) {
    return res.status(404).json({ error: "Evento non trovato" });
  }

  if (event.storage_provider === "supabase_db") {
    // Il check .eq("event_id", event.id) garantisce l'ownership
    const { error: deleteErr } = await supabase
      .from("gallery_entries")
      .delete()
      .eq("id", entryId)
      .eq("event_id", event.id);

    if (deleteErr) {
      console.error("[delete-entry] DB error:", deleteErr.message);
      return res.status(500).json({ error: "Errore durante l'eliminazione" });
    }
  } else if (event.storage_provider === "google_drive") {
    try {
      const { deleteDriveFile } = await import("./_lib/drive.js");
      await deleteDriveFile(entryId);
    } catch (err) {
      console.error("[delete-entry] Drive error:", err);
      return res
        .status(500)
        .json({ error: "Errore durante l'eliminazione da Drive" });
    }
  }

  return res.status(204).end();
}
