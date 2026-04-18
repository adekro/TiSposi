import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TableEntry, TableFormData, TableAssignment } from "../types";

export function useTables(userId: string) {
  const [tables, setTables] = useState<TableEntry[]>([]);
  const [assignments, setAssignments] = useState<TableAssignment[]>([]);
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
        setAssignments([]);
        setLoading(false);
        return;
      }
      const [tablesRes, assignmentsRes] = await Promise.all([
        supabase!
          .from("tables")
          .select("*")
          .eq("event_id", eventId)
          .order("order", { ascending: true })
          .order("name", { ascending: true })
          .returns<TableEntry[]>(),
        supabase!
          .from("table_assignments")
          .select("*")
          .eq("event_id", eventId)
          .returns<TableAssignment[]>(),
      ]);
      if (tablesRes.error) throw new Error(tablesRes.error.message);
      if (assignmentsRes.error) throw new Error(assignmentsRes.error.message);
      setTables(tablesRes.data ?? []);
      setAssignments(assignmentsRes.data ?? []);
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
    setAssignments((prev) => prev.filter((a) => a.table_id !== id));
  };

  const assignGuest = async (guestId: string, tableId: string, numSeats: number) => {
    if (!supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from("table_assignments")
      .insert({ event_id: eventId, guest_id: guestId, table_id: tableId, num_seats: numSeats })
      .select()
      .single<TableAssignment>();
    if (err || !data) throw new Error(err?.message ?? "Errore assegnazione.");
    setAssignments((prev) => [...prev, data]);
  };

  const removeAssignment = async (assignmentId: string) => {
    if (!supabase) return;
    const { error: err } = await supabase
      .from("table_assignments")
      .delete()
      .eq("id", assignmentId);
    if (err) throw new Error(err.message);
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  // Restituisce il totale di posti già assegnati per un invitato su tutti i tavoli
  const assignedSeatsForGuest = (guestId: string): number =>
    assignments
      .filter((a) => a.guest_id === guestId)
      .reduce((sum, a) => sum + a.num_seats, 0);

  // Restituisce i posti ancora disponibili per un invitato
  const remainingSeatsForGuest = (guestId: string, totalSeats: number): number =>
    Math.max(0, totalSeats - assignedSeatsForGuest(guestId));

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

  return {
    tables,
    assignments,
    loading,
    error,
    addTable,
    updateTable,
    deleteTable,
    assignGuest,
    removeAssignment,
    assignedSeatsForGuest,
    remainingSeatsForGuest,
    refetch: fetchTables,
  };
}

