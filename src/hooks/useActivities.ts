import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Activity, ActivityFormData } from "../types";

export function useActivities(userId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
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

  const fetchActivities = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventId = await resolveEventId();
      if (!eventId) {
        setActivities([]);
        setLoading(false);
        return;
      }
      const { data, error: fetchErr } = await supabase!
        .from("activities")
        .select("*")
        .eq("event_id", eventId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<Activity[]>();
      if (fetchErr) throw new Error(fetchErr.message);
      setActivities(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (formData: ActivityFormData) => {
    if (!userId || !supabase) return;
    const eventId = await resolveEventId();
    if (!eventId) return;
    const { data, error: err } = await supabase
      .from("activities")
      .insert({ event_id: eventId, ...formData })
      .select()
      .single<Activity>();
    if (err || !data) throw new Error(err?.message ?? "Errore inserimento.");
    setActivities((prev) => [...prev, data]);
  };

  const updateActivity = async (id: string, formData: Partial<ActivityFormData>) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("activities")
      .update(formData)
      .eq("id", id)
      .select()
      .single<Activity>();
    if (err || !data) throw new Error(err?.message ?? "Errore aggiornamento.");
    setActivities((prev) => prev.map((a) => (a.id === id ? data : a)));
  };

  const deleteActivity = async (id: string) => {
    if (!supabase) return;
    const { error: err } = await supabase.from("activities").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchActivities();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { activities, loading, error, addActivity, updateActivity, deleteActivity, refetch: fetchActivities };
}
