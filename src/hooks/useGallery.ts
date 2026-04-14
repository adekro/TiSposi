import { useQuery } from "@tanstack/react-query";
import type { PublicGalleryResponse } from "../types";

async function fetchGallery(publicId: string): Promise<PublicGalleryResponse> {
  const res = await fetch(
    `/api/gallery?publicId=${encodeURIComponent(publicId)}`,
  );
  if (!res.ok) throw new Error("Errore nel caricamento della galleria");
  return res.json() as Promise<PublicGalleryResponse>;
}

export function useGallery(publicId: string) {
  return useQuery<PublicGalleryResponse>({
    queryKey: ["gallery", publicId],
    queryFn: () => fetchGallery(publicId),
    enabled: publicId.trim().length > 0,
    refetchInterval: 30_000, // polling ogni 30 secondi
    staleTime: 30_000,
  });
}
