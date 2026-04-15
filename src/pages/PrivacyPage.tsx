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

export default function PrivacyPage() {
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
          Privacy Policy
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Ultimo aggiornamento: 15 aprile 2026
        </Typography>

        <Stack spacing={4} divider={<Divider />}>
          <Section title="1. Titolare del trattamento">
            <Typography>
              Il titolare del trattamento dei dati personali è{" "}
              <strong>Emanuele Croce</strong>, C.F. CRCMNL88R04M109R, con sede
              in Via Fratelli Rosselli 84, 27058 Voghera (PV). Per qualsiasi
              richiesta relativa al trattamento dei dati personali è possibile
              contattare il titolare all'indirizzo email:{" "}
              <strong>e.croce88@gmail.com</strong>.
            </Typography>
          </Section>

          <Section title="2. Dati raccolti e finalità del trattamento">
            <Typography sx={{ mb: 1 }}>
              La piattaforma TiSposi raccoglie le seguenti categorie di dati:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0, mb: 2 }}>
              <Li>
                <strong>Dati di registrazione</strong>: indirizzo email e
                password cifrata. Finalità: creazione e gestione dell'area
                riservata degli sposi.
              </Li>
              <Li>
                <strong>Dati dell'evento</strong>: nome dell'evento, nomi degli
                sposi, parametro pubblico. Finalità: configurazione e
                visualizzazione della galleria pubblica.
              </Li>
              <Li>
                <strong>Contenuti caricati dagli utenti</strong>: fotografie e
                messaggi (dediche) condivisi nell'ambito dell'evento. Le
                fotografie possono contenere immagini di persone fisiche.
              </Li>
            </Box>
            <Typography sx={{ mb: 1 }}>
              Le finalità del trattamento sono:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              <Li>Gestione dell'account e dell'area riservata degli sposi.</Li>
              <Li>
                Condivisione di contenuti (foto, dediche) tra gli invitati
                dell'evento.
              </Li>
              <Li>Funzionamento tecnico e sicurezza della piattaforma.</Li>
            </Box>
          </Section>

          <Section title="3. Base giuridica del trattamento">
            <Typography>
              Il trattamento dei dati si basa sul{" "}
              <strong>consenso esplicito dell'interessato</strong> (art. 6, par.
              1, lett. a del Regolamento UE 2016/679 – GDPR), espresso in fase
              di registrazione attraverso l'accettazione della presente
              informativa. Per i contenuti fotografici caricati dagli invitati,
              la base giuridica è il consenso prestato al momento del
              caricamento mediante apposita dichiarazione.
            </Typography>
          </Section>

          <Section title="4. Responsabili del trattamento e trasferimento dati">
            <Typography sx={{ mb: 1 }}>
              I dati sono trattati con strumenti elettronici e conservati su
              infrastrutture cloud di terze parti nominate responsabili del
              trattamento ai sensi dell'art. 28 GDPR:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              <Li>
                <strong>Supabase Inc.</strong> (USA) — per l'autenticazione
                degli utenti e l'archiviazione dei dati dell'evento. I
                trasferimenti verso gli USA avvengono nel rispetto delle
                garanzie previste dal GDPR (Standard Contractual Clauses).
              </Li>
              <Li>
                <strong>Google LLC</strong> (USA) — per l'archiviazione delle
                fotografie tramite Google Drive. I trasferimenti sono coperti
                dalle Standard Contractual Clauses di Google.
              </Li>
            </Box>
          </Section>

          <Section title="5. Periodo di conservazione">
            <Typography>
              I dati personali sono conservati per tutta la durata del rapporto
              e per un periodo massimo di <strong>12 mesi</strong> dalla
              cancellazione dell'account. I contenuti fotografici sono
              conservati per la durata dell'evento configurata dagli sposi, e
              comunque non oltre 12 mesi dall'ultimo accesso dell'account
              titolare.
            </Typography>
          </Section>

          <Section title="6. Contenuti fotografici e diritti di terzi">
            <Typography>
              L'utente che carica fotografie nella piattaforma dichiara
              espressamente di aver ottenuto il consenso delle persone ritratte
              alla pubblicazione delle immagini all'interno della galleria
              dell'evento. Il titolare non è responsabile per i contenuti
              caricati dagli utenti in violazione di tale dichiarazione.
            </Typography>
          </Section>

          <Section title="7. Diritti dell'interessato">
            <Typography sx={{ mb: 1 }}>
              In qualità di interessato, ai sensi degli artt. 15–22 del GDPR,
              hai il diritto di:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0, mb: 2 }}>
              <Li>Accedere ai tuoi dati personali (art. 15).</Li>
              <Li>Rettificarne l'esattezza (art. 16).</Li>
              <Li>
                Chiederne la cancellazione — "diritto all'oblio" (art. 17).
              </Li>
              <Li>Ottenere la limitazione del trattamento (art. 18).</Li>
              <Li>
                Ricevere i dati in formato strutturato — portabilità (art. 20).
              </Li>
              <Li>Opporti al trattamento (art. 21).</Li>
              <Li>
                Revocare il consenso in qualsiasi momento senza pregiudicare la
                liceità del trattamento precedente (art. 7, par. 3).
              </Li>
            </Box>
            <Typography>
              Per esercitare tali diritti scrivi al titolare all'indirizzo
              indicato nella sezione 1.
            </Typography>
          </Section>

          <Section title="8. Reclamo all'Autorità di controllo">
            <Typography>
              Hai il diritto di proporre reclamo al{" "}
              <strong>Garante per la protezione dei dati personali</strong>{" "}
              (www.garanteprivacy.it), qualora ritieni che il trattamento dei
              tuoi dati avvenga in violazione del GDPR.
            </Typography>
          </Section>
        </Stack>
      </Container>
    </Box>
  );
}
