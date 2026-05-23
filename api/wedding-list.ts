import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events.js";
import { getServiceSupabaseClient } from "./_lib/supabase.js";
import type { LandingConfig, WeddingListItem } from "../src/types";

interface WeddingListPublicResponse {
  event: {
    spouses: string;
    weddingListDescription: string | null;
    weddingListBgUrl: string | null;
    landingBgUrl: string | null;
    landingConfig: LandingConfig | null;
  };
  items: WeddingListItem[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publicId =
    typeof req.query.publicId === "string" ? req.query.publicId.trim() : "";
  if (!publicId) {
    return res.status(400).json({ error: "Parametro publicId mancante" });
  }

  try {
    const event = await getEventByPublicId(publicId);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("wedding_list_items")
      .select("id, event_id, title, description, url, order, created_at")
      .eq("event_id", event.id)
      .order("order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<WeddingListItem[]>();

    if (error) {
      throw new Error(error.message);
    }

    const { data: bgData, error: bgError } = await supabase
      .from("event_wedding_list_backgrounds")
      .select("event_id, updated_at")
      .eq("event_id", event.id)
      .maybeSingle<{ event_id: string; updated_at: string | null }>();

    if (bgError) {
      throw new Error(bgError.message);
    }

    const { data: landingBgData, error: landingBgError } = await supabase
      .from("event_backgrounds")
      .select("event_id, updated_at")
      .eq("event_id", event.id)
      .maybeSingle<{ event_id: string; updated_at: string | null }>();

    if (landingBgError) {
      throw new Error(landingBgError.message);
    }

    const payload: WeddingListPublicResponse = {
      event: {
        spouses: event.spouses,
        weddingListDescription: event.wedding_list_description,
        weddingListBgUrl: bgData
          ? `/api/upload-wedding-list-bg?eventId=${event.id}&v=${encodeURIComponent(bgData.updated_at ?? "")}`
          : null,
        landingBgUrl: landingBgData
          ? `/api/upload-bg?eventId=${event.id}&v=${encodeURIComponent(landingBgData.updated_at ?? "")}`
          : null,
        landingConfig: event.landing_config,
      },
      items: data ?? [],
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("[wedding-list] Errore:", err);
    return res
      .status(500)
      .json({ error: "Errore nel recupero della lista nozze" });
  }
}
