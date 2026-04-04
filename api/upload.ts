import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'
import { Readable } from 'stream'

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

// Legge il body raw come Buffer (Vercel disabilita bodyParser per multipart)
async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Estrae boundary dal Content-Type header
function getBoundary(contentType: string): string {
  const match = contentType.match(/boundary=([^;]+)/)
  if (!match) throw new Error('boundary non trovato nel Content-Type')
  return match[1].trim()
}

interface ParsedPart {
  name: string
  filename?: string
  mimeType?: string
  data: Buffer
}

// Parser multipart minimo — sufficiente per il nostro caso d'uso single-file
function parseMultipart(body: Buffer, boundary: string): ParsedPart[] {
  const parts: ParsedPart[] = []
  const sep = Buffer.from(`--${boundary}`)
  const CRLF = Buffer.from('\r\n')

  let offset = 0
  while (offset < body.length) {
    const sepIdx = body.indexOf(sep, offset)
    if (sepIdx === -1) break
    offset = sepIdx + sep.length

    // Fine multipart
    if (body.slice(offset, offset + 2).toString() === '--') break

    // Salta \r\n dopo il boundary
    if (body.slice(offset, offset + 2).toString() === '\r\n') offset += 2

    // Leggi headers della parte
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), offset)
    if (headerEnd === -1) break
    const headerStr = body.slice(offset, headerEnd).toString('utf8')
    offset = headerEnd + 4

    // Trova il prossimo boundary per delimitare il corpo
    const nextSepIdx = body.indexOf(sep, offset)
    const partEnd = nextSepIdx === -1 ? body.length : nextSepIdx - 2 // -2 per \r\n prima di --boundary

    const partData = body.slice(offset, partEnd)
    offset = nextSepIdx === -1 ? body.length : nextSepIdx

    // Estrai name, filename, content-type dagli header
    const dispositionMatch = headerStr.match(/Content-Disposition:[^\r\n]*name="([^"]+)"/)
    const filenameMatch = headerStr.match(/filename="([^"]+)"/)
    const mimeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/)

    if (!dispositionMatch) continue

    parts.push({
      name: dispositionMatch[1],
      filename: filenameMatch?.[1],
      mimeType: mimeMatch?.[1].trim(),
      data: partData,
    })
  }
  return parts
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (!folderId) {
    return res.status(500).json({ error: 'GOOGLE_DRIVE_FOLDER_ID non impostata' })
  }

  const contentType = req.headers['content-type'] ?? ''

  try {
    const auth = getAuthClient()
    const drive = google.drive({ version: 'v3', auth })

    // ── Dedica testuale ───────────────────────────────────────────────
    if (contentType.includes('application/json')) {
      const body = req.body as { testo?: unknown }
      const testo = typeof body.testo === 'string' ? body.testo.trim() : ''
      if (testo.length < 2 || testo.length > 500) {
        return res.status(400).json({ error: 'Testo non valido (2-500 caratteri)' })
      }

      const timestamp = Date.now()
      const filename = `dedica_${timestamp}.txt`

      const fileStream = Readable.from([Buffer.from(testo, 'utf8')])
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

    // ── Upload foto (multipart/form-data) ────────────────────────────
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type non supportato' })
    }

    const boundary = getBoundary(contentType)
    const rawBody = await readRawBody(req)

    if (rawBody.length > MAX_SIZE_BYTES) {
      return res.status(413).json({ error: 'File troppo grande (max 10MB)' })
    }

    const parts = parseMultipart(rawBody, boundary)
    const filePart = parts.find((p) => p.name === 'photo' && p.filename)

    if (!filePart) {
      return res.status(400).json({ error: 'Nessun file foto trovato nel form' })
    }

    // Validazione MIME lato server
    const mime = filePart.mimeType ?? ''
    if (!ALLOWED_MIME.has(mime)) {
      return res.status(415).json({
        error: `Tipo file non supportato: ${mime}. Usa JPEG, PNG o WebP.`,
      })
    }

    // Genera nome file sicuro con timestamp
    const ext = mime.split('/')[1].replace('jpeg', 'jpg')
    const filename = `photo_${Date.now()}.${ext}`

    const fileStream = Readable.from([filePart.data])
    const uploaded = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
        mimeType: mime,
      },
      media: { mimeType: mime, body: fileStream },
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
    console.error('[upload] Errore:', err)
    return res.status(500).json({ error: 'Errore durante il caricamento' })
  }
}

// Disabilita il body parser di Vercel per gestire manualmente il multipart
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '11mb',
    },
  },
}
