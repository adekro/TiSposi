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
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GuestNavbar from "../components/GuestNavbar";
import LegalFooter from "../components/LegalFooter";
import PWAInstallBanner from "../components/PWAInstallBanner";
import type { WeddingListItem } from "../types";

interface WeddingListPublicResponse {
  event: {
    spouses: string;
    weddingListDescription: string | null;
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
        display: "flex",
        flexDirection: "column",
        background: theme.palette.background.default,
      }}
    >
      <PWAInstallBanner />
      <GuestNavbar publicId={publicId} spouses={event.spouses} hasWeddingList />

      {/* ── Header ── */}
      <Box
        sx={{
          background: `linear-gradient(160deg, ${theme.palette.secondary.main}22 0%, ${theme.palette.primary.main}22 100%)`,
          borderBottom: `1px solid ${theme.palette.secondary.main}33`,
          py: { xs: 4, sm: 6 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: theme.palette.text.secondary,
            letterSpacing: "0.18em",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        >
          Lista Nozze
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontFamily: '"Playfair Display", serif',
            color: theme.palette.text.primary,
            fontSize: { xs: "2rem", sm: "2.8rem" },
            mt: 0.5,
            mb: 0.5,
          }}
        >
          {event.spouses}
        </Typography>
      </Box>

      {/* ── Contenuto ── */}
      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, sm: 6 } }}>
        {event.weddingListDescription && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: "center",
              mb: 5,
              fontStyle: "italic",
              lineHeight: 1.8,
              fontSize: "1rem",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            {event.weddingListDescription}
          </Typography>
        )}

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
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
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
                      sx={{ fontFamily: '"Playfair Display", serif', fontSize: "1.05rem" }}
                    >
                      {item.title}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    )}
                  </CardContent>
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
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                        color: theme.palette.secondary.contrastText,
                        fontWeight: 600,
                        "&:hover": { opacity: 0.88 },
                      }}
                    >
                      Scopri
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <LegalFooter />
    </Box>
  );
}
