import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../lib/supabase";
import type { EventSettingsRow, StorageProvider } from "../types";

const PUBLIC_ID_PATTERN = /^[a-z0-9]+$/;

export interface EventFormState {
  title: string;
  spouses: string;
  publicId: string;
  storageProvider: StorageProvider;
  googleDriveFolderId: string;
  // Fase 1
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  dresscode: string;
  schedule: string;
  coupleStory: string;
  menu: string;
  // Fase 7
  menuAntipasto: string;
  menuPrimo: string;
  menuSecondo: string;
  menuContorno: string;
  menuDolce: string;
  menuBevande: string;
  // Fase 8
  ceremonyVenueName: string;
  ceremonyVenueAddress: string;
  ceremonyVenueMapsUrl: string;
  ceremonyTime: string;
  receptionVenueName: string;
  receptionVenueAddress: string;
  receptionVenueMapsUrl: string;
  receptionTime: string;
}

const defaultState: EventFormState = {
  title: "",
  spouses: "",
  publicId: "",
  storageProvider: "supabase_db",
  googleDriveFolderId: "",
  weddingDate: "",
  venueName: "",
  venueAddress: "",
  venueMapsUrl: "",
  dresscode: "",
  schedule: "",
  coupleStory: "",
  menu: "",
  menuAntipasto: "",
  menuPrimo: "",
  menuSecondo: "",
  menuContorno: "",
  menuDolce: "",
  menuBevande: "",
  ceremonyVenueName: "",
  ceremonyVenueAddress: "",
  ceremonyVenueMapsUrl: "",
  ceremonyTime: "",
  receptionVenueName: "",
  receptionVenueAddress: "",
  receptionVenueMapsUrl: "",
  receptionTime: "",
};

export function normalizePublicId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildPublicIdFromEmail(email?: string) {
  if (!email) return "";
  return normalizePublicId(email.split("@")[0]);
}

