import type { StorageProvider } from "../../src/types";
import { getServiceSupabaseClient } from "./supabase.js";

export interface EventRecord {
  id: string;
  public_id: string;
  title: string;
  spouses: string;
  storage_provider: StorageProvider;
  google_drive_folder_id: string | null;
  // Fase 1
  wedding_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_maps_url: string | null;
  dresscode: string | null;
  schedule: string | null;
  couple_story: string | null;
  menu: string | null;
  // Fase 7
  menu_antipasto: string | null;
  menu_primo: string | null;
  menu_secondo: string | null;
  menu_contorno: string | null;
  menu_dolce: string | null;
  menu_bevande: string | null;
}

export async function getEventByPublicId(publicId: string) {
  const normalized = publicId.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, public_id, title, spouses, storage_provider, google_drive_folder_id, wedding_date, venue_name, venue_address, venue_maps_url, dresscode, schedule, couple_story, menu, menu_antipasto, menu_primo, menu_secondo, menu_contorno, menu_dolce, menu_bevande",
    )
    .eq("public_id", normalized)
    .maybeSingle<EventRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
