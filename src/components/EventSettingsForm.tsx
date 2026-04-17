import {
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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LaunchIcon from "@mui/icons-material/Launch";
import QrCode2Icon from "@mui/icons-material/QrCode2";
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
