import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GalleryItem } from "../types";

export function useDashboardGallery(userId: string) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [publicId, setPublicId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

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
        .select("public_id")
        .eq("owner_user_id", userId)
        .maybeSingle<{ public_id: string }>();

      if (eventErr) throw new Error(eventErr.message);
      if (!event) {
        setItems([]);
        setLoading(false);
        return;
      }

      setPublicId(event.public_id);

      const res = await fetch(
        `/api/gallery?publicId=${encodeURIComponent(event.public_id)}`,
      );
      if (!res.ok) throw new Error("Errore nel recupero della galleria");

      const json = (await res.json()) as { items: GalleryItem[] };
      setItems(json.items ?? []);
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

  return { items, publicId, loading, error, deleting, deleteEntry, refetch: fetchItems };
}
