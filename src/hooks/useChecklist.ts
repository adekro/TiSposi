import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ChecklistItem } from "../types";

const DEFAULT_TASKS: Array<{ task: string; due_label: string; due_offset_days: number }> = [
  { task: "Definisci il budget iniziale", due_label: "12 mesi prima", due_offset_days: 365 },
  { task: "Fissa la data del matrimonio", due_label: "12 mesi prima", due_offset_days: 365 },
  { task: "Scegli e prenota la location", due_label: "12 mesi prima", due_offset_days: 365 },
  { task: "Prenota il fotografo / videografo", due_label: "10 mesi prima", due_offset_days: 300 },
  { task: "Scegli il tema e i colori del matrimonio", due_label: "10 mesi prima", due_offset_days: 300 },
  { task: "Scegli e contatta il catering", due_label: "8 mesi prima", due_offset_days: 240 },
  { task: "Compila la lista degli invitati", due_label: "8 mesi prima", due_offset_days: 240 },
  { task: "Scegli l'abito della sposa", due_label: "6 mesi prima", due_offset_days: 180 },
  { task: "Scegli l'abito dello sposo", due_label: "6 mesi prima", due_offset_days: 180 },
  { task: "Prenota il fiorista", due_label: "6 mesi prima", due_offset_days: 180 },
  { task: "Invia gli inviti", due_label: "6 mesi prima", due_offset_days: 180 },
  { task: "Prenota il viaggio di nozze", due_label: "4 mesi prima", due_offset_days: 120 },
  { task: "Conferma il menu con il catering", due_label: "4 mesi prima", due_offset_days: 120 },
  { task: "Conferma tutti i fornitori", due_label: "2 mesi prima", due_offset_days: 60 },
  { task: "Organizza i trasporti per gli ospiti", due_label: "2 mesi prima", due_offset_days: 60 },
  { task: "Finalizza i dettagli della cerimonia", due_label: "1 mese prima", due_offset_days: 30 },
  { task: "Prepara il sitting plan dei tavoli", due_label: "1 mese prima", due_offset_days: 30 },
  { task: "Ultimo fitting abito", due_label: "1 settimana prima", due_offset_days: 7 },
  { task: "Conferma orari con tutti i fornitori", due_label: "1 settimana prima", due_offset_days: 7 },
];

export function useChecklist(userId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
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

      const { data, error: fetchErr } = await supabase!
        .from("checklist_items")
        .select("*")
        .eq("event_id", eventId)
        .order("due_offset_days", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: true })
        .returns<ChecklistItem[]>();

      if (fetchErr) throw new Error(fetchErr.message);

      const rows = data ?? [];

      // Auto-seed if empty
      if (rows.length === 0) {
        const seeds = DEFAULT_TASKS.map((t) => ({ ...t, event_id: eventId, completed: false }));
        const { data: seeded, error: insertErr } = await supabase!
          .from("checklist_items")
          .insert(seeds)
          .select()
          .returns<ChecklistItem[]>();
        if (insertErr) throw new Error(insertErr.message);
        setItems(seeded ?? []);
      } else {
        setItems(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from("checklist_items")
      .update({ completed })
      .eq("id", id);
    if (err) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed } : i)));
  };

  const addItem = async (task: string, dueLabel?: string) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from("checklist_items")
      .insert({ event_id: eventId, task, due_label: dueLabel ?? null, due_offset_days: null, completed: false })
      .select()
      .single<ChecklistItem>();
    if (err || !data) return;
    setItems((prev) => [...prev, data]);
  };

  const deleteItem = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from("checklist_items").delete().eq("id", id);
    if (err) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
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

  return { items, loading, error, toggleComplete, addItem, deleteItem, refetch: fetchItems };
}
