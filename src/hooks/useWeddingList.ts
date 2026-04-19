import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { WeddingListItem, WeddingListFormData } from "../types";

export function useWeddingList(userId: string) {
  const [items, setItems] = useState<WeddingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolveEventId = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data, error: err } = await supabase
      .from("events")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle<{ id: string }>();
    if (err || !data) return null;
    return data.id;
  };

  const fetchItems = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventId = await resolveEventId();
      if (!eventId) {
        setItems([]);
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase!
        .from("wedding_list_items")
        .select("*")
        .eq("event_id", eventId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<WeddingListItem[]>();
      if (err) throw new Error(err.message);
      setItems(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (formData: WeddingListFormData) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const nextOrder =
      items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 0;
    const { data, error: err } = await supabase
      .from("wedding_list_items")
      .insert({ event_id: eventId, ...formData, order: formData.order ?? nextOrder })
      .select()
      .single<WeddingListItem>();
    if (err || !data) throw new Error(err?.message ?? "Errore inserimento.");
    setItems((prev) =>
      [...prev, data].sort((a, b) => a.order - b.order)
    );
  };

  const updateItem = async (id: string, formData: Partial<WeddingListFormData>) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("wedding_list_items")
      .update(formData)
      .eq("id", id)
      .select()
      .single<WeddingListItem>();
    if (err || !data) throw new Error(err?.message ?? "Errore aggiornamento.");
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? data : i))
        .sort((a, b) => a.order - b.order)
    );
  };

  const deleteItem = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from("wedding_list_items")
      .delete()
      .eq("id", id);
    if (err) throw new Error(err.message);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const reorderItem = async (id: string, direction: "up" | "down") => {
    if (!supabase) return;
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];

    await Promise.all([
      supabase
        .from("wedding_list_items")
        .update({ order: b.order })
        .eq("id", a.id),
      supabase
        .from("wedding_list_items")
        .update({ order: a.order })
        .eq("id", b.id),
    ]);

    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id === a.id) return { ...i, order: b.order };
        if (i.id === b.id) return { ...i, order: a.order };
        return i;
      });
      return updated.sort((x, y) => x.order - y.order);
    });
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchItems();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    reorderItem,
    refetch: fetchItems,
  };
}
