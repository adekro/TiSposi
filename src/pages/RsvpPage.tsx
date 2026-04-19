import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LegalFooter from "../components/LegalFooter";
import GuestNavbar from "../components/GuestNavbar";

export default function RsvpPage() {
  const { publicId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const prefilledName = searchParams.get("name") ?? "";
  const guestIdParam = searchParams.get("guest_id") ?? "";

  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    if (prefilledName) setGuestName(prefilledName);
  }, [prefilledName]);
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [numGuests, setNumGuests] = useState("1");
  const [menuChoice, setMenuChoice] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [notes, setNotes] = useState("");  // Fase 13: logistica
  const [arrivalMethod, setArrivalMethod] = useState<"auto" | "treno" | "aereo" | "altro" | "">("")
  const [needsParking, setNeedsParking] = useState(false);
  const [needsShuttle, setNeedsShuttle] = useState(false);
  const [needsAccommodation, setNeedsAccommodation] = useState(false);
  const [accommodationNotes, setAccommodationNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sanitize = (val: string) =>
    DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });

  const handleSubmit = async () => {
    const cleanName = sanitize(guestName.trim());
    if (!cleanName) {
      setError("Il nome è obbligatorio.");
      return;
    }
    if (!attending) {
      setError("Indica se sarai presente.");
      return;
    }

    const isAttending = attending === "yes";
    const guests = isAttending ? parseInt(numGuests, 10) : 0;
    if (isAttending && (isNaN(guests) || guests < 1 || guests > 20)) {
      setError("Il numero di persone deve essere tra 1 e 20.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/rsvp?publicId=${encodeURIComponent(publicId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: cleanName,
          attending: isAttending,
          numGuests: isAttending ? guests : 0,
          menuChoice: isAttending && menuChoice.trim() ? sanitize(menuChoice.trim()) : null,
          dietaryRestrictions: dietaryRestrictions.trim() ? sanitize(dietaryRestrictions.trim()) : null,
          notes: notes.trim() ? sanitize(notes.trim()) : null,
          guestId: guestIdParam || null,
          arrivalMethod: isAttending && arrivalMethod ? arrivalMethod : null,
          needsParking: isAttending ? needsParking : false,
          needsShuttle: isAttending ? needsShuttle : false,
          needsAccommodation: isAttending ? needsAccommodation : false,
          accommodationNotes:
            isAttending && needsAccommodation && accommodationNotes.trim()
              ? sanitize(accommodationNotes.trim())
              : null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Errore durante l'invio.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore inatteso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf7f2 0%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GuestNavbar publicId={publicId} />

      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        {/* Header */}
        <Stack spacing={1} alignItems="center" sx={{ mb: 5 }}>
          <HowToRegIcon sx={{ fontSize: 48, color: "primary.main" }} />
          <Typography variant="h4" textAlign="center" fontWeight={700}>
            Conferma la tua presenza
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Compila il form per far sapere agli sposi se sarai presente.
          </Typography>
        </Stack>

        {submitted ? (
          /* ── Thank-you state ── */
          <Stack spacing={3} alignItems="center" sx={{ mt: 4 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 72, color: "success.main" }}
            />
            <Typography variant="h5" textAlign="center" fontWeight={600}>
              {attending === "yes"
                ? "Non vediamo l'ora di festeggiare con te! 🥂"
                : "Grazie per averci fatto sapere. Ci mancherai!"}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              La tua risposta è stata registrata correttamente.
            </Typography>
          </Stack>
        ) : (
          /* ── Form ── */
          <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Il tuo nome"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Marco Rossi"
              fullWidth
              required
              disabled={loading || Boolean(prefilledName)}
              inputProps={{ maxLength: 200, readOnly: Boolean(prefilledName) }}
              helperText={prefilledName ? "Nome pre-compilato dal link di invito" : undefined}
            />

            <FormControl required disabled={loading}>
              <FormLabel>Presenz a</FormLabel>
              <RadioGroup
                value={attending}
                onChange={(e) => {
                  const val = e.target.value as "yes" | "no";
                  setAttending(val);
                  if (val === "no") {
                    setArrivalMethod("");
                    setNeedsParking(false);
                    setNeedsShuttle(false);
                    setNeedsAccommodation(false);
                    setAccommodationNotes("");
                  }
                }}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio />}
                  label="Sì, sarò presente 🎉"
                />
                <FormControlLabel
                  value="no"
                  control={<Radio />}
                  label="Non potrò esserci 😔"
                />
              </RadioGroup>
            </FormControl>

            {attending === "yes" && (
              <>
                <TextField
                  label="Numero di persone (incluso te)"
                  type="number"
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  inputProps={{ min: 1, max: 20 }}
                  fullWidth
                  disabled={loading}
                  helperText="Includi te stesso nel conteggio"
                />

                <TextField
                  label="Scelta menu (opzionale)"
                  value={menuChoice}
                  onChange={(e) => setMenuChoice(e.target.value)}
                  placeholder="Es. carne, pesce, vegetariano..."
                  fullWidth
                  disabled={loading}
                  inputProps={{ maxLength: 200 }}
                />

                {/* ── Sezione logistica ── */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    Come arrivi?
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <FormControl disabled={loading} fullWidth sx={{ mb: 2 }}>
                    <FormLabel sx={{ mb: 1, fontSize: 14 }}>Mezzo di trasporto (opzionale)</FormLabel>
                    <RadioGroup
                      row
                      value={arrivalMethod}
                      onChange={(e) => setArrivalMethod(e.target.value as "auto" | "treno" | "aereo" | "altro")}
                    >
                      <FormControlLabel value="auto"  control={<Radio size="small" />} label="Auto 🚗" />
                      <FormControlLabel value="treno" control={<Radio size="small" />} label="Treno 🚂" />
                      <FormControlLabel value="aereo" control={<Radio size="small" />} label="Aereo ✈️" />
                      <FormControlLabel value="altro" control={<Radio size="small" />} label="Altro" />
                    </RadioGroup>
                  </FormControl>

                  <Stack spacing={0.5}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={needsParking}
                          onChange={(e) => setNeedsParking(e.target.checked)}
                          disabled={loading}
                          size="small"
                        />
                      }
                      label="Ho bisogno di un posto auto 🅿️"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={needsShuttle}
                          onChange={(e) => setNeedsShuttle(e.target.checked)}
                          disabled={loading}
                          size="small"
                        />
                      }
                      label="Ho bisogno della navetta / transfer 🚌"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={needsAccommodation}
                          onChange={(e) => {
                            setNeedsAccommodation(e.target.checked);
                            if (!e.target.checked) setAccommodationNotes("");
                          }}
                          disabled={loading}
                          size="small"
                        />
                      }
                      label="Ho bisogno di indicazioni per l'alloggio 🏨"
                    />
                  </Stack>

                  {needsAccommodation && (
                    <TextField
                      label="Note alloggio (opzionale)"
                      value={accommodationNotes}
                      onChange={(e) => setAccommodationNotes(e.target.value)}
                      placeholder="Es. numero di notti, necessità particolari..."
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={loading}
                      inputProps={{ maxLength: 500 }}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Paper>
              </>
            )}

            <TextField
              label="Intolleranze / allergie alimentari (opzionale)"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="Es. glutine, lattosio..."
              fullWidth
              disabled={loading}
              inputProps={{ maxLength: 1000 }}
            />

            <TextField
              label="Note aggiuntive (opzionale)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Un messaggio agli sposi..."
              fullWidth
              multiline
              minRows={3}
              disabled={loading}
              inputProps={{ maxLength: 1000 }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={() => void handleSubmit()}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <HowToRegIcon />
                )
              }
            >
              {loading ? "Invio in corso..." : "Invia risposta"}
            </Button>
          </Stack>
        )}
      </Container>

      <LegalFooter />
    </Box>
  );
}
