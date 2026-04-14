import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
import LogoutIcon from "@mui/icons-material/Logout";
import LaunchIcon from "@mui/icons-material/Launch";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type { EventSettingsRow, StorageProvider } from "../types";

const PUBLIC_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface FormState {
  title: string;
  spouses: string;
  publicId: string;
  storageProvider: StorageProvider;
  googleDriveFolderId: string;
}

const defaultState: FormState = {
  title: "",
  spouses: "",
  publicId: "",
  storageProvider: "supabase_db",
  googleDriveFolderId: "",
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [form, setForm] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    let active = true;

    void supabase
      .from("events")
      .select(
        "id, owner_user_id, public_id, title, spouses, storage_provider, google_drive_folder_id",
      )
      .eq("owner_user_id", user.id)
      .maybeSingle<EventSettingsRow>()
      .then(({ data, error: loadError }) => {
        if (!active) return;

        if (loadError) {
          setError(loadError.message);
        }

        if (data) {
          setForm({
            title: data.title,
            spouses: data.spouses,
            publicId: data.public_id,
            storageProvider: data.storage_provider,
            googleDriveFolderId: data.google_drive_folder_id ?? "",
          });
        } else {
          const defaultPublicId = buildPublicIdFromEmail(user.email);
          setForm((current) => ({ ...current, publicId: defaultPublicId }));
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return null;
  }

  const normalizedPublicId = form.publicId.trim().toLowerCase();
  const publicUrl = normalizedPublicId
    ? `${window.location.origin}/${normalizedPublicId}/gallery`
    : "";
  const publicIdValid = PUBLIC_ID_PATTERN.test(normalizedPublicId);

  const handleSave = async () => {
    const title = form.title.trim();
    const spouses = form.spouses.trim();
    const googleDriveFolderId = form.googleDriveFolderId.trim();

    if (!title || !spouses || !publicIdValid) {
      setError("Compila titolo, sposi e un parametro pubblico valido.");
      return;
    }

    if (form.storageProvider === "google_drive" && !googleDriveFolderId) {
      setError(
        "Inserisci la cartella Google Drive per usare il provider Drive.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      owner_user_id: user.id,
      title,
      spouses,
      public_id: normalizedPublicId,
      storage_provider: form.storageProvider,
      google_drive_folder_id:
        form.storageProvider === "google_drive" ? googleDriveFolderId : null,
    };

    const { error: upsertError } = await supabase
      .from("events")
      .upsert(payload, { onConflict: "owner_user_id" });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setMessage("Configurazione salvata.");
    setSaving(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf7f2 0%, #ffffff 100%)",
        py: 5,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: "0.2em",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                Area riservata
              </Typography>
              <Typography variant="h3">Configura il tuo evento</Typography>
              <Typography color="text.secondary">
                Account: {user.email}
              </Typography>
            </Box>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={() => void signOut()}
            >
              Esci
            </Button>
          </Box>

          <Card sx={{ borderRadius: 5 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={3}>
                {error ? <Alert severity="error">{error}</Alert> : null}
                {message ? <Alert severity="success">{message}</Alert> : null}

                <TextField
                  label="Titolo evento"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Il nostro matrimonio"
                  fullWidth
                  disabled={loading || saving}
                />
                <TextField
                  label="Gli sposi"
                  value={form.spouses}
                  onChange={(event) =>
                    setForm({ ...form, spouses: event.target.value })
                  }
                  placeholder="Marta & Luca"
                  fullWidth
                  disabled={loading || saving}
                />
                <TextField
                  label="Parametro pubblico"
                  value={form.publicId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      publicId: normalizePublicId(event.target.value),
                    })
                  }
                  placeholder="marta-luca"
                  helperText={
                    normalizedPublicId.length === 0
                      ? "Usa solo lettere minuscole, numeri e trattini."
                      : publicIdValid
                        ? `Route pubblica: /${normalizedPublicId}/gallery`
                        : "Formato non valido. Usa solo lettere minuscole, numeri e trattini."
                  }
                  fullWidth
                  disabled={loading || saving}
                />

                <FormControl>
                  <FormLabel>Provider contenuti</FormLabel>
                  <RadioGroup
                    value={form.storageProvider}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        storageProvider: event.target.value as StorageProvider,
                      })
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
                    onChange={(event) =>
                      setForm({
                        ...form,
                        googleDriveFolderId: event.target.value,
                      })
                    }
                    placeholder="ID cartella"
                    fullWidth
                    disabled={loading || saving}
                  />
                ) : (
                  <Alert severity="warning">
                    In questa modalita le foto vengono memorizzate come base64
                    nel database Supabase. Imposta limiti payload stretti sul
                    piano di hosting.
                  </Alert>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || saving}
                  >
                    {saving ? "Salvataggio..." : "Salva configurazione"}
                  </Button>
                  <Button
                    component={RouterLink}
                    to={
                      normalizedPublicId
                        ? `/${normalizedPublicId}/gallery`
                        : "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    startIcon={<LaunchIcon />}
                    disabled={!publicIdValid}
                  >
                    Apri gallery pubblica
                  </Button>
                </Stack>

                {publicUrl ? (
                  <Alert severity="info">URL pubblico: {publicUrl}</Alert>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

function normalizePublicId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function buildPublicIdFromEmail(email?: string) {
  if (!email) return "";
  return normalizePublicId(email.split("@")[0]);
}
