import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TableEntry, TableFormData } from "../types";

export function useTables(userId: string) {
  const [tables, setTables] = useState<TableEntry[]>([]);
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

  const fetchTables = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventId = await resolveEventId();
      if (!eventId) {
        setTables([]);
        setLoading(false);
        return;
      }
      const { data, error: fetchErr } = await supabase!
        .from("tables")
        .select("*")
        .eq("event_id", eventId)
        .order("order", { ascending: true })
        .order("name", { ascending: true })
        .returns<TableEntry[]>();
      if (fetchErr) throw new Error(fetchErr.message);
      setTables(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const addTable = async (formData: TableFormData) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const nextOrder =
      tables.length > 0 ? Math.max(...tables.map((t) => t.order)) + 1 : 0;
    const { data, error: err } = await supabase
      .from("tables")
      .insert({ event_id: eventId, ...formData, order: formData.order ?? nextOrder })
      .select()
      .single<TableEntry>();
    if (err || !data) throw new Error(err?.message ?? "Errore inserimento.");
    setTables((prev) =>
      [...prev, data].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    );
  };

  const updateTable = async (id: string, formData: Partial<TableFormData>) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("tables")
      .update(formData)
      .eq("id", id)
      .select()
      .single<TableEntry>();
    if (err || !data) throw new Error(err?.message ?? "Errore aggiornamento.");
    setTables((prev) =>
      prev
        .map((t) => (t.id === id ? data : t))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    );
  };

  const deleteTable = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from("tables").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchTables();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { tables, loading, error, addTable, updateTable, deleteTable, refetch: fetchTables };
}
