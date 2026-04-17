import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import type { useGuestList, GuestFormData } from "../hooks/useGuestList";
import type { RsvpStatus } from "../types";

type GuestListHook = ReturnType<typeof useGuestList>;

interface Props {
  hook: GuestListHook;
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

export default function GuestListTab({ hook }: Props) {
  const { guests, stats, loading, error, addGuest, updateGuest, deleteGuest } = hook;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GuestFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
                <TableCell>Nome</TableCell>
                <TableCell>Email / Tel</TableCell>
                <TableCell>Tavolo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests.map((g) => (
                <TableRow key={g.id} hover>
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
              ))}
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
