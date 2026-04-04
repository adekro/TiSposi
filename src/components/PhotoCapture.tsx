import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  LinearProgress,
  Typography,
} from '@mui/material'

export interface PhotoCaptureHandle {
  open: () => void
}

interface PhotoCaptureProps {
  onUploaded: () => void
  onError: (msg: string) => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Converte HEIC → JPEG nel browser tramite heic2any (lazy import)
async function maybeConvertHeic(file: File): Promise<File> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')

  if (!isHeic) return file

  const { default: heic2any } = await import('heic2any')
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.88 }) as Blob
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
    type: 'image/jpeg',
  })
}

const PhotoCapture = forwardRef<PhotoCaptureHandle, PhotoCaptureProps>(function PhotoCapture(
  { onUploaded, onError },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    open: () => inputRef.current?.click(),
  }))
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0]
    if (!raw) return

    // Reset input per permettere di selezionare lo stesso file di nuovo
    e.target.value = ''

    try {
      setConverting(true)
      const file = await maybeConvertHeic(raw)

      if (!ALLOWED_TYPES.includes(file.type)) {
        onError(`Formato non supportato: ${file.type}. Usa JPEG, PNG o WebP.`)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        onError('La foto è troppo grande (max 10MB).')
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setSelectedFile(file)
    } catch {
      onError('Errore durante la preparazione della foto.')
    } finally {
      setConverting(false)
    }
  }, [onError])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('photo', selectedFile, selectedFile.name)

      // XMLHttpRequest per avere il progresso upload
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(xhr.responseText))
        }
        xhr.onerror = () => reject(new Error('Errore di rete'))
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

      onUploaded()
      handleClose()
    } catch (err) {
      onError('Errore durante il caricamento. Riprova.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }, [selectedFile, onUploaded, onError])

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setSelectedFile(null)
    setProgress(0)
  }

  return (
    <>
      {/* Input camera nascosto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Overlay conversione HEIC */}
      {converting && (
        <Box
          sx={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
          }}
        >
          <Box textAlign="center" color="white">
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 1 }}>Conversione foto…</Typography>
          </Box>
        </Box>
      )}

      {/* Dialog di anteprima + conferma */}
      <Dialog
        open={!!preview}
        onClose={!uploading ? handleClose : undefined}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: '"Playfair Display", serif' }}>
          Anteprima foto
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          {preview && (
            <Box
              component="img"
              src={preview}
              alt="Anteprima"
              sx={{ width: '100%', borderRadius: 2, maxHeight: 400, objectFit: 'contain' }}
            />
          )}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                Caricamento… {progress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={handleClose} disabled={uploading} color="inherit">
            Annulla
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {uploading ? 'Caricamento…' : 'Carica'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})

export default PhotoCapture
