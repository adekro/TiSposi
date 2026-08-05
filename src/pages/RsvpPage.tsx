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
import { HowToReg as HowToRegIcon } from "@mui/icons-material";
import { CheckCircleOutline as CheckCircleOutlineIcon } from "@mui/icons-material";
import LegalFooter from "../components/LegalFooter";
import GuestNavbar from "../components/GuestNavbar";
import WeddingDecorativeOverlay, { WeddingDecorativeDivider } from "../components/WeddingDecorativeOverlay";
import { resolveLandingTheme } from "../lib/landingTheme";
import type { LandingConfig } from "../types";
import { supabase } from "../lib/supabase";

export default function RsvpPage() {
  const { publicId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const prefilledName = searchParams.get("name") ?? "";
  const guestIdParam = searchParams.get("guest_id") ?? "";

  const [guestName, setGuestName] = useState("");
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
  const [rsvpBgUrl, setRsvpBgUrl] = useState<string | null>(null);
  const [spouses, setSpouses] = useState("");
  const [weddingDate, setWeddingDate] = useState<string | null>(null);
  const [landingConfig, setLandingConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefilledName) setGuestName(prefilledName);
  }, [prefilledName]);

  useEffect(() => {
    if (!publicId.trim()) return;

    void fetch(`/api/rsvp?publicId=${encodeURIComponent(publicId)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as {
          event?: {
            spouses?: string;
            rsvpBgUrl?: string | null;
            weddingDate?: string | null;
            landingConfig?: LandingConfig | null;
          };
        };
        setSpouses(json.event?.spouses ?? "");
        setRsvpBgUrl(json.event?.rsvpBgUrl ?? null);
        setWeddingDate(json.event?.weddingDate ?? null);
        setLandingConfig(json.event?.landingConfig ?? null);
      })
      .catch(() => {
        setRsvpBgUrl(null);
        setLandingConfig(null);
      });
  }, [publicId]);

  const palette = resolveLandingTheme(landingConfig?.theme ?? null);

  // Immagine hero: prima quella del landingConfig, poi quella dedicata RSVP
  const heroImage =
    landingConfig?.hero?.imageUrlDesktop ??
    landingConfig?.hero?.imageUrlTablet ??
    landingConfig?.hero?.imageUrlMobile ??
    rsvpBgUrl ??
    null;
  const hasHeroImage = Boolean(heroImage);

  const formatDisplayDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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
      if (!supabase) throw new Error("Supabase non configurato.");
      const { error: invokeError } = await supabase.functions.invoke("rsvp", {
        body: {
          publicId,
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
        },
      });
      if (invokeError) throw new Error(invokeError.message || "Errore durante l'invio.");

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
        "--accent-color": palette.accent,
        display: "flex",
        flexDirection: "column",
        backgroundColor: palette.pageBackground,
      }}
    >
      <GuestNavbar publicId={publicId} spouses={spouses} />

      {/* ── Hero ── */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "50vh", sm: "60vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: hasHeroImage ? undefined : palette.heroFallback,
        }}
      >
        {/* Immagine di sfondo hero */}
        {hasHeroImage && (
          <Box
            component="img"
            src={heroImage!}
            alt="Sfondo matrimonio"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Overlay semi-trasparente */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: hasHeroImage
              ? "rgba(0,0,0,0.42)"
              : `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 100%)`,
          }}
        />

        {/* Ornamenti botanici agli angoli */}
        <WeddingDecorativeOverlay intensity={hasHeroImage ? 0.28 : 0.40} />

        {/* Contenuto hero */}
        <Container
          maxWidth="sm"
          sx={{ position: "relative", zIndex: 3, textAlign: "center", py: { xs: 6, sm: 8 } }}
        >
          <Typography
            variant="overline"
            sx={{
              color: hasHeroImage ? "rgba(255,255,255,0.88)" : palette.accent,
              letterSpacing: "0.18em",
              fontWeight: 600,
              fontSize: "0.75rem",
              fontFamily: palette.bodyFont,
            }}
          >
            Benvenuti al matrimonio di
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: palette.titleFont,
              color: hasHeroImage ? "#ffffff" : palette.textColor,
              fontSize: { xs: "2.2rem", sm: "3rem" },
              lineHeight: 1.15,
              mt: 1,
              mb: 1.5,
              textShadow: hasHeroImage ? "0 2px 12px rgba(0,0,0,0.55)" : "none",
            }}
          >
            {spouses || "Benvenuti"}
          </Typography>

          {formatDisplayDate(weddingDate) && (
            <Typography
              variant="h6"
              sx={{
                color: hasHeroImage ? "rgba(255,255,255,0.92)" : palette.accent,
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                textShadow: hasHeroImage ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
                fontFamily: palette.bodyFont,
              }}
            >
              {formatDisplayDate(weddingDate)}
            </Typography>
          )}

          {/* Badge RSVP */}
          <Box
            sx={{
              mt: 3.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.2,
              borderRadius: 8,
              border: "1px solid",
              borderColor: hasHeroImage ? "rgba(255,255,255,0.55)" : palette.accent,
              bgcolor: hasHeroImage ? "rgba(255,255,255,0.12)" : `${palette.accent}22`,
              backdropFilter: "blur(6px)",
            }}
          >
            <HowToRegIcon
              sx={{ fontSize: 20, color: hasHeroImage ? "rgba(255,255,255,0.92)" : palette.accent }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: hasHeroImage ? "rgba(255,255,255,0.92)" : palette.accent,
                fontFamily: palette.bodyFont,
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              Conferma presenza
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── Sezione form ── */}
      <Box
        sx={{
          backgroundColor: palette.pageBackground,
          backgroundImage: palette.pagePattern,
          backgroundSize: "220px 220px",
          backgroundPosition: "center",
          flex: 1,
          py: { xs: 5, md: 7 },
        }}
      >
        <Container maxWidth="sm">
          <WeddingDecorativeDivider />
          {submitted ? (
            /* ── Stato ringraziamento ── */
            <Stack spacing={3} alignItems="center" sx={{ mt: 2 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 72, color: "success.main" }} />
              <Typography variant="h5" textAlign="center" fontWeight={600} color={palette.textColor}>
                {attending === "yes"
                  ? "Non vediamo l'ora di festeggiare con te! 🥂"
                  : "Grazie per averci fatto sapere. Ci mancherai!"}
              </Typography>
              <Typography variant="body2" color={palette.mutedTextColor} textAlign="center">
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
                <FormLabel>Presenza</FormLabel>
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
                  <FormControlLabel value="yes" control={<Radio />} label="Sì, sarò presente 🎉" />
                  <FormControlLabel value="no"  control={<Radio />} label="Non potrò esserci 😔" />
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
                        onChange={(e) =>
                          setArrivalMethod(e.target.value as "auto" | "treno" | "aereo" | "altro")
                        }
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
                  loading ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon />
                }
              >
                {loading ? "Invio in corso..." : "Invia risposta"}
              </Button>
            </Stack>
          )}
        </Container>
      </Box>

      <LegalFooter />
    </Box>
  );
}
