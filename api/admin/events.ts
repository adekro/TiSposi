import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "../_lib/supabase.js";

const ADMIN_EMAIL = "e.croce88@gmail.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verifica JWT
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non autenticato" });
  }
  const token = authHeader.slice(7);

  const supabase = getServiceSupabaseClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return res.status(401).json({ error: "Token non valido" });
  }

  // Solo l'admin può accedere
  if (user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Accesso negato" });
  }

  // Recupera tutti gli eventi (bypassa RLS tramite service role)
  const { data: events, error: eventsErr } = await supabase
    .from("events")
    .select("id, title, spouses, wedding_date, created_at, owner_user_id")
    .order("created_at", { ascending: false });

  if (eventsErr) {
    console.error("[admin/events] DB error:", eventsErr.message);
    return res.status(500).json({ error: "Errore nel recupero degli eventi" });
  }

  // Recupera la lista utenti per ottenere le email
  const {
    data: { users },
    error: usersErr,
  } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (usersErr) {
    console.error("[admin/events] Users error:", usersErr.message);
    return res.status(500).json({ error: "Errore nel recupero degli utenti" });
  }

  const emailById = new Map(users.map((u) => [u.id, u.email ?? ""]));

  const rows = (events ?? []).map((e) => ({
    id: e.id as string,
    ownerUserId: e.owner_user_id as string,
    ownerEmail: emailById.get(e.owner_user_id as string) ?? "",
    title: (e.title as string) ?? "",
    spouses: (e.spouses as string) ?? "",
    weddingDate: (e.wedding_date as string | null) ?? null,
    createdAt: e.created_at as string,
  }));

  return res.status(200).json({ events: rows });
}
