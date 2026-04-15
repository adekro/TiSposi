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

export default function TerminiPage() {
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
          Termini e Condizioni
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Ultimo aggiornamento: 15 aprile 2026
        </Typography>

        <Stack spacing={4} divider={<Divider />}>
          <Section title="1. Descrizione del servizio">
            <Typography>
              TiSposi è una piattaforma web che consente agli sposi di creare
              un'area riservata per gestire il proprio evento matrimoniale,
              configurare una galleria pubblica e permettere agli invitati di
              caricare foto e scrivere dediche. Il servizio è fornito da{" "}
              <strong>Emanuele Croce</strong>, C.F. CRCMNL88R04M109R, Via
              Fratelli Rosselli 84, 27058 Voghera (PV).
            </Typography>
          </Section>

          <Section title="2. Accettazione delle condizioni">
            <Typography>
              L'utilizzo della piattaforma TiSposi implica l'accettazione
              integrale dei presenti Termini e Condizioni. In fase di
              registrazione l'utente ne prende visione e ne accetta
              espressamente il contenuto. Qualora non si accettino i presenti
              termini, è necessario astenersi dall'utilizzo del servizio.
            </Typography>
          </Section>

          <Section title="3. Creazione dell'account">
            <Typography sx={{ mb: 1 }}>
              Per accedere all'area riservata è necessario registrarsi fornendo
              un indirizzo email valido e una password. L'utente si impegna a:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              <Li>
                Fornire informazioni veritiere e aggiornate in fase di
                registrazione.
              </Li>
              <Li>
                Mantenere riservate le credenziali di accesso e non cederle a
                terzi.
              </Li>
              <Li>
                Comunicare tempestivamente al fornitore qualsiasi utilizzo non
                autorizzato del proprio account.
              </Li>
            </Box>
            <Typography>
              Il fornitore si riserva il diritto di sospendere o cancellare
              account che violino i presenti termini.
            </Typography>
          </Section>

          <Section title="4. Contenuti caricati dagli utenti">
            <Typography sx={{ mb: 1 }}>
              Gli utenti possono caricare fotografie e testi (dediche)
              nell'ambito della galleria dell'evento. In tal senso l'utente
              dichiara e garantisce che:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0, mb: 2 }}>
              <Li>
                È titolare dei diritti sulle fotografie caricate o ha ottenuto
                espressa autorizzazione dal titolare dei diritti.
              </Li>
              <Li>
                Ha ottenuto il consenso esplicito delle persone ritratte nelle
                fotografie alla pubblicazione delle immagini nella galleria
                dell'evento.
              </Li>
              <Li>
                Il contenuto caricato non viola diritti di terzi (diritto
                d'autore, diritti della personalità, ecc.) né disposizioni di
                legge vigenti.
              </Li>
              <Li>
                I contenuti non sono illeciti, offensivi, diffamatori, osceni o
                comunque contrari al buon costume.
              </Li>
            </Box>
            <Typography>
              Il fornitore non è responsabile dei contenuti caricati dagli
              utenti e si riserva il diritto di rimuovere senza preavviso
              qualsiasi contenuto che violi i presenti termini o che sia
              segnalato come illecito.
            </Typography>
          </Section>

          <Section title="5. Proprietà intellettuale">
            <Typography>
              La piattaforma TiSposi, il suo design, il codice sorgente e tutti
              i materiali originali in essa contenuti sono di proprietà
              esclusiva del fornitore e sono tutelati dalla normativa vigente in
              materia di diritto d'autore. È vietata qualsiasi riproduzione,
              distribuzione o utilizzo non autorizzato.
            </Typography>
          </Section>

          <Section title="6. Limitazione di responsabilità">
            <Typography sx={{ mb: 1 }}>
              Il fornitore non è responsabile per:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0 }}>
              <Li>
                La perdita di dati causata da malfunzionamenti tecnici dei
                servizi cloud di terze parti (Supabase, Google Drive).
              </Li>
              <Li>
                I contenuti caricati dagli utenti e qualsiasi danno derivante
                dalla loro pubblicazione.
              </Li>
              <Li>
                Interruzioni del servizio dovute a manutenzione, aggiornamenti o
                cause di forza maggiore.
              </Li>
            </Box>
          </Section>

          <Section title="7. Modifiche alle condizioni">
            <Typography>
              Il fornitore si riserva il diritto di modificare i presenti
              Termini e Condizioni in qualsiasi momento. Le modifiche saranno
              pubblicate su questa pagina con indicazione della data di
              aggiornamento. L'utilizzo continuato della piattaforma dopo la
              pubblicazione delle modifiche costituisce accettazione dei nuovi
              termini.
            </Typography>
          </Section>

          <Section title="8. Legge applicabile e foro competente">
            <Typography>
              I presenti Termini e Condizioni sono regolati dalla legge
              italiana. Per qualsiasi controversia relativa all'utilizzo della
              piattaforma, le parti concordano la competenza esclusiva del Foro
              di Pavia, salvo diversa disposizione inderogabile di legge.
            </Typography>
          </Section>
        </Stack>
      </Container>
    </Box>
  );
}
