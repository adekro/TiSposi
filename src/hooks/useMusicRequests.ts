import { useQuery } from "@tanstack/react-query";
import type { MusicRequest } from "../types";

interface MusicRequestsResponse {
  items: MusicRequest[];
}

export function useMusicRequests(publicId: string) {
  return useQuery<MusicRequest[]>({
    queryKey: ["music", publicId],
    queryFn: async () => {
      const res = await fetch(
        `/api/music?publicId=${encodeURIComponent(publicId)}`,
      );
      if (!res.ok) throw new Error("Errore nel recupero della playlist");
      const json = (await res.json()) as MusicRequestsResponse;
      return json.items ?? [];
    },
    enabled: publicId.length > 0,
    refetchInterval: 30_000,
  });
}
