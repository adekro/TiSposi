import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Supplier } from "../types";

export type SupplierFormData = Omit<Supplier, "id" | "event_id" | "created_at">;

export function useSuppliers(userId: string) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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

  const fetchSuppliers = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventId = await resolveEventId();
      if (!eventId) {
        setSuppliers([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchErr } = await supabase!
        .from("suppliers")
        .select("*")
        .eq("event_id", eventId)
        .order("category", { ascending: true })
        .order("name", { ascending: true })
        .returns<Supplier[]>();

      if (fetchErr) throw new Error(fetchErr.message);
      setSuppliers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (formData: SupplierFormData) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from("suppliers")
      .insert({ event_id: eventId, ...formData })
      .select()
      .single<Supplier>();
    if (err || !data) throw new Error(err?.message ?? "Errore inserimento.");
    setSuppliers((prev) => [...prev, data].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
  };

  const updateSupplier = async (id: string, formData: Partial<SupplierFormData>) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("suppliers")
      .update(formData)
      .eq("id", id)
      .select()
      .single<Supplier>();
    if (err || !data) throw new Error(err?.message ?? "Errore aggiornamento.");
    setSuppliers((prev) => prev.map((s) => (s.id === id ? data : s)));
  };

  const deleteSupplier = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from("suppliers").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchSuppliers();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { suppliers, loading, error, addSupplier, updateSupplier, deleteSupplier, refetch: fetchSuppliers };
}
