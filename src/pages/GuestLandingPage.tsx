import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ChecklistIcon from "@mui/icons-material/Checklist";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useGallery } from "../hooks/useGallery";
import LegalFooter from "../components/LegalFooter";
import PWAInstallBanner from "../components/PWAInstallBanner";

export default function GuestLandingPage() {
  const { publicId = "" } = useParams();
  const theme = useTheme();
  const { data, isLoading, error } = useGallery(publicId);
  const event = data?.event;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
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
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !event) {
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
        <Typography color="text.secondary">Evento non trovato.</Typography>
      </Box>
    );
  }

  const hasBgImage = Boolean(event.landingBgUrl);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PWAInstallBanner />

      {/* ── Hero ── */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "70vh", sm: "80vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          ...(hasBgImage
            ? {
                backgroundImage: `url(${event.landingBgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}33 0%, ${theme.palette.secondary.main}44 100%)`,
              }),
        }}
      >
        {/* Overlay semi-trasparente */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: hasBgImage
              ? "rgba(0,0,0,0.45)"
              : `linear-gradient(180deg, ${theme.palette.background.default}00 0%, ${theme.palette.background.default}88 100%)`,
          }}
        />

        {/* Contenuto hero */}
        <Container
          maxWidth="sm"
          sx={{ position: "relative", textAlign: "center", py: { xs: 6, sm: 8 } }}
        >
          <Typography
            variant="overline"
            sx={{
              color: hasBgImage ? "rgba(255,255,255,0.85)" : theme.palette.primary.main,
              letterSpacing: "0.18em",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            Benvenuti al matrimonio di
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: hasBgImage ? "#ffffff" : theme.palette.text.primary,
              fontSize: { xs: "2.4rem", sm: "3.2rem" },
              lineHeight: 1.15,
              mt: 1,
              mb: 1.5,
              textShadow: hasBgImage ? "0 2px 12px rgba(0,0,0,0.55)" : "none",
            }}
          >
            {event.spouses}
          </Typography>

          {event.weddingDate && (
            <Typography
              variant="h6"
              sx={{
                color: hasBgImage ? "rgba(255,255,255,0.9)" : theme.palette.primary.main,
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: { xs: "1rem", sm: "1.15rem" },
                textShadow: hasBgImage ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
              }}
            >
              {formatDate(event.weddingDate)}
            </Typography>
          )}

          {event.title && event.title !== event.spouses && (
            <Typography
              variant="subtitle1"
              sx={{
                mt: 1,
                color: hasBgImage ? "rgba(255,255,255,0.75)" : theme.palette.text.secondary,
                fontStyle: "italic",
              }}
            >
              {event.title}
            </Typography>
          )}
        </Container>
      </Box>

      {/* ── Navigazione ── */}
      <Box
        sx={{
          background: theme.palette.background.default,
          pt: 5,
          pb: 6,
          flex: 1,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="h6"
            align="center"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: theme.palette.text.secondary,
              mb: 4,
              fontWeight: 400,
              fontSize: "1rem",
              letterSpacing: "0.04em",
            }}
          >
            Scopri tutto quello che abbiamo preparato per voi
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Button
              component={RouterLink}
              to={`/${publicId}/gallery`}
              variant="contained"
              size="large"
              startIcon={<PhotoCameraIcon />}
              sx={{
                py: 2,
                fontSize: "1.05rem",
                borderRadius: 3,
                fontFamily: '"Playfair Display", serif',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 20px ${theme.palette.primary.main}55`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: `0 6px 24px ${theme.palette.primary.main}77`,
                },
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              Galleria foto &amp; dediche
            </Button>

            <Button
              component={RouterLink}
              to={`/${publicId}/rsvp`}
              variant="outlined"
              size="large"
              startIcon={<ChecklistIcon />}
              sx={{
                py: 2,
                fontSize: "1.05rem",
                borderRadius: 3,
                fontFamily: '"Playfair Display", serif',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": {
                  background: `${theme.palette.primary.main}0F`,
                  borderColor: theme.palette.primary.dark,
                  transform: "translateY(-1px)",
                },
                transition: "transform 0.15s",
              }}
            >
              Conferma la tua presenza (RSVP)
            </Button>

            <Button
              component={RouterLink}
              to={`/${publicId}/listanozze`}
              variant="outlined"
              size="large"
              startIcon={<CardGiftcardIcon />}
              sx={{
                py: 2,
                fontSize: "1.05rem",
                borderRadius: 3,
                fontFamily: '"Playfair Display", serif',
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.dark,
                "&:hover": {
                  background: `${theme.palette.secondary.main}0F`,
                  borderColor: theme.palette.secondary.dark,
                  transform: "translateY(-1px)",
                },
                transition: "transform 0.15s",
              }}
            >
              Lista nozze
            </Button>
          </Box>
        </Container>
      </Box>

      <LegalFooter />
    </Box>
  );
}
