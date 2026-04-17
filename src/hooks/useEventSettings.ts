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
}

const defaultState: EventFormState = {
  title: "",
  spouses: "",
  publicId: "",
  storageProvider: "supabase_db",
  googleDriveFolderId: "",
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
        "id, owner_user_id, public_id, title, spouses, storage_provider, google_drive_folder_id",
      )
      .eq("owner_user_id", userId)
      .maybeSingle<EventSettingsRow>()
      .then(({ data, error: loadError }) => {
        if (!active) return;

        if (loadError) {
          setError(loadError.message);
        }

        if (data) {
          setForm({
            title: data.title,
            spouses: data.spouses,
            publicId: data.public_id,
            storageProvider: data.storage_provider,
            googleDriveFolderId: data.google_drive_folder_id ?? "",
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
    const dataUrl = await QRCode.toDataURL(publicUrl, {
      width: 512,
      margin: 2,
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode-${normalizedPublicId}.png`;
    link.click();
  };

  return {
    form,
    updateField,
    loading,
    saving,
    error,
    message,
    normalizedPublicId,
    publicUrl,
    publicIdValid,
    handleSave,
    handleDownloadQr,
  };
}
