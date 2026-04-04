import { useQuery } from '@tanstack/react-query'
import type { GalleryItem } from '../types'

async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch('/api/gallery')
  if (!res.ok) throw new Error('Errore nel caricamento della galleria')
  return res.json() as Promise<GalleryItem[]>
}

export function useGallery() {
  return useQuery<GalleryItem[]>({
    queryKey: ['gallery'],
    queryFn: fetchGallery,
    refetchInterval: 30_000, // polling ogni 30 secondi
    staleTime: 30_000,
    placeholderData: [],
  })
}
