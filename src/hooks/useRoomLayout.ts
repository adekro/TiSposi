import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type {
  RoomLayout,
  TablePosition,
  GuestIcon,
  RoomLayoutFormData,
  TablePositionFormData,
  GuestIconFormData,
} from "../types";

interface SaveLayoutPayload {
  layout: RoomLayoutFormData;
  tablePositions: Record<string, TablePositionFormData>;
  guestIcons: Record<string, GuestIconFormData>;
}

export function useRoomLayout(userId: string) {
  const [layout, setLayout] = useState<RoomLayout | null>(null);
  const [tablePositions, setTablePositions] = useState<TablePosition[]>([]);
  const [guestIcons, setGuestIcons] = useState<GuestIcon[]>([]);
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

  const fetchLayout = async () => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventId = await resolveEventId();
      if (!eventId) {
        setLayout(null);
        setTablePositions([]);
        setGuestIcons([]);
        setLoading(false);
        return;
      }

      // Fetch layout
      const { data: layoutData, error: layoutErr } = await supabase
        .from("room_layouts")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle<RoomLayout>();

      if (layoutErr) throw new Error(layoutErr.message);

      if (!layoutData) {
        setLayout(null);
        setTablePositions([]);
        setGuestIcons([]);
        setLoading(false);
        return;
      }

      setLayout(layoutData);

      // Fetch table positions
      const { data: positionsData, error: positionsErr } = await supabase
        .from("table_positions")
        .select("*")
        .eq("layout_id", layoutData.id)
        .returns<TablePosition[]>();

      if (positionsErr) throw new Error(positionsErr.message);
      setTablePositions(positionsData ?? []);

      // Fetch guest icons
      const { data: iconsData, error: iconsErr } = await supabase
        .from("guest_icons")
        .select("*")
        .eq("layout_id", layoutData.id)
        .returns<GuestIcon[]>();

      if (iconsErr) throw new Error(iconsErr.message);
      setGuestIcons(iconsData ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (payload: SaveLayoutPayload) => {
    if (!userId || !supabase) throw new Error("Utente non autenticato.");
    const eventId = await resolveEventId();
    if (!eventId) throw new Error("Evento non trovato.");

    // Upsert layout
    const { data: layoutData, error: layoutErr } = await supabase
      .from("room_layouts")
      .upsert(
        { event_id: eventId, ...payload.layout, updated_at: new Date().toISOString() },
        { onConflict: "event_id" }
      )
      .select()
      .single<RoomLayout>();

    if (layoutErr || !layoutData) {
      throw new Error(layoutErr?.message ?? "Errore salvataggio layout.");
    }

    // Upsert table positions
    const positionsToUpsert = Object.entries(payload.tablePositions).map(
      ([tableId, pos]) => ({
        layout_id: layoutData.id,
        table_id: tableId,
        ...pos,
        updated_at: new Date().toISOString(),
      })
    );

    if (positionsToUpsert.length > 0) {
      const { error: posErr } = await supabase
        .from("table_positions")
        .upsert(positionsToUpsert, { onConflict: "layout_id,table_id" });
      if (posErr) throw new Error(posErr.message);
    }

    // Upsert guest icons
    const iconsToUpsert = Object.entries(payload.guestIcons).map(
      ([guestId, icon]) => ({
        layout_id: layoutData.id,
        guest_id: guestId,
        ...icon,
        updated_at: new Date().toISOString(),
      })
    );

    if (iconsToUpsert.length > 0) {
      const { error: iconsErr } = await supabase
        .from("guest_icons")
        .upsert(iconsToUpsert, { onConflict: "layout_id,guest_id" });
      if (iconsErr) throw new Error(iconsErr.message);
    }

    // Refresh data
    await fetchLayout();
  };

  const deleteTablePosition = async (tableId: string) => {
    if (!supabase || !layout) return;
    const { error: err } = await supabase
      .from("table_positions")
      .delete()
      .eq("layout_id", layout.id)
      .eq("table_id", tableId);
    if (err) throw new Error(err.message);
    setTablePositions((prev) => prev.filter((p) => p.table_id !== tableId));
  };

  const deleteGuestIcon = async (guestId: string) => {
    if (!supabase || !layout) return;
    const { error: err } = await supabase
      .from("guest_icons")
      .delete()
      .eq("layout_id", layout.id)
      .eq("guest_id", guestId);
    if (err) throw new Error(err.message);
    setGuestIcons((prev) => prev.filter((i) => i.guest_id !== guestId));
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchLayout();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    layout,
    tablePositions,
    guestIcons,
    loading,
    error,
    saveLayout,
    deleteTablePosition,
    deleteGuestIcon,
    refetch: fetchLayout,
  };
}
