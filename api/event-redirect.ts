import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId =
    typeof req.query.eventId === "string" ? req.query.eventId.trim() : "";
  if (!eventId) {
    return res.status(400).json({ error: "Parametro eventId mancante" });
  }

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("public_id")
    .eq("id", eventId)
    .maybeSingle<{ public_id: string }>();

  if (error || !data) {
    return res.status(404).json({ error: "Evento non trovato" });
  }

  return res.status(200).json({ publicId: data.public_id });
}
