import type { LandingConfig, StorageProvider } from "../../src/types";
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
  // Fase 8
  ceremony_venue_name: string | null;
  ceremony_venue_address: string | null;
  ceremony_venue_maps_url: string | null;
  ceremony_time: string | null;
  reception_venue_name: string | null;
  reception_venue_address: string | null;
  reception_venue_maps_url: string | null;
  reception_time: string | null;
  show_flight_info: boolean;
  flight_airport: string | null;
  flight_shuttle: string | null;
  flight_schedule: string | null;
  show_parking_info: boolean;
  parking_info: string | null;
  show_accommodation_info: boolean;
  accommodation_hotel: string | null;
  accommodation_full_board: string | null;
  accommodation_agreements: string | null;
  // Fase 17
  landing_bg_url: string | null;
  landing_config: LandingConfig | null;
  wedding_list_description: string | null;
}

export async function getEventByPublicId(publicId: string) {
  const normalized = publicId.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, public_id, title, spouses, storage_provider, google_drive_folder_id, wedding_date, venue_name, venue_address, venue_maps_url, dresscode, schedule, couple_story, menu, menu_antipasto, menu_primo, menu_secondo, menu_contorno, menu_dolce, menu_bevande, ceremony_venue_name, ceremony_venue_address, ceremony_venue_maps_url, ceremony_time, reception_venue_name, reception_venue_address, reception_venue_maps_url, reception_time, show_flight_info, flight_airport, flight_shuttle, flight_schedule, show_parking_info, parking_info, show_accommodation_info, accommodation_hotel, accommodation_full_board, accommodation_agreements, landing_bg_url, landing_config, wedding_list_description",
    )
    .eq("public_id", normalized)
    .maybeSingle<EventRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
