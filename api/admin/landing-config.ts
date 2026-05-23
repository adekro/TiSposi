import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { LandingConfig, LandingThemePreset } from "../../src/types";
import { getServiceSupabaseClient } from "../_lib/supabase.js";

const ALLOWED_THEMES: LandingThemePreset[] = ["gold", "rose", "classic"];
const ALLOWED_BLOCK_TYPES = [
  "text",
  "menu_cta",
  "story",
  "event_info",
  "wedding_menu",
  "image",
  "gallery",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isTheme(value: unknown): value is LandingThemePreset {
  return typeof value === "string" && ALLOWED_THEMES.includes(value as LandingThemePreset);
}

function validateLandingConfig(value: unknown): value is LandingConfig {
  if (!isRecord(value)) return false;
  if (typeof value.headerFixed !== "boolean") return false;
  if (!isTheme(value.theme)) return false;
  if (!isRecord(value.hero)) return false;
  if (!Array.isArray(value.blocks)) return false;

  const hero = value.hero;
  if (typeof hero.title !== "string") return false;
  if (!isStringOrNull(hero.subtitle)) return false;
  if (!isStringOrNull(hero.imageUrlDesktop)) return false;
  if (!isStringOrNull(hero.imageUrlTablet)) return false;
  if (!isStringOrNull(hero.imageUrlMobile)) return false;
  if (typeof hero.overlayOpacity !== "number") return false;
  if (hero.overlayOpacity < 0 || hero.overlayOpacity > 1) return false;
  if (hero.textAlign !== "left" && hero.textAlign !== "center" && hero.textAlign !== "right") {
    return false;
  }

  const seenOrder = new Set<number>();

  for (const block of value.blocks) {
    if (!isRecord(block)) return false;
    if (typeof block.id !== "string" || block.id.trim().length === 0) return false;
    if (typeof block.order !== "number" || !Number.isInteger(block.order) || block.order < 0) {
      return false;
    }
    if (seenOrder.has(block.order)) return false;
    seenOrder.add(block.order);

    if (typeof block.visible !== "boolean") return false;
    if (typeof block.type !== "string") return false;
    if (!ALLOWED_BLOCK_TYPES.includes(block.type as (typeof ALLOWED_BLOCK_TYPES)[number])) {
      return false;
    }
    if (!isRecord(block.content)) return false;
  }

  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non autenticato" });
  }

  const token = authHeader.slice(7);
  const supabase = getServiceSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Token non valido" });
  }

  const body = req.body as {
    eventId?: unknown;
    landingConfig?: unknown;
  };

  const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";
  if (!eventId) {
    return res.status(400).json({ error: "eventId mancante" });
  }

  if (!validateLandingConfig(body?.landingConfig)) {
    return res.status(400).json({ error: "landingConfig non valido" });
  }

  const { data: ownedEvent, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (eventError) {
    return res.status(500).json({ error: eventError.message });
  }

  if (!ownedEvent) {
    return res.status(403).json({ error: "Accesso negato a questo evento" });
  }

  const { error: updateError } = await supabase
    .from("events")
    .update({ landing_config: body.landingConfig })
    .eq("id", eventId)
    .eq("owner_user_id", user.id);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.status(200).json({ ok: true });
}
