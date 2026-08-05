import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { QrCode2 as QrCode2Icon } from "@mui/icons-material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";
import { useRef, useState } from "react";
import type { EventFormState } from "../hooks/useEventSettings";
import { normalizePublicId } from "../hooks/useEventSettings";
import RichTextEditor from "./RichTextEditor";

interface Props {
  form: EventFormState;
  updateField: <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => void;
  loading: boolean;
  saving: boolean;
  uploadingBg: boolean;
  uploadingGalleryBg: boolean;
  uploadingRsvpBg: boolean;
  uploadingWeddingListBg: boolean;
  error: string;
  message: string;
  normalizedPublicId: string;
  publicUrl: string;
  rsvpUrl: string;
  landingUrl: string;
  publicIdValid: boolean;
  bgPreviewUrl: string | null;
  galleryBgPreviewUrl: string | null;
  rsvpBgPreviewUrl: string | null;
  weddingListBgPreviewUrl: string | null;
  onSave: () => Promise<void>;
  onDownloadQr: () => Promise<void>;
  onDownloadRsvpQr: () => Promise<void>;
  onDownloadLandingQr: () => Promise<void>;
  onUploadBg: (file: File) => Promise<void>;
  onDeleteBg: () => Promise<void>;
  onUploadGalleryBg: (file: File) => Promise<void>;
  onDeleteGalleryBg: () => Promise<void>;
  onUploadRsvpBg: (file: File) => Promise<void>;
  onDeleteRsvpBg: () => Promise<void>;
  onUploadWeddingListBg: (file: File) => Promise<void>;
  onDeleteWeddingListBg: () => Promise<void>;
}

