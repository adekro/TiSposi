import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceSupabaseClient } from "../_lib/supabase.js";

const ADMIN_EMAIL = "e.croce88@gmail.com";

function getRedirectTo(req: VercelRequest) {
  const originHeader = req.headers.origin;
  if (typeof originHeader === "string" && originHeader.length > 0) {
    return `${originHeader.replace(/\/$/, "")}/app`;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = typeof forwardedProto === "string" ? forwardedProto : "https";
  const host = req.headers.host;

  if (!host) {
    throw new Error("Host non disponibile");
  }

  return `${proto}://${host}/app`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non autenticato" });
  }

  const targetUserId =
    typeof req.body?.targetUserId === "string" ? req.body.targetUserId.trim() : "";

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId obbligatorio" });
  }

  const token = authHeader.slice(7);
  const supabase = getServiceSupabaseClient();

  const {
    data: { user: adminUser },
    error: adminAuthError,
  } = await supabase.auth.getUser(token);

  if (adminAuthError || !adminUser) {
    return res.status(401).json({ error: "Token non valido" });
  }

  if (adminUser.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Accesso negato" });
  }

  const {
    data: targetUserData,
    error: targetUserError,
  } = await supabase.auth.admin.getUserById(targetUserId);

  if (targetUserError || !targetUserData.user?.email) {
    return res.status(404).json({ error: "Utente target non trovato" });
  }

  let redirectTo: string;
  try {
    redirectTo = getRedirectTo(req);
  } catch (error) {
    console.error("[admin/impersonate] redirect error:", error);
    return res.status(500).json({ error: "Impossibile determinare il redirect" });
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: targetUserData.user.email,
    options: { redirectTo },
  });

  if (linkError || !linkData.properties?.action_link) {
    console.error("[admin/impersonate] link error:", linkError);
    return res.status(500).json({ error: "Impossibile generare il link di accesso" });
  }

  return res.status(200).json({ actionLink: linkData.properties.action_link });
}