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
  // Fase 7: menu strutturato a portate
  menuAntipasto?: string | null;
  menuPrimo?: string | null;
  menuSecondo?: string | null;
  menuContorno?: string | null;
  menuDolce?: string | null;
  menuBevande?: string | null;
  // Fase 8: info logistiche multi-luogo
  ceremonyVenueName?: string | null;
  ceremonyVenueAddress?: string | null;
  ceremonyVenueMapsUrl?: string | null;
  ceremonyTime?: string | null;
  receptionVenueName?: string | null;
  receptionVenueAddress?: string | null;
  receptionVenueMapsUrl?: string | null;
  receptionTime?: string | null;
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
}

// ── Fase 2: RSVP ─────────────────────────────────────────────────────────────
export interface RsvpEntry {
  id: string;
  event_id: string;
  guest_id: string | null;
  guest_name: string;
  attending: boolean;
  num_guests: number;
  menu_choice: string | null;
  dietary_restrictions: string | null;
  notes: string | null;
  created_at: string;
  // Fase 13: logistica ospiti
  arrival_method: "auto" | "treno" | "aereo" | "altro" | null;
  needs_parking: boolean;
  needs_shuttle: boolean;
  needs_accommodation: boolean;
  accommodation_notes: string | null;
}

// Fase 16: campi editabili di rsvp_entries (esclude id, event_id, guest_id, created_at)
export type RsvpFormData = Omit<RsvpEntry, "id" | "event_id" | "guest_id" | "created_at">;

// ── Fase 3: Wedding Planning ──────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  event_id: string;
  task: string;
  due_label: string | null;
  due_offset_days: number | null;
  completed: boolean;
  created_at: string;
}

export type RsvpStatus = "pending" | "confirmed" | "declined";

// ── Fase 6: Music Requests ────────────────────────────────────────────────────
export interface MusicRequest {
  id: string;
  song: string;
  artist: string | null;
  requestedBy: string | null;
  createdAt: string;
  approved: boolean;
}

// ── Fase 11: Gestione tavoli ─────────────────────────────────────────────────
export interface TableEntry {
  id: string;
  event_id: string;
  name: string;
  capacity: number | null;
  notes: string | null;
  order: number;
  created_at: string;
}

export type TableFormData = Omit<TableEntry, "id" | "event_id" | "created_at">;

export interface GuestEntry {
  id: string;
  event_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  table_number: string | null;
  table_id: string | null;
  rsvp_status: RsvpStatus;
  notes: string | null;
  created_at: string;
}

export type ContractStatus = "da_firmare" | "firmato" | "non_necessario";
export type PaymentStatus = "non_pagato" | "acconto" | "saldo_pagato";

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  description: string;
  estimated_amount: number;
  actual_amount: number;
  paid: boolean;
  notes: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  event_id: string;
  name: string;
  category: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contract_status: ContractStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
}

// ── Fase 12: Attività e giochi ──────────────────────────────────────────────
export interface Activity {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  materials: string | null;
  order: number;
  done: boolean;
  created_at: string;
}

export type ActivityFormData = Omit<Activity, "id" | "event_id" | "created_at">;
