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
import { CameraAlt as CameraAltIcon } from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import { Autorenew as AutorenewIcon } from "@mui/icons-material";
import { MusicNote as MusicNoteIcon } from "@mui/icons-material";
import { useGallery } from "../hooks/useGallery";
import { useMusicRequests } from "../hooks/useMusicRequests";
import { useQueryClient } from "@tanstack/react-query";
import PhotoGrid from "../components/PhotoGrid";
import PhotoCapture, {
  type PhotoCaptureHandle,
} from "../components/PhotoCapture";
import DedicaDialog from "../components/DedicaDialog";
import MusicRequestDialog from "../components/MusicRequestDialog";
import PlaylistSection from "../components/PlaylistSection";
import CountdownWidget from "../components/CountdownWidget";
import WeddingInfoSection from "../components/WeddingInfoSection";
import PWAInstallBanner from "../components/PWAInstallBanner";
import LegalFooter from "../components/LegalFooter";
import GuestNavbar from "../components/GuestNavbar";
import { useParams } from "react-router-dom";
import { resolveLandingTheme } from "../lib/landingTheme";

export default function GalleryPage() {
  const { publicId = "" } = useParams();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, error } = useGallery(publicId);
  const { data: musicItems = [], isLoading: musicLoading } =
    useMusicRequests(publicId);

  console.log("GalleryPage render", { publicId, data, isLoading, error });
  const items = data?.items ?? [];
  const event = data?.event;
  const palette = resolveLandingTheme(event?.landingConfig?.theme ?? null);
  const headerBgUrl = event?.galleryBgUrl ?? event?.landingBgUrl ?? null;
  const hasHeroBg = Boolean(headerBgUrl);

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
        "--accent-color": palette.accent,
        backgroundColor: palette.pageBackground,
        backgroundImage: palette.pagePattern,
        backgroundSize: "220px 220px",
        backgroundPosition: "center",
        pb: 14, // spazio per i FAB
      }}
    >
      <GuestNavbar publicId={publicId} spouses={event?.spouses} />

      {/* ── Hero ── */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "52vh", sm: "60vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderBottom: `1px solid ${theme.palette.primary.main}33`,
          ...(hasHeroBg
            ? {
                backgroundImage: `url(${headerBgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: palette.heroFallback,
              }),
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: hasHeroBg
              ? "rgba(0,0,0,0.45)"
              : `linear-gradient(180deg, ${theme.palette.background.default}00 0%, ${theme.palette.background.default}88 100%)`,
          }}
        />

        {/* Indicatore di refresh in corso */}
        {isFetching && !isLoading && (
          <AutorenewIcon
            sx={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: 18,
              color: hasHeroBg
                ? theme.palette.common.white
                : theme.palette.primary.main,
              opacity: hasHeroBg ? 0.85 : 0.6,
              animation: "spin 1.2s linear infinite",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
              zIndex: 1,
            }}
          />
        )}

        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            py: { xs: 6, sm: 8 },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: hasHeroBg
                ? "rgba(255,255,255,0.85)"
                : palette.accent,
              letterSpacing: "0.18em",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            Galleria del matrimonio
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: hasHeroBg ? "#ffffff" : palette.textColor,
              fontSize: { xs: "2.3rem", sm: "3rem" },
              lineHeight: 1.15,
              mt: 1,
              mb: 1,
              textShadow: hasHeroBg ? "0 2px 12px rgba(0,0,0,0.55)" : "none",
            }}
          >
            {event?.spouses}
          </Typography>

          {event?.title && event.title !== event.spouses && (
            <Typography
              variant="subtitle1"
              sx={{
                color: hasHeroBg
                  ? "rgba(255,255,255,0.8)"
                  : palette.mutedTextColor,
                fontStyle: "italic",
                mb: 1.5,
                textShadow: hasHeroBg ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
              }}
            >
              {event.title}
            </Typography>
          )}

          <Typography
            variant="body1"
            sx={{
              color: hasHeroBg
                ? "rgba(255,255,255,0.92)"
                : palette.mutedTextColor,
              fontWeight: 500,
              textShadow: hasHeroBg ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
            }}
          >
            📸 {items.filter((i) => i.type === "photo").length} foto · ✏️{" "}
            {items.filter((i) => i.type === "dedica").length} dediche
            {musicItems.length > 0 && ` · 🎵 ${musicItems.length} in playlist`}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: hasHeroBg
                ? "rgba(255,255,255,0.78)"
                : palette.mutedTextColor,
              textShadow: hasHeroBg ? "0 1px 6px rgba(0,0,0,0.35)" : "none",
            }}
          >
            Condividi questa pagina con gli invitati: /{event?.publicId}/gallery
          </Typography>
        </Container>
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

      {/* ── Playlist ── */}
      <Container maxWidth="md" sx={{ pt: 3, px: { xs: 1.5, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Playfair Display", serif',
            mb: 2,
            color: palette.textColor,
          }}
        >
          🎵 Playlist
        </Typography>
        <PlaylistSection items={musicItems} loading={musicLoading} />
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
