import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import LegalFooter from "../components/LegalFooter";

type AuthMode = "signup" | "login" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const { session, configError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [photoConsentAccepted, setPhotoConsentAccepted] = useState(false);

  if (session) {
    return <Navigate to="/app" replace />;
  }

  if (configError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Alert severity="error">{configError}</Alert>
        </Container>
      </Box>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!supabase) {
        throw new Error("Supabase non configurato nel client.");
      }

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/update-password` },
        );
        if (resetError) throw resetError;
        setMessage(
          "Email inviata. Controlla la casella e clicca il link per impostare la nuova password.",
        );
      } else if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) throw signUpError;

        setMessage(
          "Account creato. Se la conferma email e attiva nel progetto Supabase, controlla la tua casella.",
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        navigate("/app", { replace: true });
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Errore durante l'autenticazione",
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
              Accesso sposi
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", mb: 3 }}
            >
              Crea l'account, entra nella dashboard e configura la tua route
              pubblica.
            </Typography>

            <Tabs
              value={mode === "forgot" ? "login" : mode}
              onChange={(_event, nextValue: AuthMode) => {
                setError("");
                setMessage("");
                setPrivacyAccepted(false);
                setPhotoConsentAccepted(false);
                setMode(nextValue);
              }}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab value="signup" label="Iscriviti" />
              <Tab value="login" label="Accedi" />
            </Tabs>

            <Stack spacing={2.5}>
              {error ? <Alert severity="error">{error}</Alert> : null}
              {message ? <Alert severity="success">{message}</Alert> : null}

              {mode === "forgot" ? (
                <>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Inserisci la tua email e ti invieremo un link per
                    reimpostare la password.
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                  <Button
                    variant="contained"
                    size="large"
                    disabled={loading || !email.trim()}
                    onClick={handleSubmit}
                  >
                    {loading ? "Attendere..." : "Invia link di recupero"}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      setError("");
                      setMessage("");
                      setMode("login");
                    }}
                  >
                    Torna al login
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                  />

                  {mode === "signup" ? (
                    <Stack spacing={0.5}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={privacyAccepted}
                            onChange={(e) =>
                              setPrivacyAccepted(e.target.checked)
                            }
                          />
                        }
                        label={
                          <Typography variant="body2">
                            Ho letto e accetto la{" "}
                            <Link
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              Privacy Policy
                            </Link>{" "}
                            e i{" "}
                            <Link
                              href="/termini"
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              Termini e Condizioni
                            </Link>
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={photoConsentAccepted}
                            onChange={(e) =>
                              setPhotoConsentAccepted(e.target.checked)
                            }
                          />
                        }
                        label={
                          <Typography variant="body2">
                            Dichiaro di caricare solo foto per cui ho ottenuto
                            il consenso delle persone ritratte
                          </Typography>
                        }
                      />
                    </Stack>
                  ) : null}

                  <Button
                    variant="contained"
                    size="large"
                    disabled={
                      loading ||
                      !email.trim() ||
                      password.length < 6 ||
                      (mode === "signup" &&
                        (!privacyAccepted || !photoConsentAccepted))
                    }
                    onClick={handleSubmit}
                  >
                    {loading
                      ? "Attendere..."
                      : mode === "signup"
                        ? "Crea account"
                        : "Entra nella dashboard"}
                  </Button>

                  {mode === "login" ? (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setError("");
                        setMessage("");
                        setMode("forgot");
                      }}
                    >
                      Hai dimenticato la password?
                    </Button>
                  ) : null}

                  <Button variant="text" onClick={() => navigate("/")}>
                    Torna alla landing
                  </Button>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <LegalFooter />
      </Container>
    </Box>
  );
}
