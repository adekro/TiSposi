import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import type { useActivities } from "../hooks/useActivities";
import type { ActivityFormData } from "../types";

type ActivitiesHook = ReturnType<typeof useActivities>;

interface Props {
  hook: ActivitiesHook;
}

const EMPTY_FORM: ActivityFormData = {
  title: "",
  description: "",
  materials: "",
  order: 0,
  done: false,
};

/** Split a materials string into an array of individual items. */
function parseMaterials(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ActivitiesTab({ hook }: Props) {
  const { activities, loading, error, addActivity, updateActivity, deleteActivity } = hook;

  // Dialog state (null = closed; "add" | id = editing)
  const [dialogMode, setDialogMode] = useState<"add" | string | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM, order: activities.length });
    setFormError("");
    setDialogMode("add");
  };

  const openEdit = (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;
    setFormData({
      title: activity.title,
      description: activity.description ?? "",
      materials: activity.materials ?? "",
      order: activity.order,
      done: activity.done,
    });
    setFormError("");
    setDialogMode(id);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setFormError("");
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setFormError("Il titolo è obbligatorio.");
      return;
    }
    setSaving(true);
    try {
      const payload: ActivityFormData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        materials: formData.materials?.trim() || null,
      };
      if (dialogMode === "add") {
        await addActivity(payload);
      } else if (dialogMode) {
        await updateActivity(dialogMode, payload);
      }
      closeDialog();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDone = async (id: string, current: boolean) => {
    try {
      await updateActivity(id, { done: !current });
    } catch {
      // ignore — will show stale state briefly
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const a = activities[index];
    const b = activities[index - 1];
    try {
      await updateActivity(a.id, { order: b.order });
      await updateActivity(b.id, { order: a.order });
    } catch {
      // ignore
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === activities.length - 1) return;
    const a = activities[index];
    const b = activities[index + 1];
    try {
      await updateActivity(a.id, { order: b.order });
      await updateActivity(b.id, { order: a.order });
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteActivity(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExportTxt = () => {
    const lines: string[] = ["ELENCO MATERIALI — ATTIVITÀ E GIOCHI\n"];
    for (const a of activities) {
      const items = parseMaterials(a.materials);
      if (items.length === 0) continue;
      lines.push(`• ${a.title}`);
      for (const item of items) {
        lines.push(`    - ${item}`);
      }
      lines.push("");
    }
    if (lines.length === 1) {
      lines.push("Nessun materiale specificato.");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "materiali-attivita.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const activitiesWithMaterials = activities.filter(
    (a) => parseMaterials(a.materials).length > 0,
  );

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700}>
          Attività pianificate
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Aggiungi attività
        </Button>
      </Stack>

      {/* Empty state */}
      {activities.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={6}>
          Nessuna attività ancora. Aggiungine una per iniziare!
        </Typography>
      )}

      {/* Activity cards */}
      <Stack spacing={2}>
        {activities.map((activity, index) => {
          const materials = parseMaterials(activity.materials);
          return (
            <Paper
              key={activity.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                opacity: activity.done ? 0.65 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                {/* Done checkbox */}
                <Checkbox
                  checked={activity.done}
                  onChange={() => void handleToggleDone(activity.id, activity.done)}
                  size="small"
                  sx={{ mt: -0.5 }}
                />

                {/* Content */}
                <Box flex={1} minWidth={0}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={activity.done ? { textDecoration: "line-through", color: "text.secondary" } : {}}
                    >
                      {activity.title}
                    </Typography>
                    {activity.done && (
                      <Chip label="Completata" color="success" size="small" />
                    )}
                  </Stack>

                  {activity.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={materials.length > 0 ? 1 : 0}
                      sx={{ whiteSpace: "pre-wrap" }}
                    >
                      {activity.description}
                    </Typography>
                  )}

                  {materials.length > 0 && (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {materials.map((m) => (
                        <Chip key={m} label={m} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Actions */}
                <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
                  <Tooltip title="Sposta su">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => void handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <KeyboardArrowUpIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Sposta giù">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => void handleMoveDown(index)}
                        disabled={index === activities.length - 1}
                      >
                        <KeyboardArrowDownIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Modifica">
                    <IconButton size="small" onClick={() => openEdit(activity.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Elimina">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(activity.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Materials summary accordion */}
      {activitiesWithMaterials.length > 0 && (
        <>
          <Divider />
          <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, "&::before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={600}>
                  Elenco materiali completo
                </Typography>
                <Chip
                  label={`${activitiesWithMaterials.length} attivit${activitiesWithMaterials.length === 1 ? "à" : "à"}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    Stampa
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportTxt}
                  >
                    Esporta TXT
                  </Button>
                </Stack>

                <Stack spacing={1.5} id="materials-print-area">
                  {activitiesWithMaterials.map((a) => (
                    <Box key={a.id}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {a.title}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mt={0.5}>
                        {parseMaterials(a.materials).map((m) => (
                          <Chip key={m} label={m} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </>
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogMode !== null}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === "add" ? "Aggiungi attività" : "Modifica attività"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={0.5}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Titolo *"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              label="Descrizione"
              value={formData.description ?? ""}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              placeholder="Breve descrizione dell'attività o del gioco…"
            />

            <TextField
              label="Materiali necessari"
              value={formData.materials ?? ""}
              onChange={(e) => setFormData((f) => ({ ...f, materials: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
              placeholder={"Un materiale per riga o separati da virgola.\nEs: riso, sacchettini, etichette"}
              helperText="Esempio: riso, sacchettini, etichette — oppure uno per riga"
            />

            <TextField
              label="Ordine"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))
              }
              inputProps={{ min: 0 }}
              sx={{ width: 130 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
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

      {/* Delete confirm dialog */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Elimina attività</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare questa attività? L'operazione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Annulla</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()}>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
