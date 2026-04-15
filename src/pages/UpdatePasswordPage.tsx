import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async () => {
    if (!supabase) {
      setError("Supabase non configurato nel client.");
      return;
    }

    if (password !== confirm) {
      setError("Le password non corrispondono.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setMessage("Password aggiornata con successo. Reindirizzamento...");
      setTimeout(() => navigate("/app", { replace: true }), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'aggiornamento.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(180deg, rgba(201,167,108,0.14) 0%, rgba(250,247,242,1) 35%, rgba(255,255,255,1) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 5 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h3" sx={{ textAlign: "center", mb: 1 }}>
              Nuova password
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", mb: 3 }}
            >
              Scegli una nuova password per il tuo account.
            </Typography>

            <Stack spacing={2.5}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              {message ? <Alert severity="success">{message}</Alert> : null}

              <TextField
                fullWidth
                type="password"
                label="Nuova password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                type="password"
                label="Conferma password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                error={mismatch}
                helperText={mismatch ? "Le password non corrispondono." : ""}
              />

              <Button
                variant="contained"
                size="large"
                disabled={
                  loading || password.length < 6 || password !== confirm
                }
                onClick={handleSubmit}
              >
                {loading ? "Attendere..." : "Salva nuova password"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
