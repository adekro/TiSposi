import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DOMPurify from "dompurify";

interface MusicRequestDialogProps {
  open: boolean;
  publicId: string;
  onClose: () => void;
  onSubmitted: () => void;
  onError: (msg: string) => void;
}

function sanitize(value: string) {
  return DOMPurify.sanitize(value.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export default function MusicRequestDialog({
  open,
  publicId,
  onClose,
  onSubmitted,
  onError,
}: MusicRequestDialogProps) {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const songTrimmed = song.trim();
  const songError = touched && songTrimmed.length === 0;

  const handleSubmit = async () => {
    setTouched(true);
    if (!songTrimmed) return;
    if (!publicId) {
      onError("Evento non valido.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/music?publicId=${encodeURIComponent(publicId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            song: sanitize(songTrimmed),
            artist: artist.trim() ? sanitize(artist.trim()) : null,
            requestedBy: requestedBy.trim()
              ? sanitize(requestedBy.trim())
              : null,
          }),
        },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Errore nel server");
      }
      setSong("");
      setArtist("");
      setRequestedBy("");
      setTouched(false);
      onSubmitted();
      onClose();
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Errore durante l'invio della richiesta",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSong("");
    setArtist("");
    setRequestedBy("");
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
        <MusicNoteIcon color="secondary" />
        Richiesta musicale
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Suggerisci una canzone al DJ per la festa!
        </Typography>
        <Stack spacing={2}>
          <TextField
            autoFocus
            fullWidth
            label="Canzone *"
            placeholder="Bohemian Rhapsody"
            value={song}
            onChange={(e) => setSong(e.target.value)}
            onBlur={() => setTouched(true)}
            error={songError}
            helperText={
              songError ? "Il titolo della canzone è obbligatorio" : ""
            }
            disabled={loading}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            fullWidth
            label="Artista"
            placeholder="Queen"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            fullWidth
            label="Il tuo nome (opzionale)"
            placeholder="Marco e Sofia"
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 100 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Annulla
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} /> : <MusicNoteIcon />
          }
        >
          {loading ? "Invio..." : "Invia richiesta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
