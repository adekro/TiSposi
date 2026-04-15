import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <Box component="li" sx={{ mb: 0.5 }}>
      <Typography variant="body1">{children}</Typography>
    </Box>
  );
}

export default function CookiePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(201,167,108,0.14) 0%, rgba(250,247,242,1) 35%, rgba(255,255,255,1) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Indietro
        </Button>

        <Typography variant="h3" sx={{ mb: 0.5 }}>
          Cookie Policy
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Ultimo aggiornamento: 15 aprile 2026
        </Typography>

        <Stack spacing={4} divider={<Divider />}>
          <Section title="1. Cosa sono i cookie">
            <Typography>
              I cookie sono piccoli file di testo che i siti web salvano sul
              dispositivo dell'utente durante la navigazione. Vengono utilizzati
              per garantire il corretto funzionamento del sito, ricordare le
              preferenze dell'utente e, in alcuni casi, raccogliere informazioni
              statistiche o di profilazione.
            </Typography>
          </Section>

          <Section title="2. Cookie utilizzati da TiSposi">
            <Typography sx={{ mb: 2 }}>
              La piattaforma TiSposi utilizza esclusivamente{" "}
              <strong>cookie tecnici e funzionali</strong>, strettamente
              necessari al funzionamento del servizio. Non vengono utilizzati
              cookie di profilazione o marketing.
            </Typography>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {[
                {
                  nome: "sb-access-token / sb-refresh-token",
                  tipo: "Tecnico – sessione",
                  finalità: "Gestione dell'autenticazione utente (Supabase).",
                  durata:
                    "Sessione / 1 ora (access token), fino a 1 anno (refresh token)",
                },
                {
                  nome: "Cookie di preferenza browser",
                  tipo: "Funzionale",
                  finalità:
                    "Memorizzazione delle preferenze locali dell'applicazione (es. prompt installazione PWA).",
                  durata: "Fino alla pulizia del browser",
                },
              ].map((row, i) => (
                <Box
                  key={row.nome}
                  sx={{
                    p: 2,
                    borderTop: i > 0 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {row.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {row.tipo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Finalità: {row.finalità}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Durata: {row.durata}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="3. Cookie di terze parti">
            <Typography sx={{ mb: 1 }}>
              Il sito non carica direttamente cookie di terze parti a scopo
              pubblicitario o di tracciamento. Le terze parti coinvolte nel
              trattamento dei dati (Supabase, Google) possono tuttavia impostare
              i propri cookie tecnici in conformità alle rispettive privacy
              policy:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              <Li>
                Supabase: <strong>https://supabase.com/privacy</strong>
              </Li>
              <Li>
                Google: <strong>https://policies.google.com/privacy</strong>
              </Li>
            </Box>
          </Section>

          <Section title="4. Come gestire o disabilitare i cookie">
            <Typography sx={{ mb: 1 }}>
              Puoi gestire o disabilitare i cookie direttamente dalle
              impostazioni del tuo browser. Ti informiamo che la disabilitazione
              dei cookie tecnici potrebbe compromettere il corretto
              funzionamento della piattaforma (es. impossibilità di mantenere la
              sessione di accesso).
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Istruzioni per i principali browser:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              <Li>
                <strong>Chrome</strong>: Impostazioni → Privacy e sicurezza →
                Cookie e altri dati dei siti.
              </Li>
              <Li>
                <strong>Firefox</strong>: Impostazioni → Privacy e sicurezza →
                Cookie e dati dei siti web.
              </Li>
              <Li>
                <strong>Safari</strong>: Preferenze → Privacy → Gestisci dati
                dei siti web.
              </Li>
              <Li>
                <strong>Edge</strong>: Impostazioni → Cookie e autorizzazioni
                del sito → Cookie e dati del sito.
              </Li>
            </Box>
          </Section>

          <Section title="5. Aggiornamenti alla Cookie Policy">
            <Typography>
              Il titolare si riserva il diritto di aggiornare la presente Cookie
              Policy in qualsiasi momento. Eventuali modifiche sostanziali
              saranno comunicate agli utenti registrati prima della loro entrata
              in vigore.
            </Typography>
          </Section>
        </Stack>
      </Container>
    </Box>
  );
}
