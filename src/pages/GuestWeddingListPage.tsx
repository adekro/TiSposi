import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { CardGiftcard as CardGiftcardIcon } from "@mui/icons-material";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import GuestNavbar from "../components/GuestNavbar";
import IsolatedHtmlContent from "../components/IsolatedHtmlContent";
import LegalFooter from "../components/LegalFooter";
import PWAInstallBanner from "../components/PWAInstallBanner";
import type { LandingConfig, WeddingListItem } from "../types";
import { resolveLandingTheme } from "../lib/landingTheme";

interface WeddingListPublicResponse {
  event: {
    spouses: string;
    weddingListDescription: string | null;
    weddingListBgUrl: string | null;
    landingBgUrl: string | null;
    landingConfig: LandingConfig | null;
  };
  items: WeddingListItem[];
}

async function fetchWeddingList(
  publicId: string,
): Promise<WeddingListPublicResponse> {
  const res = await fetch(
    `/api/wedding-list?publicId=${encodeURIComponent(publicId)}`,
  );
  if (!res.ok) throw new Error("Errore nel caricamento della lista nozze");
  return res.json() as Promise<WeddingListPublicResponse>;
}

export default function GuestWeddingListPage() {
  const { publicId = "" } = useParams();
  const theme = useTheme();

  const { data, isLoading, error } = useQuery<WeddingListPublicResponse>({
    queryKey: ["wedding-list-public", publicId],
    queryFn: () => fetchWeddingList(publicId),
    enabled: publicId.trim().length > 0,
    staleTime: 60_000,
  });

  const event = data?.event;
  const items = data?.items ?? [];
  const headerBgUrl = event?.weddingListBgUrl ?? event?.landingBgUrl ?? null;
  const hasHeroBg = Boolean(headerBgUrl);
  const palette = resolveLandingTheme(event?.landingConfig?.theme ?? null);

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        "--accent-color": palette.accent,
        display: "flex",
        flexDirection: "column",
        backgroundColor: palette.pageBackground,
        backgroundImage: palette.pagePattern,
        backgroundSize: "220px 220px",
        backgroundPosition: "center",
      }}
    >
      <PWAInstallBanner />
      <GuestNavbar publicId={publicId} spouses={event.spouses} hasWeddingList />

      {/* ── Hero ── */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "48vh", sm: "56vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderBottom: `1px solid ${theme.palette.secondary.main}33`,
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
            Lista nozze
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
            {event.spouses}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: hasHeroBg
                ? "rgba(255,255,255,0.82)"
                : palette.mutedTextColor,
              fontStyle: "italic",
              textShadow: hasHeroBg ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
            }}
          >
            Un pensiero speciale per accompagnare il nostro viaggio insieme
          </Typography>
        </Container>
      </Box>

      {/* ── Contenuto ── */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 4, sm: 6 } }}>
        <IsolatedHtmlContent
          html={event.weddingListDescription}
          sx={{
            mb: 5,
            maxWidth: 600,
            mx: "auto",
            width: "100%",
          }}
        />

        {items.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <CardGiftcardIcon
              sx={{ fontSize: 72, color: theme.palette.text.disabled, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              La lista nozze non è ancora disponibile.
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Torna a controllare più avanti!
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            {items.map((item) => (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: `0 6px 24px ${theme.palette.secondary.main}33`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ flex: 1, pb: 0 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "1.05rem",
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </CardContent>
                {item.url && (
                  <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentAlt} 100%)`,
                        color: "#fff",
                        fontWeight: 600,
                        "&:hover": { opacity: 0.88 },
                      }}
                    >
                      Scopri
                    </Button>
                  </CardActions>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Container>

      <LegalFooter />
    </Box>
  );
}
