import { useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Fab,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useGallery } from "../hooks/useGallery";
import { useQueryClient } from "@tanstack/react-query";
import PhotoGrid from "../components/PhotoGrid";
import PhotoCapture, {
  type PhotoCaptureHandle,
} from "../components/PhotoCapture";
import DedicaDialog from "../components/DedicaDialog";
import MusicRequestDialog from "../components/MusicRequestDialog";
import CountdownWidget from "../components/CountdownWidget";
import WeddingInfoSection from "../components/WeddingInfoSection";
import PWAInstallBanner from "../components/PWAInstallBanner";
import LegalFooter from "../components/LegalFooter";
import { useParams } from "react-router-dom";

export default function GalleryPage() {
  const { publicId = "" } = useParams();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, error } = useGallery(publicId);

  console.log("GalleryPage render", { publicId, data, isLoading, error });
  const items = data?.items ?? [];
  const event = data?.event;

  const captureRef = useRef<PhotoCaptureHandle>(null);
  const [dedicaOpen, setDedicaOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUploaded = () => {
    showSnack("Foto caricata! 🎉 Apparirà nella galleria a breve.");
    void queryClient.invalidateQueries({ queryKey: ["gallery", publicId] });
  };

  const handleDedicaSubmitted = () => {
    showSnack("Dedica inviata! 💌 Grazie per il tuo messaggio.");
    void queryClient.invalidateQueries({ queryKey: ["gallery", publicId] });
  };

  const handleMusicSubmitted = () => {
    showSnack("Richiesta musicale inviata! 🎵 Grazie!");
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.palette.background.default,
        }}
      >
        <Box textAlign="center">
          <CircularProgress color="primary" />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Caricamento galleria in corso...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        pb: 14, // spazio per i FAB
      }}
    >
      {/* ── Hero ── */}
      <Box
        sx={{
          background: `linear-gradient(160deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`,
          borderBottom: `1px solid ${theme.palette.primary.main}33`,
          py: { xs: 4, sm: 6 },
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Indicatore di refresh in corso */}
        {isFetching && !isLoading && (
          <AutorenewIcon
            sx={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: 18,
              color: theme.palette.primary.main,
              opacity: 0.6,
              animation: "spin 1.2s linear infinite",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
        )}

        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: '"Playfair Display", serif',
            color: theme.palette.text.primary,
            letterSpacing: "0.02em",
            mb: 0.5,
          }}
        >
          {event?.title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
        >
          {event?.spouses}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          📸 {items.filter((i) => i.type === "photo").length} foto · ✏️{" "}
          {items.filter((i) => i.type === "dedica").length} dediche
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Condividi questa pagina con gli invitati: /{event?.publicId}/gallery
        </Typography>
      </Box>

      {/* ── Fase 1: Countdown + Info ── */}
      {event && (
        <Container maxWidth="md" sx={{ pt: 3, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {event.weddingDate && (
              <CountdownWidget
                weddingDate={event.weddingDate}
                spouses={event.spouses}
              />
            )}
            <WeddingInfoSection event={event} />
          </Box>
        </Container>
      )}

      {/* ── Galleria ── */}
      <Container maxWidth="md" sx={{ pt: 2, px: { xs: 1.5, sm: 3 } }}>
        <PhotoGrid items={items} loading={isLoading} />
      </Container>

      {/* ── Footer legale ── */}
      <Container maxWidth="md">
        <LegalFooter />
      </Container>

      {/* ── FAB azione foto (primario) ── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1.5,
        }}
      >
        {/* FAB terziario: richiesta musicale */}
        <Tooltip title="Richiesta musicale" placement="left">
          <Fab
            size="medium"
            onClick={() => setMusicOpen(true)}
            aria-label="Richiesta musicale"
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              border: `1px solid`,
              borderColor: "divider",
              boxShadow: 2,
            }}
          >
            <MusicNoteIcon />
          </Fab>
        </Tooltip>

        {/* FAB secondario: dedica */}
        <Tooltip title="Scrivi una dedica" placement="left">
          <Fab
            color="secondary"
            size="medium"
            onClick={() => setDedicaOpen(true)}
            aria-label="Scrivi dedica"
          >
            <EditIcon />
          </Fab>
        </Tooltip>

        {/* FAB principale: foto */}
        <Tooltip title="Scatta una foto" placement="left">
          <Fab
            color="primary"
            size="large"
            onClick={() => captureRef.current?.open()}
            aria-label="Scatta foto"
            sx={{ width: 64, height: 64 }}
          >
            <CameraAltIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      </Box>

      {/* PhotoCapture — nascosto, gestisce camera + upload */}
      <PhotoCapture
        ref={captureRef}
        publicId={publicId}
        onUploaded={handleUploaded}
        onError={(msg) => showSnack(msg, "error")}
      />

      {/* ── Modal dedica ── */}
      <DedicaDialog
        open={dedicaOpen}
        publicId={publicId}
        onClose={() => setDedicaOpen(false)}
        onSubmitted={handleDedicaSubmitted}
        onError={(msg) => showSnack(msg, "error")}
      />

      {/* ── Modal richiesta musicale ── */}
      <MusicRequestDialog
        open={musicOpen}
        publicId={publicId}
        onClose={() => setMusicOpen(false)}
        onSubmitted={handleMusicSubmitted}
        onError={(msg) => showSnack(msg, "error")}
      />

      {/* ── Snackbar feedback ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Banner installazione PWA ── */}
      <PWAInstallBanner />
    </Box>
  );
}
