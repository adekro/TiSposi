// Tipo di dato restituito dall'API /api/gallery
export interface GalleryItem {
  id: string
  type: 'photo' | 'dedica'
  url?: string      // URL immagine CDN Google (solo per type==='photo')
  text?: string     // testo dedica (solo per type==='dedica')
  timestamp: string // ISO 8601
}
