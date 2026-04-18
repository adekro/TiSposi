import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CollectionsIcon from "@mui/icons-material/Collections";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { useGuestList, GuestFormData } from "../hooks/useGuestList";
import type { RsvpStatus } from "../types";

type GuestListHook = ReturnType<typeof useGuestList>;

interface Props {
  hook: GuestListHook;
  publicId: string;
}

const EMPTY_FORM: GuestFormData = {
  full_name: "",
  email: null,
  phone: null,
  table_number: null,
  rsvp_status: "pending",
  notes: null,
};

const statusLabel: Record<RsvpStatus, string> = {
  pending: "In attesa",
  confirmed: "Confermato",
  declined: "Declinato",
};

const statusColor: Record<RsvpStatus, "default" | "success" | "error"> = {
  pending: "default",
  confirmed: "success",
  declined: "error",
};

export default function GuestListTab({ hook, publicId }: Props) {
  const { guests, stats, rsvpByGuestId, loading, error, addGuest, updateGuest, deleteGuest } = hook;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GuestFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const guest = guests.find((g) => g.id === id);
    if (!guest) return;
    setEditId(id);
    setForm({
      full_name: guest.full_name,
      email: guest.email,
      phone: guest.phone,
      table_number: guest.table_number,
      rsvp_status: guest.rsvp_status,
      notes: guest.notes,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setFormError("Il nome è obbligatorio.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload: GuestFormData = {
        ...form,
        full_name: form.full_name.trim(),
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        table_number: form.table_number?.trim() || null,
        notes: form.notes?.trim() || null,
      };
      if (editId) {
        await updateGuest(editId, payload);
      } else {
        await addGuest(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuest(id);
    } catch {
      // ignore
    }
  };

  const buildRsvpUrl = (guestId: string, guestName: string) =>
    `${window.location.origin}/${encodeURIComponent(publicId)}/rsvp` +
    `?guest_id=${encodeURIComponent(guestId)}&name=${encodeURIComponent(guestName)}`;

  const buildGalleryUrl = () =>
    `${window.location.origin}/${encodeURIComponent(publicId)}/gallery`;

  const cleanPhone = (phone: string | null): string =>
    phone ? phone.replace(/[^\d+]/g, "") : "";

  const buildWaUrl = (phone: string | null, text: string): string => {
    const p = cleanPhone(phone);
    return p
      ? `https://wa.me/${p}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const openWhatsAppRsvp = (guestId: string, guestName: string, phone: string | null) => {
    const link = buildRsvpUrl(guestId, guestName);
    const text = `Ciao ${guestName}! Ti aspettiamo al nostro matrimonio 💍 Conferma la tua presenza qui: ${link}`;
    window.open(buildWaUrl(phone, text), "_blank", "noopener,noreferrer");
  };

  const openWhatsAppGallery = (guestName: string, phone: string | null) => {
    const link = buildGalleryUrl();
    const text = `Ciao ${guestName}! Ecco il link alla nostra galleria foto del matrimonio 📸 ${link}`;
    window.open(buildWaUrl(phone, text), "_blank", "noopener,noreferrer");
  };

  const handleExportCsv = () => {
    const header = ["Nome", "Email", "Telefono", "Tavolo", "Stato", "Note"];
    const rows = guests.map((g) => [
      g.full_name,
      g.email ?? "",
      g.phone ?? "",
      g.table_number ?? "",
      statusLabel[g.rsvp_status],
      g.notes ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lista-invitati.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Stats */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
        <Chip label={`Totale: ${stats.total}`} variant="outlined" sx={{ fontSize: 14, py: 2.5 }} />
        <Chip label={`Confermati: ${stats.confirmed}`} color="success" variant="outlined" sx={{ fontSize: 14, py: 2.5 }} />
        <Chip label={`Declinati: ${stats.declined}`} color="error" variant="outlined" sx={{ fontSize: 14, py: 2.5 }} />
        <Chip label={`In attesa: ${stats.pending}`} color="default" variant="outlined" sx={{ fontSize: 14, py: 2.5 }} />
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {guests.length > 0 && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv} size="small">
            Esporta CSV
          </Button>
        )}
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Aggiungi ospite
        </Button>
      </Stack>

      {guests.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nessun ospite nella lista. Inizia ad aggiungerne uno!
        </Typography>
      )}

      {guests.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Nome</TableCell>
                <TableCell>Email / Tel</TableCell>
                <TableCell>Tavolo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests.map((g) => {
                const rsvp = rsvpByGuestId[g.id];
                const isOpen = expandedId === g.id;
                return (
                  <>
                    <TableRow key={g.id} hover sx={{ "& > *": { borderBottom: rsvp && isOpen ? "unset" : undefined } }}>
                      <TableCell padding="checkbox">
                        {rsvp ? (
                          <IconButton size="small" onClick={() => setExpandedId(isOpen ? null : g.id)}>
                            {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                          </IconButton>
                        ) : null}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{g.full_name}</TableCell>
                      <TableCell>
                        <Stack>
                          {g.email && <Typography variant="caption">{g.email}</Typography>}
                          {g.phone && <Typography variant="caption">{g.phone}</Typography>}
                          {!g.email && !g.phone && "—"}
                        </Stack>
                      </TableCell>
                      <TableCell>{g.table_number ?? "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel[g.rsvp_status]}
                          color={statusColor[g.rsvp_status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Invia link RSVP via WhatsApp">
                          <IconButton
                            size="small"
                            onClick={() => openWhatsAppRsvp(g.id, g.full_name, g.phone)}
                            sx={{ color: "#25D366" }}
                            disabled={!publicId}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Invia link galleria via WhatsApp">
                          <IconButton
                            size="small"
                            onClick={() => openWhatsAppGallery(g.full_name, g.phone)}
                            sx={{ color: "primary.main" }}
                            disabled={!publicId}
                          >
                            <CollectionsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifica">
                          <IconButton size="small" onClick={() => openEdit(g.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina">
                          <IconButton size="small" onClick={() => void handleDelete(g.id)} sx={{ color: "error.main" }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    {rsvp && (
                      <TableRow key={`${g.id}-rsvp`}>
                        <TableCell colSpan={6} sx={{ py: 0, bgcolor: "action.hover" }}>
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ px: 3, py: 1.5 }}>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Presenza</Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {rsvp.attending ? `✓ Presente (${rsvp.num_guests} ${rsvp.num_guests === 1 ? "persona" : "persone"})` : "✗ Non presente"}
                                  </Typography>
                                </Box>
                                {rsvp.menu_choice && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Menu</Typography>
                                    <Typography variant="body2">{rsvp.menu_choice}</Typography>
                                  </Box>
                                )}
                                {rsvp.dietary_restrictions && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Intolleranze</Typography>
                                    <Typography variant="body2">{rsvp.dietary_restrictions}</Typography>
                                  </Box>
                                )}
                                {rsvp.notes && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Note</Typography>
                                    <Typography variant="body2">{rsvp.notes}</Typography>
                                  </Box>
                                )}
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Risposta il</Typography>
                                  <Typography variant="body2">{new Date(rsvp.created_at).toLocaleDateString("it-IT")}</Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Modifica ospite" : "Aggiungi ospite"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Nome completo *"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              fullWidth
              size="small"
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value || null })}
                fullWidth
                size="small"
                type="email"
              />
              <TextField
                label="Telefono"
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
                fullWidth
                size="small"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Tavolo"
                value={form.table_number ?? ""}
                onChange={(e) => setForm({ ...form, table_number: e.target.value || null })}
                fullWidth
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Stato RSVP</InputLabel>
                <Select
                  label="Stato RSVP"
                  value={form.rsvp_status}
                  onChange={(e) => setForm({ ...form, rsvp_status: e.target.value as RsvpStatus })}
                >
                  <MenuItem value="pending">In attesa</MenuItem>
                  <MenuItem value="confirmed">Confermato</MenuItem>
                  <MenuItem value="declined">Declinato</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Note"
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Salvataggio…" : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
