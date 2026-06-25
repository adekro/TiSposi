import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { RsvpEntry } from "../types";

export interface RsvpStats {
  totalRsvp: number;
  totalAttending: number;
  totalNotAttending: number;
  totalPeople: number;
  menuBreakdown: Record<string, number>;
  logisticsStats: {
    auto: number;
    treno: number;
    aereo: number;
    altro: number;
    noMethod: number;
    needsParking: number;
    needsShuttle: number;
    needsAccommodation: number;
  };
}

export function useRsvp(userId: string) {
  const [entries, setEntries] = useState<RsvpEntry[]>([]);
  const [stats, setStats] = useState<RsvpStats>({
    totalRsvp: 0,
    totalAttending: 0,
    totalNotAttending: 0,
    totalPeople: 0,
    menuBreakdown: {},
    logisticsStats: {
      auto: 0,
      treno: 0,
      aereo: 0,
      altro: 0,
      noMethod: 0,
      needsParking: 0,
      needsShuttle: 0,
      needsAccommodation: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aligning, setAligning] = useState(false);
  const [alignError, setAlignError] = useState("");

  const fetchEntries = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Resolve event_id for this user
      const { data: event, error: eventErr } = await supabase
        .from("events")
        .select("id")
        .eq("owner_user_id", userId)
        .maybeSingle<{ id: string }>();

      if (eventErr) throw new Error(eventErr.message);
      if (!event) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchErr } = await supabase
        .from("rsvp_entries")
        .select("*")
        .eq("event_id", event.id)
        .order("created_at", { ascending: false })
        .returns<RsvpEntry[]>();

      if (fetchErr) throw new Error(fetchErr.message);

      const rows = data ?? [];
      setEntries(rows);

      // Compute stats
      const attending = rows.filter((r) => r.attending);
      const menuBreakdown: Record<string, number> = {};
      for (const r of attending) {
        const key = r.menu_choice?.trim() || "Non specificato";
        menuBreakdown[key] = (menuBreakdown[key] ?? 0) + 1;
      }

      // Fase 13: logistica
      const logisticsStats = {
        auto: attending.filter((r) => r.arrival_method === "auto").length,
        treno: attending.filter((r) => r.arrival_method === "treno").length,
        aereo: attending.filter((r) => r.arrival_method === "aereo").length,
        altro: attending.filter((r) => r.arrival_method === "altro").length,
        noMethod: attending.filter((r) => !r.arrival_method).length,
        needsParking: attending.filter((r) => r.needs_parking).length,
        needsShuttle: attending.filter((r) => r.needs_shuttle).length,
        needsAccommodation: attending.filter((r) => r.needs_accommodation).length,
      };

      setStats({
        totalRsvp: rows.length,
        totalAttending: attending.length,
        totalNotAttending: rows.length - attending.length,
        totalPeople: attending.reduce((sum, r) => sum + r.num_guests, 0),
        menuBreakdown,
        logisticsStats,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchEntries();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const alignEntries = async (mappings: Array<{ entryId: string; guestId: string }>) => {
    if (!supabase || mappings.length === 0) return;

    setAligning(true);
    setAlignError("");

    try {
      const entryIds = mappings.map((mapping) => mapping.entryId);
      const guestIds = mappings.map((mapping) => mapping.guestId);

      if (new Set(entryIds).size !== entryIds.length || new Set(guestIds).size !== guestIds.length) {
        throw new Error("Ogni RSVP e ogni invitato possono essere selezionati una sola volta.");
      }

      const { data: latestEntries, error: latestEntriesError } = await supabase
        .from("rsvp_entries")
        .select("id, guest_id, attending")
        .in("id", entryIds)
        .returns<Array<Pick<RsvpEntry, "id" | "guest_id" | "attending">>>();

      if (latestEntriesError) throw new Error(latestEntriesError.message);

      const latestEntryMap = new Map((latestEntries ?? []).map((entry) => [entry.id, entry]));
      for (const mapping of mappings) {
        const currentEntry = latestEntryMap.get(mapping.entryId);
        if (!currentEntry) throw new Error("Uno degli RSVP selezionati non esiste più.");
        if (currentEntry.guest_id) {
          throw new Error("Uno degli RSVP selezionati è già stato allineato.");
        }
      }

      const { data: occupiedGuests, error: occupiedGuestsError } = await supabase
        .from("rsvp_entries")
        .select("id, guest_id")
        .in("guest_id", guestIds)
        .returns<Array<Pick<RsvpEntry, "id" | "guest_id">>>();

      if (occupiedGuestsError) throw new Error(occupiedGuestsError.message);
      if ((occupiedGuests ?? []).some((entry) => entry.guest_id)) {
        throw new Error("Almeno un invitato selezionato ha già un RSVP collegato.");
      }

      for (const mapping of mappings) {
        const sourceEntry = latestEntryMap.get(mapping.entryId);
        const { error: updateRsvpError } = await supabase
          .from("rsvp_entries")
          .update({ guest_id: mapping.guestId })
          .eq("id", mapping.entryId)
          .is("guest_id", null);

        if (updateRsvpError) throw new Error(updateRsvpError.message);

        const { error: updateGuestError } = await supabase
          .from("guest_list")
          .update({ rsvp_status: sourceEntry?.attending ? "confirmed" : "declined" })
          .eq("id", mapping.guestId);

        if (updateGuestError) throw new Error(updateGuestError.message);
      }

      await fetchEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore durante l'allineamento RSVP.";
      setAlignError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setAligning(false);
    }
  };

  return {
    entries,
    stats,
    loading,
    error,
    aligning,
    alignError,
    unalignedEntries: entries.filter((entry) => !entry.guest_id),
    alignEntries,
    refetch: fetchEntries,
  };
}
