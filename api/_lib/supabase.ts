import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error("SUPABASE_URL non impostata");
  }
  return url;
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const normalized = key?.trim() ?? "";
  const looksLikePlaceholder =
    normalized.includes("incolla_qui") ||
    normalized.includes("your_service_role_key_here") ||
    normalized === "changeme";

  if (!normalized || looksLikePlaceholder || normalized.length < 20) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non impostata");
  }
  return normalized;
}

export function getServiceSupabaseClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
