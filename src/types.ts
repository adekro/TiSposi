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
}
