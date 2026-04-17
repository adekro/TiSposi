import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LaunchIcon from "@mui/icons-material/Launch";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link as RouterLink } from "react-router-dom";
import type { EventFormState } from "../hooks/useEventSettings";
import { normalizePublicId } from "../hooks/useEventSettings";
import type { StorageProvider } from "../types";

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
  publicIdValid: boolean;
  onSave: () => Promise<void>;
  onDownloadQr: () => Promise<void>;
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
  publicIdValid,
  onSave,
  onDownloadQr,
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

          <FormControl>
            <FormLabel>Provider contenuti</FormLabel>
            <RadioGroup
              value={form.storageProvider}
              onChange={(e) =>
                updateField(
                  "storageProvider",
                  e.target.value as StorageProvider,
                )
              }
            >
              <FormControlLabel
                value="supabase_db"
                control={<Radio />}
                label="Supabase DB (foto base64 e dediche nel database)"
              />
              <FormControlLabel
                value="google_drive"
                control={<Radio />}
                label="Google Drive (media su Drive, configurazione evento su Supabase)"
              />
            </RadioGroup>
          </FormControl>

          {form.storageProvider === "google_drive" ? (
            <TextField
              label="Cartella Google Drive"
              value={form.googleDriveFolderId}
              onChange={(e) =>
                updateField("googleDriveFolderId", e.target.value)
              }
              placeholder="ID cartella"
              fullWidth
              disabled={disabled}
            />
          ) : (
            <Alert severity="warning">
              In questa modalita le foto vengono memorizzate come base64 nel
              database Supabase. Imposta limiti payload stretti sul piano di
              hosting.
            </Alert>
          )}

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
                <TextField
                  label="Nome venue / location"
                  value={form.venueName}
                  onChange={(e) => updateField("venueName", e.target.value)}
                  placeholder="Villa Rossi"
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Indirizzo"
                  value={form.venueAddress}
                  onChange={(e) => updateField("venueAddress", e.target.value)}
                  placeholder="Via Roma 1, Milano"
                  fullWidth
                  disabled={disabled}
                />
                <TextField
                  label="Link Google Maps"
                  value={form.venueMapsUrl}
                  onChange={(e) => updateField("venueMapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  fullWidth
                  disabled={disabled}
                />
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
              <TextField
                label="Menu matrimonio"
                value={form.menu}
                onChange={(e) => updateField("menu", e.target.value)}
                placeholder={`Antipasti\n– Prosciutto e melone\n\nPrimo\n– Risotto ai funghi\n\nSecondo\n– Tagliata di manzo`}
                fullWidth
                multiline
                minRows={6}
                disabled={disabled}
                helperText="Testo libero visibile agli ospiti"
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
              component={RouterLink}
              to={normalizedPublicId ? `/${normalizedPublicId}/gallery` : "#"}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              startIcon={<LaunchIcon />}
              disabled={!publicIdValid}
            >
              Apri gallery pubblica
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCode2Icon />}
              onClick={() => void onDownloadQr()}
              disabled={!publicIdValid}
            >
              Scarica QR Code
            </Button>
          </Stack>

          {publicUrl ? (
            <Alert severity="info">URL pubblico: {publicUrl}</Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
