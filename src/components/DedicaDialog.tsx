import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DOMPurify from "dompurify";

interface DedicaDialogProps {
  open: boolean;
  publicId: string;
  onClose: () => void;
  onSubmitted: () => void;
  onError: (msg: string) => void;
}

const MIN_LEN = 2;
const MAX_LEN = 300;

export default function DedicaDialog({
  open,
  publicId,
  onClose,
  onSubmitted,
  onError,
}: DedicaDialogProps) {
  const [testo, setTesto] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const trimmed = testo.trim();
  const hasError =
    touched && (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN);

  const handleSubmit = async () => {
    setTouched(true);
    if (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN) return;
    if (!publicId) {
      onError("Evento non valido: impossibile inviare la dedica.");
      return;
    }

    // Sanitizza l'input prima di inviarlo
    const sanitized = DOMPurify.sanitize(trimmed, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    setLoading(true);
    try {
      const nomeTrimmed = nome.trim();
      const res = await fetch(
        `/api/upload?publicId=${encodeURIComponent(publicId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testo: sanitized,
            ...(nomeTrimmed ? { autoreName: nomeTrimmed } : {}),
          }),
        },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Errore nel server");
      }
      setTesto("");
      setNome("");
      setTouched(false);
      onSubmitted();
      onClose();
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Errore durante l'invio della dedica",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setTesto("");
    setNome("");
    setTouched(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: '"Playfair Display", serif',
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EditIcon color="secondary" />
        Scrivi una dedica
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Lascia un messaggio per gli sposi: apparirà nella galleria pubblica
          dell'evento.
        </Typography>
        <TextField
          autoFocus
          multiline
          fullWidth
          rows={4}
          placeholder="Auguri a Martina e Natan! 🥂"
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          onBlur={() => setTouched(true)}
          error={hasError}
          helperText={
            hasError
              ? trimmed.length < MIN_LEN
                ? `Scrivi almeno ${MIN_LEN} caratteri`
                : `Massimo ${MAX_LEN} caratteri`
              : `${trimmed.length} / ${MAX_LEN}`
          }
          inputProps={{ maxLength: MAX_LEN + 10 }}
          disabled={loading}
        />
        <TextField
          fullWidth
          placeholder="Il tuo nome (opzionale)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          inputProps={{ maxLength: 100 }}
          disabled={loading}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Annulla
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={loading || trimmed.length < MIN_LEN}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {loading ? "Invio…" : "Invia dedica"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
