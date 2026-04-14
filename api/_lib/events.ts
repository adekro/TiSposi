import type { StorageProvider } from "../../src/types";
import { getServiceSupabaseClient } from "./supabase";

export interface EventRecord {
  id: string;
  public_id: string;
  title: string;
  spouses: string;
  storage_provider: StorageProvider;
  google_drive_folder_id: string | null;
}

export async function getEventByPublicId(publicId: string) {
  const normalized = publicId.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, public_id, title, spouses, storage_provider, google_drive_folder_id",
    )
    .eq("public_id", normalized)
    .maybeSingle<EventRecord>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
