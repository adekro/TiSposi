import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { EventFormState } from "../hooks/useEventSettings";
import { normalizePublicId } from "../hooks/useEventSettings";

interface Props {
  form: EventFormState;
  updateField: <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => void;
  loading: boolean;
  saving: boolean;
  error: string;
  message: string;
  normalizedPublicId: string;
  publicUrl: string;
  rsvpUrl: string;
  landingUrl: string;
  publicIdValid: boolean;
  onSave: () => Promise<void>;
  onDownloadQr: () => Promise<void>;
  onDownloadRsvpQr: () => Promise<void>;
}

export default function EventSettingsForm({
  form,
  updateField,
  loading,
  saving,
  error,
  message,
  normalizedPublicId,
  publicUrl,
  rsvpUrl,
  landingUrl,
  publicIdValid,
  onSave,
  onDownloadQr,
  onDownloadRsvpQr,
}: Props) {
  const disabled = loading || saving;

  return (
    <Card sx={{ borderRadius: 5 }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {message ? <Alert severity="success">{message}</Alert> : null}

          {/* ── Base ── */}
          <TextField
            label="Titolo evento"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Il nostro matrimonio"
            fullWidth
            disabled={disabled}
          />
          <TextField
            label="Gli sposi"
            value={form.spouses}
            onChange={(e) => updateField("spouses", e.target.value)}
            placeholder="Marta & Luca"
            fullWidth
            disabled={disabled}
          />
          <TextField
            label="Parametro pubblico"
            value={form.publicId}
            onChange={(e) =>
              updateField("publicId", normalizePublicId(e.target.value))
            }
            placeholder="martaluca"
            helperText={
              normalizedPublicId.length === 0
                ? "Usa solo lettere minuscole e numeri (senza trattini)."
                : publicIdValid
                  ? `Route pubblica: /${normalizedPublicId}/gallery`
                  : "Formato non valido. Usa solo lettere minuscole e numeri."
            }
            fullWidth
            disabled={disabled}
          />

          {/* ── Fase 1: Pagina pubblica ── */}
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>📅 Data del matrimonio</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Data del matrimonio"
                type="date"
                value={form.weddingDate}
                onChange={(e) => updateField("weddingDate", e.target.value)}
                fullWidth
                disabled={disabled}
                InputLabelProps={{ shrink: true }}
                helperText="Mostrerà un countdown sulla pagina pubblica degli ospiti"
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>💑 La vostra storia</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Storia della coppia"
                value={form.coupleStory}
                onChange={(e) => updateField("coupleStory", e.target.value)}
                placeholder="Come vi siete conosciuti, quando vi siete fidanzati..."
                fullWidth
                multiline
                minRows={4}
                disabled={disabled}
                helperText="Testo libero visibile agli ospiti nella pagina della galleria"
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>📍 Info logistiche</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="subtitle2" color="primary">
                  🕍 Cerimonia
                </Typography>
                <TextField
                  label="Nome chiesa / luogo cerimonia"
                  value={form.ceremonyVenueName}
                  onChange={(e) =>
                    updateField("ceremonyVenueName", e.target.value)
                  }
                  placeholder="Basilica di Santa Maria"
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Indirizzo cerimonia"
                  value={form.ceremonyVenueAddress}
                  onChange={(e) =>
                    updateField("ceremonyVenueAddress", e.target.value)
                  }
                  placeholder="Piazza Duomo 1, Milano"
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Link Google Maps — cerimonia"
                  value={form.ceremonyVenueMapsUrl}
                  onChange={(e) =>
                    updateField("ceremonyVenueMapsUrl", e.target.value)
                  }
                  placeholder="https://maps.google.com/..."
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Orario cerimonia"
                  value={form.ceremonyTime}
                  onChange={(e) =>
                    updateField("ceremonyTime", e.target.value)
                  }
                  placeholder="ore 10:30"
                  fullWidth
                  disabled={disabled}
                />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" color="primary">
                  🎉 Ricevimento
                </Typography>
                <TextField
                  label="Nome venue / location ricevimento"
                  value={form.receptionVenueName}
                  onChange={(e) =>
                    updateField("receptionVenueName", e.target.value)
                  }
                  placeholder="Villa Rossi"
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Indirizzo ricevimento"
                  value={form.receptionVenueAddress}
                  onChange={(e) =>
                    updateField("receptionVenueAddress", e.target.value)
                  }
                  placeholder="Via Roma 1, Milano"
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Link Google Maps — ricevimento"
                  value={form.receptionVenueMapsUrl}
                  onChange={(e) =>
                    updateField("receptionVenueMapsUrl", e.target.value)
                  }
                  placeholder="https://maps.google.com/..."
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Orario ricevimento"
                  value={form.receptionTime}
                  onChange={(e) =>
                    updateField("receptionTime", e.target.value)
                  }
                  placeholder="ore 13:00"
                  fullWidth
                  disabled={disabled}
                />

                <Divider sx={{ my: 1 }} />

                <TextField
                  label="Dress code"
                  value={form.dresscode}
                  onChange={(e) => updateField("dresscode", e.target.value)}
                  placeholder="Elegante, colori pastello..."
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Programma della giornata"
                  value={form.schedule}
                  onChange={(e) => updateField("schedule", e.target.value)}
                  placeholder={`10:00 – Cerimonia\n12:30 – Aperitivo\n14:00 – Pranzo`}
                  fullWidth
                  multiline
                  minRows={4}
                  disabled={disabled}
                  helperText="Un'ora per riga o testo libero"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>🍽️ Menu</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Antipasto"
                  value={form.menuAntipasto}
                  onChange={(e) => updateField("menuAntipasto", e.target.value)}
                  placeholder="Prosciutto e melone, bruschette al pomodoro..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                />
                <TextField
                  label="Primo piatto"
                  value={form.menuPrimo}
                  onChange={(e) => updateField("menuPrimo", e.target.value)}
                  placeholder="Risotto ai funghi porcini..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                />
                <TextField
                  label="Secondo piatto"
                  value={form.menuSecondo}
                  onChange={(e) => updateField("menuSecondo", e.target.value)}
                  placeholder="Tagliata di manzo al rosmarino..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                />
                <TextField
                  label="Contorno"
                  value={form.menuContorno}
                  onChange={(e) => updateField("menuContorno", e.target.value)}
                  placeholder="Patate al forno, insalata mista..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                />
                <TextField
                  label="Dolce"
                  value={form.menuDolce}
                  onChange={(e) => updateField("menuDolce", e.target.value)}
                  placeholder="Torta nuziale, cannoli siciliani..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                />
                <TextField
                  label="Bevande e vini"
                  value={form.menuBevande}
                  onChange={(e) => updateField("menuBevande", e.target.value)}
                  placeholder="Prosecco, Barolo, acqua minerale..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                />
                <TextField
                  label="Note aggiuntive"
                  value={form.menu}
                  onChange={(e) => updateField("menu", e.target.value)}
                  placeholder="Menu vegetariano disponibile su richiesta..."
                  fullWidth
                  multiline
                  minRows={2}
                  disabled={disabled}
                  helperText="Campo opzionale per note generali o menù alternativo"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>🖼️ Pagina di benvenuto ospiti</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="URL immagine di sfondo"
                  value={form.landingBgUrl}
                  onChange={(e) => updateField("landingBgUrl", e.target.value)}
                  placeholder="https://example.com/foto-matrimonio.jpg"
                  fullWidth
                  disabled={disabled}
                  helperText="URL diretto a un'immagine (JPG, PNG, WebP) da usare come sfondo della pagina di benvenuto"
                />
                {form.landingBgUrl.trim() ? (
                  <Box
                    component="img"
                    src={form.landingBgUrl.trim()}
                    alt="Anteprima sfondo"
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>💍 Lista Nozze</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Descrizione lista nozze"
                value={form.weddingListDescription}
                onChange={(e) => updateField("weddingListDescription", e.target.value)}
                placeholder="Invece dei regali tradizionali, abbiamo scelto dei desideri speciali..."
                fullWidth
                multiline
                minRows={3}
                disabled={disabled}
                helperText="Testo introduttivo mostrato agli ospiti nella pagina della lista nozze"
              />
            </AccordionDetails>
          </Accordion>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => void onSave()}
              disabled={disabled}
            >
              {saving ? "Salvataggio..." : "Salva configurazione"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCode2Icon />}
              onClick={() => void onDownloadQr()}
              disabled={!publicIdValid}
            >
              Scarica QR Galleria
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCode2Icon />}
              onClick={() => void onDownloadRsvpQr()}
              disabled={!publicIdValid}
            >
              Scarica QR RSVP
            </Button>
          </Stack>

          {publicUrl ? (
            <Alert severity="info">
              URL galleria:{" "}
              <Link href={publicUrl} target="_blank" rel="noreferrer">
                {publicUrl}
              </Link>
            </Alert>
          ) : null}
          {rsvpUrl ? (
            <Alert severity="info">
              URL RSVP:{" "}
              <Link href={rsvpUrl} target="_blank" rel="noreferrer">
                {rsvpUrl}
              </Link>
            </Alert>
          ) : null}
          {landingUrl ? (
            <Alert severity="info">
              URL pagina di benvenuto:{" "}
              <Link href={landingUrl} target="_blank" rel="noreferrer">
                {landingUrl}
              </Link>
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
