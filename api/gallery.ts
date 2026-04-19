import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events.js";
import { getServiceSupabaseClient } from "./_lib/supabase.js";
import type { GalleryItem, PublicGalleryResponse } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[gallery] Handler invocato con query:", req.query);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publicId =
    typeof req.query.publicId === "string" ? req.query.publicId : "";
  if (!publicId.trim()) {
    return res.status(400).json({ error: "Parametro publicId mancante" });
  }

  console.log("[gallery] Request ricevuta per publicId:", publicId);

  try {
    const event = await getEventByPublicId(publicId);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    console.log("[gallery] Evento trovato:", {
      id: event.id,
      title: event.title,
      storageProvider: event.storage_provider,
    });

    // Incrementa visit_count in modo asincrono (fire-and-forget)
    void getServiceSupabaseClient().rpc("increment_event_visits", {
      p_event_id: event.id,
    });

    // Controlla se esiste un'immagine di sfondo nella tabella dedicata
    const supabaseForBg = getServiceSupabaseClient();
    const { data: bgRow } = await supabaseForBg
      .from("event_backgrounds")
      .select("event_id")
      .eq("event_id", event.id)
      .maybeSingle();
    const landingBgUrl = bgRow
      ? `/api/upload-bg?eventId=${event.id}`
      : (event.landing_bg_url ?? null);

    let items: GalleryItem[] = [];

    if (event.storage_provider === "google_drive") {
      if (!event.google_drive_folder_id) {
        return res
          .status(500)
          .json({ error: "Evento configurato senza cartella Google Drive" });
      }
      const { listDriveGalleryItems } = await import("./_lib/drive");
      items = await listDriveGalleryItems(event.google_drive_folder_id);
    } else {
      console.log("[gallery] Utilizzo di Supabase come storage provider");
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase
        .from("gallery_entries")
        .select("id, type, text_content, photo_mime_type, created_at")
        .eq("event_id", event.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        throw new Error(error.message);
      }

      items = [];

      for (const entry of data ?? []) {
        if (entry.type === "dedica") {
          items.push({
            id: entry.id,
            type: "dedica",
            text: entry.text_content ?? "",
            timestamp: entry.created_at ?? new Date().toISOString(),
          });
          continue;
        }

        if (!entry.photo_mime_type) {
          continue;
        }

        items.push({
          id: entry.id,
          type: "photo",
          url: `/api/photo?id=${entry.id}`,
          mimeType: entry.photo_mime_type,
          timestamp: entry.created_at ?? new Date().toISOString(),
        });
      }
    }

    const payload: PublicGalleryResponse = {
      event: {
        id: event.id,
        publicId: event.public_id,
        title: event.title,
        spouses: event.spouses,
        storageProvider: event.storage_provider,
        weddingDate: event.wedding_date,
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        venueMapsUrl: event.venue_maps_url,
        dresscode: event.dresscode,
        schedule: event.schedule,
        coupleStory: event.couple_story,
        menu: event.menu,
        menuAntipasto: event.menu_antipasto,
        menuPrimo: event.menu_primo,
        menuSecondo: event.menu_secondo,
        menuContorno: event.menu_contorno,
        menuDolce: event.menu_dolce,
        menuBevande: event.menu_bevande,
        ceremonyVenueName: event.ceremony_venue_name,
        ceremonyVenueAddress: event.ceremony_venue_address,
        ceremonyVenueMapsUrl: event.ceremony_venue_maps_url,
        ceremonyTime: event.ceremony_time,
        receptionVenueName: event.reception_venue_name,
        receptionVenueAddress: event.reception_venue_address,
        receptionVenueMapsUrl: event.reception_venue_maps_url,
        receptionTime: event.reception_time,
        landingBgUrl: landingBgUrl,
        weddingListDescription: event.wedding_list_description,
      },
      items,
    };

    // Cache HTTP: 30s (max-age) con stale-while-revalidate
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("[gallery] Errore:", err);
    return res
      .status(500)
      .json({ error: "Errore nel recupero della galleria" });
  }
}
