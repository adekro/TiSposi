import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GalleryItem, MusicRequest } from "../types";

interface MusicRequestRow {
  id: string;
  song: string;
  artist: string | null;
  requested_by: string | null;
  created_at: string;
  approved: boolean;
}

export function useDashboardGallery(userId: string) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [publicId, setPublicId] = useState("");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const [musicItems, setMusicItems] = useState<MusicRequest[]>([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [approvingMusic, setApprovingMusic] = useState<string | null>(null);
  const [deletingMusic, setDeletingMusic] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: event, error: eventErr } = await supabase!
        .from("events")
        .select("id, public_id")
        .eq("owner_user_id", userId)
        .maybeSingle<{ id: string; public_id: string }>();

      if (eventErr) throw new Error(eventErr.message);
      if (!event) {
        setItems([]);
        setLoading(false);
        return;
      }

      setPublicId(event.public_id);
      setEventId(event.id);

      const res = await fetch(
        `/api/gallery?publicId=${encodeURIComponent(event.public_id)}`,
      );
      if (!res.ok) throw new Error("Errore nel recupero della galleria");

      const json = (await res.json()) as { items: GalleryItem[] };
      setItems(json.items ?? []);

      // Fetch richieste musicali (tutte, incluse non approvate)
      setMusicLoading(true);
      const { data: mData, error: mErr } = await supabase!
        .from("music_requests")
        .select("id, song, artist, requested_by, created_at, approved")
        .eq("event_id", event.id)
        .order("created_at", { ascending: true })
        .returns<MusicRequestRow[]>();

      if (!mErr) {
        setMusicItems(
          (mData ?? []).map((r) => ({
            id: r.id,
            song: r.song,
            artist: r.artist,
            requestedBy: r.requested_by,
            createdAt: r.created_at,
            approved: r.approved,
          })),
        );
      }
      setMusicLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const deleteEntry = useCallback(
    async (id: string): Promise<void> => {
      if (!supabase) throw new Error("Supabase non configurato");

      const {
        data: { session },
      } = await supabase!.auth.getSession();
      if (!session?.access_token) throw new Error("Non autenticato");

      setDeleting(id);
      try {
        const res = await fetch(
          `/api/delete-entry?id=${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? "Errore durante l'eliminazione");
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
      } finally {
        setDeleting(null);
      }
    },
    [],
  );

  const approveMusicEntry = useCallback(
    async (id: string): Promise<void> => {
      if (!supabase) throw new Error("Supabase non configurato");

      const {
        data: { session },
      } = await supabase!.auth.getSession();
      if (!session?.access_token) throw new Error("Non autenticato");

      setApprovingMusic(id);
      try {
        const res = await fetch(
          `/api/music-approve?id=${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? "Errore durante l'approvazione");
        }

        setMusicItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, approved: true } : item,
          ),
        );
      } finally {
        setApprovingMusic(null);
      }
    },
    [],
  );

  const deleteMusicEntry = useCallback(
    async (id: string): Promise<void> => {
      if (!supabase) throw new Error("Supabase non configurato");

      const {
        data: { session },
      } = await supabase!.auth.getSession();
      if (!session?.access_token) throw new Error("Non autenticato");

      setDeletingMusic(id);
      try {
        const res = await fetch(
          `/api/delete-entry?id=${encodeURIComponent(id)}&type=music`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? "Errore durante l'eliminazione");
        }

        setMusicItems((prev) => prev.filter((item) => item.id !== id));
      } finally {
        setDeletingMusic(null);
      }
    },
    [],
  );

  return {
    items,
    publicId,
    eventId,
    loading,
    error,
    deleting,
    deleteEntry,
    musicItems,
    musicLoading,
    approvingMusic,
    deletingMusic,
    approveMusicEntry,
    deleteMusicEntry,
    refetch: fetchItems,
  };
}
