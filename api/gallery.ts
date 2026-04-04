import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'
import type { GalleryItem } from '../src/types'

function getAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Credenziali OAuth2 mancanti (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN)')
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials({ refresh_token: refreshToken })
  return oauth2
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (!folderId) {
    return res.status(500).json({ error: 'GOOGLE_DRIVE_FOLDER_ID non impostata' })
  }

  try {
    const auth = getAuthClient()
    const drive = google.drive({ version: 'v3', auth })

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id,name,mimeType,createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 200,
    })

    const files = response.data.files ?? []
    const items: GalleryItem[] = []

    for (const file of files) {
      if (!file.id || !file.name) continue

      if (file.name.startsWith('dedica_') && file.mimeType === 'text/plain') {
        // Scarica il contenuto del file di testo
        const textRes = await drive.files.get(
          { fileId: file.id, alt: 'media' },
          { responseType: 'text' },
        )
        items.push({
          id: file.id,
          type: 'dedica',
          text: String(textRes.data),
          timestamp: file.createdTime ?? new Date().toISOString(),
        })
      } else if (
        file.mimeType?.startsWith('image/') ||
        file.mimeType === 'application/octet-stream'
      ) {
        // URL CDN Google — pubblicamente accessibile dopo aver impostato permesso anyone:reader
        const url = `https://lh3.googleusercontent.com/d/${file.id}=w1200`
        items.push({
          id: file.id,
          type: 'photo',
          url,
          timestamp: file.createdTime ?? new Date().toISOString(),
        })
      }
    }

    // Cache HTTP: 30s (max-age) con stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json(items)
  } catch (err) {
    console.error('[gallery] Errore:', err)
    return res.status(500).json({ error: 'Errore nel recupero della galleria' })
  }
}
