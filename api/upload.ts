import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'
import { PassThrough } from 'stream'

// Disabilita il bodyParser di Vercel: leggiamo il raw stream direttamente
export const config = {
  api: {
    bodyParser: false,
  },
}

// Tipi MIME ammessi per le foto
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function getAuthClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY non impostata')
  const credentials = JSON.parse(raw)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (!folderId) {
    return res.status(500).json({ error: 'GOOGLE_DRIVE_FOLDER_ID non impostata' })
  }

  const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim()

  try {
    const auth = getAuthClient()
    const drive = google.drive({ version: 'v3', auth })

    // ── Dedica testuale (JSON) ────────────────────────────────────────
    if (contentType === 'application/json') {
      const rawBody = await readRawBody(req)
      const body = JSON.parse(rawBody.toString('utf8')) as { testo?: unknown }
      const testo = typeof body.testo === 'string' ? body.testo.trim() : ''
      if (testo.length < 2 || testo.length > 500) {
        return res.status(400).json({ error: 'Testo non valido (2-500 caratteri)' })
      }

      const timestamp = Date.now()
      const filename = `dedica_${timestamp}.txt`

      const textBuf = Buffer.from(testo, 'utf8')
      const fileStream = new PassThrough()
      fileStream.end(textBuf)
      const uploaded = await drive.files.create({
        requestBody: {
          name: filename,
          parents: [folderId],
          mimeType: 'text/plain',
        },
        media: { mimeType: 'text/plain', body: fileStream },
        fields: 'id,name,createdTime',
      })

      return res.status(200).json({
        id: uploaded.data.id,
        name: uploaded.data.name,
        timestamp: uploaded.data.createdTime,
      })
    }

    // ── Upload foto (binary stream) ───────────────────────────────────
    // Il frontend invia il file direttamente come body binario con Content-Type
    // corretto (niente multipart), evitando qualsiasi parsing complesso.
    if (!ALLOWED_MIME.has(contentType)) {
      return res.status(415).json({
        error: `Tipo file non supportato: ${contentType}. Usa JPEG, PNG o WebP.`,
      })
    }

    const rawBody = await readRawBody(req)

    if (rawBody.length === 0) {
      return res.status(400).json({ error: 'Nessun file ricevuto' })
    }

    if (rawBody.length > MAX_SIZE_BYTES) {
      return res.status(413).json({ error: 'File troppo grande (max 10MB)' })
    }

    const ext = contentType.split('/')[1].replace('jpeg', 'jpg')
    const filename = `photo_${Date.now()}.${ext}`

    const fileStream = new PassThrough()
    fileStream.end(rawBody)
    const uploaded = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
        mimeType: contentType,
      },
      media: { mimeType: contentType, body: fileStream },
      fields: 'id,name,createdTime',
    })

    const fileId = uploaded.data.id!

    // Rendi il file pubblicamente leggibile (anyone: reader)
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    })

    const url = `https://lh3.googleusercontent.com/d/${fileId}=w1200`
    return res.status(200).json({
      id: fileId,
      name: uploaded.data.name,
      url,
      timestamp: uploaded.data.createdTime,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[upload] Errore:', message, err)
    return res.status(500).json({ error: 'Errore durante il caricamento', detail: message })
  }
}
