import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { GuestEntry, RsvpEntry, RsvpStatus } from "../types";

export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
}

export type GuestFormData = Omit<GuestEntry, "id" | "event_id" | "created_at">;

export function useGuestList(userId: string) {
  const [guests, setGuests] = useState<GuestEntry[]>([]);
  const [stats, setStats] = useState<GuestStats>({ total: 0, confirmed: 0, declined: 0, pending: 0 });
  const [rsvpByGuestId, setRsvpByGuestId] = useState<Record<string, RsvpEntry>>({});
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

  const computeStats = (rows: GuestEntry[]): GuestStats => ({
    total: rows.length,
    confirmed: rows.filter((g) => g.rsvp_status === "confirmed").length,
    declined: rows.filter((g) => g.rsvp_status === "declined").length,
    pending: rows.filter((g) => g.rsvp_status === "pending").length,
  });

  const fetchGuests = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventId = await resolveEventId();
      if (!eventId) {
        setGuests([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchErr } = await supabase!
        .from("guest_list")
        .select("*")
        .eq("event_id", eventId)
        .order("full_name", { ascending: true })
        .returns<GuestEntry[]>();

      if (fetchErr) throw new Error(fetchErr.message);
      const rows = data ?? [];
      setGuests(rows);
      setStats(computeStats(rows));

      // Fetch RSVP risposte collegate tramite guest_id
      const guestIds = rows.map((g) => g.id);
      if (guestIds.length > 0 && supabase) {
        const { data: rsvpData } = await supabase
          .from("rsvp_entries")
          .select("*")
          .in("guest_id", guestIds)
          .order("created_at", { ascending: false })
          .returns<RsvpEntry[]>();
        const map: Record<string, RsvpEntry> = {};
        for (const entry of rsvpData ?? []) {
          if (entry.guest_id && !map[entry.guest_id]) {
            map[entry.guest_id] = entry;
          }
        }
        setRsvpByGuestId(map);
      } else {
        setRsvpByGuestId({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const addGuest = async (formData: GuestFormData) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from("guest_list")
      .insert({ event_id: eventId, ...formData })
      .select()
      .single<GuestEntry>();
    if (err || !data) throw new Error(err?.message ?? "Errore inserimento.");
    const next = [...guests, data].sort((a, b) => a.full_name.localeCompare(b.full_name));
    setGuests(next);
    setStats(computeStats(next));
  };

  const updateGuest = async (id: string, formData: Partial<GuestFormData>) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("guest_list")
      .update(formData)
      .eq("id", id)
      .select()
      .single<GuestEntry>();
    if (err || !data) throw new Error(err?.message ?? "Errore aggiornamento.");
    const next = guests.map((g) => (g.id === id ? data : g));
    setGuests(next);
    setStats(computeStats(next));
  };

  const deleteGuest = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from("guest_list").delete().eq("id", id);
    if (err) throw new Error(err.message);
    const next = guests.filter((g) => g.id !== id);
    setGuests(next);
    setStats(computeStats(next));
  };

  const updateStatus = async (id: string, rsvp_status: RsvpStatus) => {
    await updateGuest(id, { rsvp_status });
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchGuests();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { guests, stats, rsvpByGuestId, loading, error, addGuest, updateGuest, deleteGuest, updateStatus, refetch: fetchGuests };
}
