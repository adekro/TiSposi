export type GalleryItemType = "photo" | "dedica";

export type StorageProvider = "google_drive" | "supabase_db";

export interface GalleryItem {
  id: string;
  type: GalleryItemType;
  url?: string;
  text?: string;
  mimeType?: string;
  timestamp: string;
}

export interface PublicEventSummary {
  id: string;
  publicId: string;
  title: string;
  spouses: string;
  storageProvider: StorageProvider;
  // Fase 1: wedding page fields
  weddingDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueMapsUrl?: string | null;
  dresscode?: string | null;
  schedule?: string | null;
  coupleStory?: string | null;
  menu?: string | null;
}

export interface PublicGalleryResponse {
  event: PublicEventSummary;
  items: GalleryItem[];
}

export interface EventSettingsRow {
  id: string;
  owner_user_id: string;
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
}
