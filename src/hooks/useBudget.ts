import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { BudgetItem } from "../types";

export interface BudgetTotals {
  estimated: number;
  actual: number;
  remaining: number;
}

export type BudgetFormData = Omit<BudgetItem, "id" | "event_id" | "created_at">;

export function useBudget(userId: string) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [totals, setTotals] = useState<BudgetTotals>({ estimated: 0, actual: 0, remaining: 0 });
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

  const computeTotals = (rows: BudgetItem[]): BudgetTotals => {
    const estimated = rows.reduce((sum, r) => sum + Number(r.estimated_amount), 0);
    const actual = rows.reduce((sum, r) => sum + Number(r.actual_amount), 0);
    return { estimated, actual, remaining: estimated - actual };
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
        .from("budget_items")
        .select("*")
        .eq("event_id", eventId)
        .order("category", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<BudgetItem[]>();

      if (fetchErr) throw new Error(fetchErr.message);
      const rows = data ?? [];
      setItems(rows);
      setTotals(computeTotals(rows));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (formData: BudgetFormData) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from("budget_items")
      .insert({ event_id: eventId, ...formData })
      .select()
      .single<BudgetItem>();
    if (err || !data) throw new Error(err?.message ?? "Errore inserimento.");
    const next = [...items, data];
    setItems(next);
    setTotals(computeTotals(next));
  };

  const updateItem = async (id: string, formData: Partial<BudgetFormData>) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("budget_items")
      .update(formData)
      .eq("id", id)
      .select()
      .single<BudgetItem>();
    if (err || !data) throw new Error(err?.message ?? "Errore aggiornamento.");
    const next = items.map((i) => (i.id === id ? data : i));
    setItems(next);
    setTotals(computeTotals(next));
  };

  const deleteItem = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from("budget_items").delete().eq("id", id);
    if (err) throw new Error(err.message);
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    setTotals(computeTotals(next));
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

  return { items, totals, loading, error, addItem, updateItem, deleteItem, refetch: fetchItems };
}
