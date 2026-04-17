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
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PeopleIcon from "@mui/icons-material/People";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LegalFooter from "../components/LegalFooter";

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
        <Stack spacing={6} alignItems="center">
          <Box sx={{ textAlign: "center", maxWidth: 860, mx: "auto", width: "100%" }}>
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
              Tutto quello che serve per il vostro matrimonio, in un unico
              posto.
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mt: 3, maxWidth: 720, mx: "auto" }}
            >
              RSVP online, galleria pubblica, lista invitati, checklist,
              budget, fornitori e statistiche — tutto integrato in
              un'unica piattaforma riservata agli sposi.
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
                Hai già il link evento?
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

          <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ width: "100%" }}>
            <FeatureCard
              icon={<PhotoLibraryIcon color="primary" fontSize="large" />}
              title="Gallery pubblica"
              body="Gli invitati caricano foto, scrivono dediche e sfogliano la galleria dell'evento dal proprio smartphone."
            />
            <FeatureCard
              icon={<HowToRegIcon color="primary" fontSize="large" />}
              title="RSVP online"
              body="Raccoglie le conferme di presenza con scelta menu, intolleranze e note. Export CSV immediato."
            />
            <FeatureCard
              icon={<CelebrationIcon color="primary" fontSize="large" />}
              title="Pagina evento"
              body="Countdown, storia della coppia, informazioni sulla location, dress code e programma della giornata."
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ width: "100%" }}>
            <FeatureCard
              icon={<PeopleIcon color="primary" fontSize="large" />}
              title="Lista invitati"
              body="Gestisci nome, contatti, tavolo assegnato e stato RSVP di ogni invitato direttamente dalla dashboard."
            />
            <FeatureCard
              icon={<ChecklistIcon color="primary" fontSize="large" />}
              title="Checklist"
              body="Checklist pre-compilata con scadenze dalla firma del contratto al giorno del matrimonio."
            />
            <FeatureCard
              icon={<AccountBalanceWalletIcon color="primary" fontSize="large" />}
              title="Budget tracker"
              body="Tieni traccia di ogni voce di spesa con importo previsto e reale, suddiviso per categoria."
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ width: "100%" }}>
            <FeatureCard
              icon={<BusinessCenterIcon color="primary" fontSize="large" />}
              title="Gestione fornitori"
              body="Centralizza nome, categoria, contatti, importo e stato contratto di ogni fornitore."
            />
            <FeatureCard
              icon={<BarChartIcon color="primary" fontSize="large" />}
              title="Statistiche"
              body="Visite galleria, foto caricate, dediche, RSVP ricevuti e richieste musicali in tempo reale."
            />
            <FeatureCard
              icon={<PhotoLibraryIcon color="primary" fontSize="large" />}
              title="Gestione media"
              body="Elimina singolarmente foto e dediche dalla dashboard. Scarica tutte le foto in ZIP con dediche incluse."
            />
          </Stack>

          <Box sx={{ width: "100%" }}><LegalFooter /></Box>
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