export default function EventSettingsForm({
  form,
  updateField,
  loading,
  saving,
  uploadingBg,
  uploadingGalleryBg,
  uploadingRsvpBg,
  uploadingWeddingListBg,
  error,
  message,
  normalizedPublicId,
  publicUrl,
  rsvpUrl,
  landingUrl,
  publicIdValid,
  bgPreviewUrl,
  galleryBgPreviewUrl,
  rsvpBgPreviewUrl,
  weddingListBgPreviewUrl,
  onSave,
  onDownloadQr,
  onDownloadRsvpQr,
  onDownloadLandingQr,
  onUploadBg,
  onDeleteBg,
  onUploadGalleryBg,
  onDeleteGalleryBg,
  onUploadRsvpBg,
  onDeleteRsvpBg,
  onUploadWeddingListBg,
  onDeleteWeddingListBg,
}: Props) {
  const disabled = loading || saving;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const rsvpFileInputRef = useRef<HTMLInputElement>(null);
  const weddingListFileInputRef = useRef<HTMLInputElement>(null);
  const [bgImgError, setBgImgError] = useState(false);
  const [galleryBgImgError, setGalleryBgImgError] = useState(false);
  const [rsvpBgImgError, setRsvpBgImgError] = useState(false);
  const [weddingListBgImgError, setWeddingListBgImgError] = useState(false);

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
            label="Chiave di Accesso QR"
            value={form.publicId}
            onChange={(e) =>
              updateField("publicId", normalizePublicId(e.target.value))
            }
            placeholder="martaluca"
            helperText={
              normalizedPublicId.length === 0
                ? "Usa solo lettere minuscole e numeri (senza trattini)."
                : publicIdValid
                  ? `Indirizzo Web del Sito: /${normalizedPublicId}/gallery`
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

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="subtitle2" color="primary">Logistica ospiti</Typography>
                  <Tooltip title="Attiva solo le informazioni che vuoi mostrare sul sito degli ospiti.">
                    <IconButton size="small" aria-label="Informazioni sulla logistica ospiti">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <FormControlLabel
                  control={<Switch checked={form.showFlightInfo} onChange={(e) => updateField("showFlightInfo", e.target.checked)} disabled={disabled} />}
                  label="Mostra informazioni aereo"
                />
                {form.showFlightInfo && (
                  <Stack spacing={2}>
                    <TextField label="Aeroporto" value={form.flightAirport} onChange={(e) => updateField("flightAirport", e.target.value)} fullWidth disabled={disabled} />
                    <TextField label="Navetta" value={form.flightShuttle} onChange={(e) => updateField("flightShuttle", e.target.value)} placeholder="Punto di ritrovo e istruzioni" fullWidth disabled={disabled} />
                    <TextField label="Orari" value={form.flightSchedule} onChange={(e) => updateField("flightSchedule", e.target.value)} placeholder="Arrivi, partenze e orari navetta" fullWidth multiline minRows={2} disabled={disabled} />
                  </Stack>
                )}

                <FormControlLabel
                  control={<Switch checked={form.showParkingInfo} onChange={(e) => updateField("showParkingInfo", e.target.checked)} disabled={disabled} />}
                  label="Mostra informazioni parcheggio"
                />
                {form.showParkingInfo && (
                  <TextField label="Parcheggio" value={form.parkingInfo} onChange={(e) => updateField("parkingInfo", e.target.value)} placeholder="Indirizzo, accesso e istruzioni" fullWidth multiline minRows={2} disabled={disabled} />
                )}

                <FormControlLabel
                  control={<Switch checked={form.showAccommodationInfo} onChange={(e) => updateField("showAccommodationInfo", e.target.checked)} disabled={disabled} />}
                  label="Mostra informazioni pernottamento"
                />
                {form.showAccommodationInfo && (
                  <Stack spacing={2}>
                    <TextField label="Hotel" value={form.accommodationHotel} onChange={(e) => updateField("accommodationHotel", e.target.value)} fullWidth disabled={disabled} />
                    <TextField label="Pensione completa" value={form.accommodationFullBoard} onChange={(e) => updateField("accommodationFullBoard", e.target.value)} fullWidth disabled={disabled} />
                    <TextField label="Convenzioni" value={form.accommodationAgreements} onChange={(e) => updateField("accommodationAgreements", e.target.value)} fullWidth multiline minRows={2} disabled={disabled} />
                  </Stack>
                )}
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
              <Typography fontWeight={600}>🖼️ Sfondo galleria</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Carica un&apos;immagine (JPG, PNG, WebP - max 4 MB) da usare come immagine di copertina nella pagina galleria.
                </Typography>
                {galleryBgPreviewUrl && !galleryBgImgError ? (
                  <Box
                    component="img"
                    src={galleryBgPreviewUrl}
                    alt="Anteprima sfondo galleria"
                    onError={() => setGalleryBgImgError(true)}
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.disabled">
                      Nessuna immagine caricata
                    </Typography>
                  </Box>
                )}
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setGalleryBgImgError(false);
                    await onUploadGalleryBg(file);
                    if (galleryFileInputRef.current) {
                      galleryFileInputRef.current.value = "";
                    }
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={
                      uploadingGalleryBg ? <CircularProgress size={16} /> : <CloudUploadIcon />
                    }
                    disabled={disabled || uploadingGalleryBg}
                    onClick={() => galleryFileInputRef.current?.click()}
                  >
                    {galleryBgPreviewUrl && !galleryBgImgError ? "Sostituisci" : "Carica immagine"}
                  </Button>
                  {galleryBgPreviewUrl && !galleryBgImgError && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={disabled || uploadingGalleryBg}
                      onClick={async () => {
                        await onDeleteGalleryBg();
                        setGalleryBgImgError(true);
                      }}
                    >
                      Rimuovi
                    </Button>
                  )}
                </Stack>
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
              <Typography fontWeight={600}>🖼️ Sfondo RSVP</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Carica un&apos;immagine (JPG, PNG, WebP - max 4 MB) da usare come sfondo della pagina RSVP.
                </Typography>
                {rsvpBgPreviewUrl && !rsvpBgImgError ? (
                  <Box
                    component="img"
                    src={rsvpBgPreviewUrl}
                    alt="Anteprima sfondo RSVP"
                    onError={() => setRsvpBgImgError(true)}
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.disabled">
                      Nessuna immagine caricata
                    </Typography>
                  </Box>
                )}
                <input
                  ref={rsvpFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setRsvpBgImgError(false);
                    await onUploadRsvpBg(file);
                    if (rsvpFileInputRef.current) {
                      rsvpFileInputRef.current.value = "";
                    }
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={
                      uploadingRsvpBg ? <CircularProgress size={16} /> : <CloudUploadIcon />
                    }
                    disabled={disabled || uploadingRsvpBg}
                    onClick={() => rsvpFileInputRef.current?.click()}
                  >
                    {rsvpBgPreviewUrl && !rsvpBgImgError ? "Sostituisci" : "Carica immagine"}
                  </Button>
                  {rsvpBgPreviewUrl && !rsvpBgImgError && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={disabled || uploadingRsvpBg}
                      onClick={async () => {
                        await onDeleteRsvpBg();
                        setRsvpBgImgError(true);
                      }}
                    >
                      Rimuovi
                    </Button>
                  )}
                </Stack>
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
                <Typography variant="body2" color="text.secondary">
                  Carica un&apos;immagine (JPG, PNG, WebP — max 4 MB) da usare come sfondo della pagina di benvenuto.
                </Typography>

                {/* Anteprima */}
                {bgPreviewUrl && !bgImgError ? (
                  <Box
                    component="img"
                    src={bgPreviewUrl}
                    alt="Anteprima sfondo"
                    onError={() => setBgImgError(true)}
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.disabled">
                      Nessuna immagine caricata
                    </Typography>
                  </Box>
                )}

                {/* Input file nascosto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBgImgError(false);
                    await onUploadBg(file);
                    // Forza il re-render dell'anteprima
                    setBgImgError(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={uploadingBg ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={disabled || uploadingBg}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {bgPreviewUrl && !bgImgError ? "Sostituisci" : "Carica immagine"}
                  </Button>
                  {bgPreviewUrl && !bgImgError && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={disabled || uploadingBg}
                      onClick={async () => {
                        await onDeleteBg();
                        setBgImgError(true);
                      }}
                    >
                      Rimuovi
                    </Button>
                  )}
                </Stack>
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
              <Stack spacing={2}>
                <RichTextEditor
                  label="Descrizione lista nozze"
                  value={form.weddingListDescription}
                  onChange={(value) => updateField("weddingListDescription", value)}
                  placeholder="Invece dei regali tradizionali, abbiamo scelto dei desideri speciali..."
                  disabled={disabled}
                  helperText="Testo introduttivo mostrato agli ospiti nella pagina della lista nozze"
                />
                <Typography variant="body2" color="text.secondary">
                  Carica un&apos;immagine (JPG, PNG, WebP - max 4 MB) da usare come sfondo della pagina lista nozze.
                </Typography>
                {weddingListBgPreviewUrl && !weddingListBgImgError ? (
                  <Box
                    component="img"
                    src={weddingListBgPreviewUrl}
                    alt="Anteprima sfondo lista nozze"
                    onError={() => setWeddingListBgImgError(true)}
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 320,
                      height: 180,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.disabled">
                      Nessuna immagine caricata
                    </Typography>
                  </Box>
                )}
                <input
                  ref={weddingListFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setWeddingListBgImgError(false);
                    await onUploadWeddingListBg(file);
                    if (weddingListFileInputRef.current) {
                      weddingListFileInputRef.current.value = "";
                    }
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={
                      uploadingWeddingListBg ? <CircularProgress size={16} /> : <CloudUploadIcon />
                    }
                    disabled={disabled || uploadingWeddingListBg}
                    onClick={() => weddingListFileInputRef.current?.click()}
                  >
                    {weddingListBgPreviewUrl && !weddingListBgImgError ? "Sostituisci" : "Carica immagine"}
                  </Button>
                  {weddingListBgPreviewUrl && !weddingListBgImgError && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={disabled || uploadingWeddingListBg}
                      onClick={async () => {
                        await onDeleteWeddingListBg();
                        setWeddingListBgImgError(true);
                      }}
                    >
                      Rimuovi
                    </Button>
                  )}
                </Stack>
              </Stack>
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
            <Button
              variant="outlined"
              startIcon={<QrCode2Icon />}
              onClick={() => void onDownloadLandingQr()}
              disabled={!publicIdValid}
            >
              Scarica QR Landing
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
