import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface EventStats {
  visitCount: number;
  photoCount: number;
  dedicaCount: number;
  rsvpCount: number;
  musicCount: number;
  guestCount: number;
}

export function useStats(userId: string) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: event, error: eventErr } = await supabase!
          .from("events")
          .select("id, visit_count")
          .eq("owner_user_id", userId)
          .maybeSingle<{ id: string; visit_count: number }>();

        if (eventErr) throw new Error(eventErr.message);
        if (!event) {
          setStats(null);
          setLoading(false);
          return;
        }

        const [photosRes, dedicheRes, rsvpRes, musicRes, guestRes] =
          await Promise.all([
            supabase!
              .from("gallery_entries")
              .select("*", { count: "exact", head: true })
              .eq("event_id", event.id)
              .eq("type", "photo"),
            supabase!
              .from("gallery_entries")
              .select("*", { count: "exact", head: true })
              .eq("event_id", event.id)
              .eq("type", "dedica"),
            supabase!
              .from("rsvp_entries")
              .select("*", { count: "exact", head: true })
              .eq("event_id", event.id),
            supabase!
              .from("music_requests")
              .select("*", { count: "exact", head: true })
              .eq("event_id", event.id),
            supabase!
              .from("guest_list")
              .select("*", { count: "exact", head: true })
              .eq("event_id", event.id),
          ]);

        setStats({
          visitCount: event.visit_count ?? 0,
          photoCount: photosRes.count ?? 0,
          dedicaCount: dedicheRes.count ?? 0,
          rsvpCount: rsvpRes.count ?? 0,
          musicCount: musicRes.count ?? 0,
          guestCount: guestRes.count ?? 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore sconosciuto");
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [userId]);

  return { stats, loading, error };
}
