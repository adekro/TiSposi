import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { LandingConfig } from "../types";

interface LandingConfigResponse {
  eventId: string;
  landingConfig: LandingConfig | null;
}

async function fetchLandingConfig(userId: string): Promise<LandingConfigResponse | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("events")
    .select("id, landing_config")
    .eq("owner_user_id", userId)
    .maybeSingle<{ id: string; landing_config: LandingConfig | null }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    eventId: data.id,
    landingConfig: data.landing_config,
  };
}

async function saveLandingConfig(eventId: string, landingConfig: LandingConfig) {
  if (!supabase) {
    throw new Error("Supabase non configurato nel client.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Sessione non valida.");
  }

  const response = await fetch("/api/admin/landing-config", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      eventId,
      landingConfig,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Errore nel salvataggio landing.");
  }
}

export function useLandingConfig(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["landing-config", userId],
    queryFn: () => fetchLandingConfig(userId),
    enabled: userId.trim().length > 0,
  });

  const mutation = useMutation({
    mutationFn: async ({ eventId, landingConfig }: { eventId: string; landingConfig: LandingConfig }) => {
      await saveLandingConfig(eventId, landingConfig);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["landing-config", userId] });
      await queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  const eventId = query.data?.eventId ?? "";
  const landingConfig = query.data?.landingConfig ?? null;

  return useMemo(
    () => ({
      ...query,
      eventId,
      landingConfig,
      save: mutation.mutateAsync,
      isSaving: mutation.isPending,
      saveError: mutation.error,
    }),
    [eventId, landingConfig, mutation.error, mutation.isPending, mutation.mutateAsync, query],
  );
}
