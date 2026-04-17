import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
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
import type { useBudget, BudgetFormData } from "../hooks/useBudget";

type BudgetHook = ReturnType<typeof useBudget>;

interface Props {
  hook: BudgetHook;
}

const EMPTY_FORM: BudgetFormData = {
  category: "",
  description: "",
  estimated_amount: 0,
  actual_amount: 0,
  paid: false,
  notes: null,
};

const fmt = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

export default function BudgetTab({ hook }: Props) {
  const { items, totals, loading, error, addItem, updateItem, deleteItem } = hook;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      category: item.category,
      description: item.description,
      estimated_amount: item.estimated_amount,
      actual_amount: item.actual_amount,
      paid: item.paid,
      notes: item.notes,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.category.trim()) { setFormError("La categoria è obbligatoria."); return; }
    if (!form.description.trim()) { setFormError("La descrizione è obbligatoria."); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload: BudgetFormData = {
        ...form,
        category: form.category.trim(),
        description: form.description.trim(),
        estimated_amount: Number(form.estimated_amount) || 0,
        actual_amount: Number(form.actual_amount) || 0,
        notes: form.notes?.trim() || null,
      };
      if (editId) {
        await updateItem(editId, payload);
      } else {
        await addItem(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteItem(id); } catch { /* ignore */ }
  };

  const handleTogglePaid = async (id: string, paid: boolean) => {
    try { await updateItem(id, { paid }); } catch { /* ignore */ }
  };

  // Group by category
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

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

      {/* Summary cards */}
      <Grid container spacing={2}>
        {[
          { label: "Budget previsto", value: totals.estimated, color: "primary.main" },
          { label: "Speso (reale)", value: totals.actual, color: "error.main" },
          { label: "Rimanente", value: totals.remaining, color: totals.remaining >= 0 ? "success.main" : "error.main" },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6" sx={{ color, fontWeight: 700 }}>{fmt(value)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Aggiungi voce
        </Button>
      </Box>

      {items.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nessuna voce di budget. Inizia ad aggiungerne una!
        </Typography>
      )}

      {/* Tables by category */}
      {Object.entries(groups).map(([category, catItems]) => {
        const catEstimated = catItems.reduce((s, i) => s + Number(i.estimated_amount), 0);
        const catActual = catItems.reduce((s, i) => s + Number(i.actual_amount), 0);
        return (
          <Box key={category}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                {category}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={`Prev. ${fmt(catEstimated)}`} size="small" variant="outlined" />
                <Chip label={`Reale ${fmt(catActual)}`} size="small" color="default" />
              </Stack>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Descrizione</TableCell>
                    <TableCell align="right">Previsto</TableCell>
                    <TableCell align="right">Reale</TableCell>
                    <TableCell align="center">Pagato</TableCell>
                    <TableCell align="right">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {catItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{item.description}</Typography>
                          {item.notes && (
                            <Typography variant="caption" color="text.secondary">{item.notes}</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{fmt(Number(item.estimated_amount))}</TableCell>
                      <TableCell align="right">{fmt(Number(item.actual_amount))}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          size="small"
                          checked={item.paid}
                          onChange={(e) => void handleTogglePaid(item.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifica">
                          <IconButton size="small" onClick={() => openEdit(item.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina">
                          <IconButton size="small" onClick={() => void handleDelete(item.id)} sx={{ color: "error.main" }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Modifica voce" : "Aggiungi voce di budget"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Categoria *"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                fullWidth
                size="small"
                placeholder="es. Venue, Catering, Fiori…"
              />
              <TextField
                label="Descrizione *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                fullWidth
                size="small"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Importo previsto (€)"
                type="number"
                value={form.estimated_amount}
                onChange={(e) => setForm({ ...form, estimated_amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Importo reale (€)"
                type="number"
                value={form.actual_amount}
                onChange={(e) => setForm({ ...form, actual_amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
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
