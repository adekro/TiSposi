import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CelebrationIcon from "@mui/icons-material/Celebration";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [publicId, setPublicId] = useState("");

  const openGallery = () => {
    const normalized = publicId.trim().toLowerCase();
    if (!normalized) return;
    navigate(`/${normalized}/gallery`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(201,167,108,0.18), transparent 40%), linear-gradient(180deg, #faf7f2 0%, #fffdf9 100%)",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Box sx={{ textAlign: "center", maxWidth: 860, mx: "auto" }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: "0.2em",
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              TiSposi Platform
            </Typography>
            <Typography
              variant="h1"
              sx={{
                mt: 2,
                fontSize: { xs: "3rem", md: "4.75rem" },
                lineHeight: 0.95,
              }}
            >
              Crea la tua landing, gestisci l'evento e condividi una gallery
              pubblica.
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mt: 3, maxWidth: 720, mx: "auto" }}
            >
              Iscrizione, area riservata per gli sposi e route pubblica dedicata
              per gli invitati: tutto nello stesso flusso.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate(session ? "/app" : "/auth")}
              >
                {session ? "Apri area riservata" : "Iscriviti ora"}
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={() => navigate("/auth")}
              >
                Accedi
              </Button>
            </Stack>
          </Box>

          <Card
            sx={{ borderRadius: 5, maxWidth: 720, mx: "auto", width: "100%" }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Hai gia il link evento?
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Inserisci il parametro pubblico scelto dagli sposi e apri subito
                la gallery dell'evento.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Parametro pubblico"
                  placeholder="es. marta-luca"
                  value={publicId}
                  onChange={(event) => setPublicId(event.target.value)}
                />
                <Button variant="contained" size="large" onClick={openGallery}>
                  Apri gallery
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <FeatureCard
              icon={<CelebrationIcon color="primary" fontSize="large" />}
              title="Landing + signup"
              body="La home diventa la pagina pubblica del prodotto, con invito all'iscrizione e accesso centralizzato."
            />
            <FeatureCard
              icon={<DashboardCustomizeIcon color="primary" fontSize="large" />}
              title="Area riservata"
              body="Gli sposi salvano titolo evento, nomi, parametro pubblico e provider dei contenuti da un'unica dashboard."
            />
            <FeatureCard
              icon={<PhotoLibraryIcon color="primary" fontSize="large" />}
              title="Gallery pubblica"
              body="Gli invitati usano una route dedicata dell'evento per vedere foto, caricarne di nuove e scrivere dediche."
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card sx={{ flex: 1, borderRadius: 4, minHeight: 220 }}>
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography variant="h5" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{body}</Typography>
      </CardContent>
    </Card>
  );
}
