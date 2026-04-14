import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getEventByPublicId } from "./_lib/events";
import { listDriveGalleryItems } from "./_lib/drive";
import { getServiceSupabaseClient } from "./_lib/supabase";
import type { GalleryItem, PublicGalleryResponse } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    let items: GalleryItem[] = [];

    if (event.storage_provider === "google_drive") {
      if (!event.google_drive_folder_id) {
        return res
          .status(500)
          .json({ error: "Evento configurato senza cartella Google Drive" });
      }
      items = await listDriveGalleryItems(event.google_drive_folder_id);
    } else {
      const supabase = getServiceSupabaseClient();
      const { data, error } = await supabase
        .from("gallery_entries")
        .select(
          "id, type, text_content, photo_base64, photo_mime_type, created_at",
        )
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

        if (!entry.photo_base64 || !entry.photo_mime_type) {
          continue;
        }

        items.push({
          id: entry.id,
          type: "photo",
          url: `data:${entry.photo_mime_type};base64,${entry.photo_base64}`,
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
