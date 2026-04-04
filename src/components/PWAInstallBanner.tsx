import { useEffect, useState } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosBanner, setShowIosBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Controlla se già installata (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Android / Chrome: evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari: nessun evento nativo, mostriamo banner manuale
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandalone = ('standalone' in navigator) && (navigator as { standalone?: boolean }).standalone
    if (isIos && !isInStandalone) {
      setShowIosBanner(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed) return null
  if (!deferredPrompt && !showIosBanner) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDismissed(true)
    setDeferredPrompt(null)
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 88,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 420,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: 3,
        zIndex: 1200,
        background: 'linear-gradient(135deg, #FAF7F2, #F5EFE6)',
        border: '1px solid #C9A76C44',
      }}
    >
      <GetAppIcon color="primary" />
      <Box flex={1}>
        {showIosBanner ? (
          <Typography variant="caption" color="text.secondary">
            Premi <strong>Condividi</strong> → <strong>Aggiungi a schermata Home</strong> per installare l'app
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Aggiungi la galleria alla schermata home
          </Typography>
        )}
      </Box>
      {!showIosBanner && (
        <Button size="small" variant="contained" onClick={handleInstall} sx={{ whiteSpace: 'nowrap' }}>
          Installa
        </Button>
      )}
      <Button size="small" color="inherit" onClick={() => setDismissed(true)} sx={{ minWidth: 0, p: 0.5 }}>
        ✕
      </Button>
    </Paper>
  )
}