export function useEventSettings(userId: string, userEmail?: string) {
  const [form, setForm] = useState<EventFormState>(defaultState);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase
      .from("events")
      .select(
        "id, owner_user_id, public_id, title, spouses, storage_provider, google_drive_folder_id, wedding_date, venue_name, venue_address, venue_maps_url, dresscode, schedule, couple_story, menu, menu_antipasto, menu_primo, menu_secondo, menu_contorno, menu_dolce, menu_bevande, ceremony_venue_name, ceremony_venue_address, ceremony_venue_maps_url, ceremony_time, reception_venue_name, reception_venue_address, reception_venue_maps_url, reception_time",
      )
      .eq("owner_user_id", userId)
      .maybeSingle<EventSettingsRow>()
      .then(({ data, error: loadError }) => {
        if (!active) return;

        if (loadError) {
          setError(loadError.message);
        }

        if (data) {
          setEventId(data.id);
          setForm({
            title: data.title,
            spouses: data.spouses,
            publicId: data.public_id,
            storageProvider: data.storage_provider,
            googleDriveFolderId: data.google_drive_folder_id ?? "",
            weddingDate: data.wedding_date ?? "",
            venueName: data.venue_name ?? "",
            venueAddress: data.venue_address ?? "",
            venueMapsUrl: data.venue_maps_url ?? "",
            dresscode: data.dresscode ?? "",
            schedule: data.schedule ?? "",
            coupleStory: data.couple_story ?? "",
            menu: data.menu ?? "",
            menuAntipasto: data.menu_antipasto ?? "",
            menuPrimo: data.menu_primo ?? "",
            menuSecondo: data.menu_secondo ?? "",
            menuContorno: data.menu_contorno ?? "",
            menuDolce: data.menu_dolce ?? "",
            menuBevande: data.menu_bevande ?? "",
            ceremonyVenueName: data.ceremony_venue_name ?? "",
            ceremonyVenueAddress: data.ceremony_venue_address ?? "",
            ceremonyVenueMapsUrl: data.ceremony_venue_maps_url ?? "",
            ceremonyTime: data.ceremony_time ?? "",
            receptionVenueName: data.reception_venue_name ?? "",
            receptionVenueAddress: data.reception_venue_address ?? "",
            receptionVenueMapsUrl: data.reception_venue_maps_url ?? "",
            receptionTime: data.reception_time ?? "",
          });
        } else {
          const defaultPublicId = buildPublicIdFromEmail(userEmail);
          setForm((current) => ({ ...current, publicId: defaultPublicId }));
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, userEmail]);

  const normalizedPublicId = form.publicId.trim().toLowerCase();
  const publicUrl = normalizedPublicId
    ? `${window.location.origin}/${normalizedPublicId}/gallery`
    : "";
  const rsvpUrl = normalizedPublicId
    ? `${window.location.origin}/${normalizedPublicId}/rsvp`
    : "";
  const landingUrl = normalizedPublicId
    ? `${window.location.origin}/${normalizedPublicId}/landing`
    : "";
  const publicIdValid = PUBLIC_ID_PATTERN.test(normalizedPublicId);

  const updateField = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!supabase) {
      setError("Supabase non configurato nel client.");
      return;
    }

    const title = form.title.trim();
    const spouses = form.spouses.trim();
    const googleDriveFolderId = form.googleDriveFolderId.trim();

    if (!title || !spouses || !publicIdValid) {
      setError("Compila titolo, sposi e un parametro pubblico valido.");
      return;
    }

    if (form.storageProvider === "google_drive" && !googleDriveFolderId) {
      setError(
        "Inserisci la cartella Google Drive per usare il provider Drive.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      owner_user_id: userId,
      title,
      spouses,
      public_id: normalizedPublicId,
      storage_provider: form.storageProvider,
      google_drive_folder_id:
        form.storageProvider === "google_drive" ? googleDriveFolderId : null,
      wedding_date: form.weddingDate || null,
      venue_name: form.venueName.trim() || null,
      venue_address: form.venueAddress.trim() || null,
      venue_maps_url: form.venueMapsUrl.trim() || null,
      dresscode: form.dresscode.trim() || null,
      schedule: form.schedule.trim() || null,
      couple_story: form.coupleStory.trim() || null,
      menu: form.menu.trim() || null,
      menu_antipasto: form.menuAntipasto.trim() || null,
      menu_primo: form.menuPrimo.trim() || null,
      menu_secondo: form.menuSecondo.trim() || null,
      menu_contorno: form.menuContorno.trim() || null,
      menu_dolce: form.menuDolce.trim() || null,
      menu_bevande: form.menuBevande.trim() || null,
      ceremony_venue_name: form.ceremonyVenueName.trim() || null,
      ceremony_venue_address: form.ceremonyVenueAddress.trim() || null,
      ceremony_venue_maps_url: form.ceremonyVenueMapsUrl.trim() || null,
      ceremony_time: form.ceremonyTime.trim() || null,
      reception_venue_name: form.receptionVenueName.trim() || null,
      reception_venue_address: form.receptionVenueAddress.trim() || null,
      reception_venue_maps_url: form.receptionVenueMapsUrl.trim() || null,
      reception_time: form.receptionTime.trim() || null,
    };

    const { error: upsertError } = await supabase
      .from("events")
      .upsert(payload, { onConflict: "owner_user_id" });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setMessage("Configurazione salvata.");
    setSaving(false);
  };

  const handleDownloadQr = async () => {
    if (!publicUrl) return;
    const qrUrl = eventId
      ? `${window.location.origin}/e/${eventId}`
      : publicUrl;
    const dataUrl = await QRCode.toDataURL(qrUrl, {
      width: 512,
      margin: 2,
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode-${normalizedPublicId}.png`;
    link.click();
  };

  const handleDownloadRsvpQr = async () => {
    if (!rsvpUrl) return;
    const qrRsvpUrl = eventId
      ? `${window.location.origin}/e/${eventId}/rsvp`
      : rsvpUrl;
    const dataUrl = await QRCode.toDataURL(qrRsvpUrl, {
      width: 512,
      margin: 2,
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode-rsvp-${normalizedPublicId}.png`;
    link.click();
  };

  return {
    form,
    updateField,
    loading,
    saving,
    error,
    message,
    eventId,
    normalizedPublicId,
    publicUrl,
    rsvpUrl,
    landingUrl,
    publicIdValid,
    handleSave,
    handleDownloadQr,
    handleDownloadRsvpQr,
  };
}
