import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { RsvpEntry } from "../types";

export interface RsvpStats {
  totalRsvp: number;
  totalAttending: number;
  totalNotAttending: number;
  totalPeople: number;
  menuBreakdown: Record<string, number>;
}

export function useRsvp(userId: string) {
  const [entries, setEntries] = useState<RsvpEntry[]>([]);
  const [stats, setStats] = useState<RsvpStats>({
    totalRsvp: 0,
    totalAttending: 0,
    totalNotAttending: 0,
    totalPeople: 0,
    menuBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      setStats({
        totalRsvp: rows.length,
        totalAttending: attending.length,
        totalNotAttending: rows.length - attending.length,
        totalPeople: attending.reduce((sum, r) => sum + r.num_guests, 0),
        menuBreakdown,
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

  return { entries, stats, loading, error, refetch: fetchEntries };
}
