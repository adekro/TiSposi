import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { useWeddingList } from "../hooks/useWeddingList";
import type { WeddingListFormData } from "../types";

type WeddingListHook = ReturnType<typeof useWeddingList>;

interface Props {
  hook: WeddingListHook;
}

const EMPTY_FORM: WeddingListFormData = {
  title: "",
  description: null,
  url: "",
  order: 0,
};

export default function WeddingListTab({ hook }: Props) {
  const { items, loading, error, addItem, updateItem, deleteItem, reorderItem } = hook;

  // Add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<WeddingListFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditId(null);
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 0;
    setForm({ ...EMPTY_FORM, order: nextOrder });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setEditId(id);
    setForm({
      title: item.title,
      description: item.description,
      url: item.url,
      order: item.order,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("Il titolo è obbligatorio.");
      return;
    }
    if (!form.url.trim()) {
      setFormError("L'URL è obbligatorio.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload: WeddingListFormData = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        url: form.url.trim(),
        order: form.order,
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

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteItem(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch {
      // errors surface via hook
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Aggiungi regalo
        </Button>
      </Box>

      {items.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nessun regalo nella lista. Aggiungi il primo!
        </Typography>
      )}

      {items.map((item, idx) => (
        <Card key={item.id} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              {/* Riordino ▲/▼ */}
              <Stack>
                <Tooltip title="Sposta su">
                  <span>
                    <IconButton
                      size="small"
                      disabled={idx === 0}
                      onClick={() => void reorderItem(item.id, "up")}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Sposta giù">
                  <span>
                    <IconButton
                      size="small"
                      disabled={idx === items.length - 1}
                      onClick={() => void reorderItem(item.id, "down")}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>

              {/* Contenuto */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap>
                  {item.title}
                </Typography>
                {item.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.description}
                  </Typography>
                )}
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="body2"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
                >
                  {item.url.length > 60 ? item.url.slice(0, 60) + "…" : item.url}
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Link>
              </Box>

              {/* Azioni */}
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Modifica">
                  <IconButton size="small" onClick={() => openEdit(item.id)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Elimina">
                  <IconButton size="small" color="error" onClick={() => openDelete(item.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* ── Dialog Add/Edit ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Modifica regalo" : "Aggiungi regalo"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Titolo *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              autoFocus
              placeholder="Robot da cucina, Weekend spa..."
            />
            <TextField
              label="Descrizione"
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value || null }))
              }
              fullWidth
              multiline
              minRows={2}
              placeholder="Modello consigliato, colore preferito..."
            />
            <TextField
              label="URL *"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              fullWidth
              placeholder="https://www.amazon.it/..."
              helperText="Link al negozio o alla pagina del prodotto"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Annulla
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? "Salvataggio…" : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog conferma eliminazione ── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Elimina regalo</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare questo regalo dalla lista nozze?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Annulla
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? "Eliminazione…" : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
