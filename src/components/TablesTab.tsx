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
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import type { useTables } from "../hooks/useTables";
import type { useGuestList } from "../hooks/useGuestList";
import type { TableFormData } from "../types";

type TablesHook = ReturnType<typeof useTables>;
type GuestListHook = ReturnType<typeof useGuestList>;

interface Props {
  tablesHook: TablesHook;
  guestListHook: GuestListHook;
}

const EMPTY_TABLE_FORM: TableFormData = {
  name: "",
  capacity: null,
  notes: null,
  order: 0,
};

export default function TablesTab({ tablesHook, guestListHook }: Props) {
  const { tables, loading: tablesLoading, error: tablesError, addTable, updateTable, deleteTable } = tablesHook;
  const { guests, rsvpByGuestId, updateGuest } = guestListHook;

  // Ritorna il numero di persone occupate da un ospite (da RSVP, default 1)
  const guestSeats = (guestId: string): number =>
    (rsvpByGuestId[guestId]?.attending ? rsvpByGuestId[guestId].num_guests : null) ?? 1;

  // Table add/edit dialog
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [tableForm, setTableForm] = useState<TableFormData>(EMPTY_TABLE_FORM);
  const [tableSaving, setTableSaving] = useState(false);
  const [tableFormError, setTableFormError] = useState("");

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Assign guest dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTargetTableId, setAssignTargetTableId] = useState<string | null>(null);
  const [assignGuestId, setAssignGuestId] = useState<string>("");

  const openAddTable = () => {
    setEditTableId(null);
    const nextOrder = tables.length > 0 ? Math.max(...tables.map((t) => t.order)) + 1 : 0;
    setTableForm({ ...EMPTY_TABLE_FORM, order: nextOrder });
    setTableFormError("");
    setTableDialogOpen(true);
  };

  const openEditTable = (id: string) => {
    const t = tables.find((t) => t.id === id);
    if (!t) return;
    setEditTableId(id);
    setTableForm({ name: t.name, capacity: t.capacity, notes: t.notes, order: t.order });
    setTableFormError("");
    setTableDialogOpen(true);
  };

  const handleSaveTable = async () => {
    if (!tableForm.name.trim()) {
      setTableFormError("Il nome del tavolo è obbligatorio.");
      return;
    }
    setTableSaving(true);
    setTableFormError("");
    try {
      const payload: TableFormData = {
        ...tableForm,
        name: tableForm.name.trim(),
        notes: tableForm.notes?.trim() || null,
        capacity:
          tableForm.capacity !== null && tableForm.capacity !== undefined && !isNaN(Number(tableForm.capacity))
            ? Number(tableForm.capacity)
            : null,
      };
      if (editTableId) {
        await updateTable(editTableId, payload);
      } else {
        await addTable(payload);
      }
      setTableDialogOpen(false);
    } catch (err) {
      setTableFormError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setTableSaving(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTableId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTable = async () => {
    if (!deleteTableId) return;
    setDeleting(true);
    try {
      await deleteTable(deleteTableId);
      setDeleteDialogOpen(false);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const openAssignDialog = (tableId: string) => {
    setAssignTargetTableId(tableId);
    setAssignGuestId("");
    setAssignDialogOpen(true);
  };

  const handleAssignGuest = async () => {
    if (!assignGuestId || !assignTargetTableId) return;
    try {
      await updateGuest(assignGuestId, { table_id: assignTargetTableId });
      setAssignDialogOpen(false);
    } catch {
      // ignore
    }
  };

  const handleUnassignGuest = async (guestId: string) => {
    try {
      await updateGuest(guestId, { table_id: null });
    } catch {
      // ignore
    }
  };

  const guestsAtTable = (tableId: string) => guests.filter((g) => g.table_id === tableId);
  const unassignedGuests = guests.filter((g) => !g.table_id);

  const totalAssignedGuests = guests.filter((g) => g.table_id !== null).length;
  const totalAssignedSeats = guests
    .filter((g) => g.table_id !== null)
    .reduce((sum, g) => sum + guestSeats(g.id), 0);
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity ?? 0), 0);

  if (tablesLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {tablesError && <Alert severity="error">{tablesError}</Alert>}

      {/* Summary chips */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
        <Chip
          label={`Tavoli: ${tables.length}`}
          variant="outlined"
          sx={{ fontSize: 14, py: 2.5 }}
        />
        <Chip
          label={`Ospiti assegnati: ${totalAssignedGuests}${totalAssignedSeats !== totalAssignedGuests ? ` (${totalAssignedSeats} posti)` : ""}`}
          color="primary"
          variant="outlined"
          sx={{ fontSize: 14, py: 2.5 }}
        />
        {totalCapacity > 0 && (
          <Chip
            label={`Capienza totale: ${totalCapacity}`}
            color="default"
            variant="outlined"
            sx={{ fontSize: 14, py: 2.5 }}
          />
        )}
        {unassignedGuests.length > 0 && (
          <Chip
            label={`Senza tavolo: ${unassignedGuests.length}`}
            color="warning"
            variant="outlined"
            sx={{ fontSize: 14, py: 2.5 }}
          />
        )}
      </Stack>

      {/* Add table button */}
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddTable} size="small">
          Aggiungi tavolo
        </Button>
      </Box>

      {tables.length === 0 && !tablesError && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nessun tavolo creato. Crea il primo tavolo per iniziare ad assegnare gli ospiti!
        </Typography>
      )}

      {/* Columns view */}
      {tables.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            overflowX: "auto",
            pb: 1,
            alignItems: "flex-start",
          }}
        >
          {tables.map((table) => {
            const assigned = guestsAtTable(table.id);
            const seatsOccupied = assigned.reduce((sum, g) => sum + guestSeats(g.id), 0);
            const seatsLabel =
              table.capacity != null
                ? `${seatsOccupied} / ${table.capacity} posti`
                : `${assigned.length} ospit${assigned.length === 1 ? "e" : "i"}${seatsOccupied !== assigned.length ? ` (${seatsOccupied} posti)` : ""}`;
            const overCapacity =
              table.capacity != null && seatsOccupied > table.capacity;

            return (
              <Paper
                key={table.id}
                sx={{
                  minWidth: 220,
                  maxWidth: 280,
                  p: 2,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
                elevation={2}
              >
                {/* Table header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1, mr: 1 }}>
                    {table.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Modifica tavolo">
                      <IconButton size="small" onClick={() => openEditTable(table.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Elimina tavolo">
                      <IconButton
                        size="small"
                        onClick={() => openDeleteConfirm(table.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Chip
                  label={seatsLabel}
                  size="small"
                  color={overCapacity ? "error" : "default"}
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                />

                {table.notes && (
                  <Typography variant="caption" color="text.secondary">
                    {table.notes}
                  </Typography>
                )}

                <Divider />

                {/* Guest list */}
                {assigned.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ py: 0.5 }}>
                    Nessun ospite assegnato
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {assigned.map((g) => {
                      const seats = guestSeats(g.id);
                      return (
                        <ListItem
                          key={g.id}
                          disableGutters
                          secondaryAction={
                            <Tooltip title="Rimuovi dal tavolo">
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => void handleUnassignGuest(g.id)}
                                sx={{ color: "text.secondary" }}
                              >
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          }
                          sx={{ pr: 4 }}
                        >
                          <ListItemText
                            primary={
                              seats > 1
                                ? `${g.full_name} ×${seats}`
                                : g.full_name
                            }
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => openAssignDialog(table.id)}
                  disabled={unassignedGuests.length === 0}
                  sx={{ mt: 0.5 }}
                >
                  Aggiungi ospite
                </Button>
              </Paper>
            );
          })}

          {/* "Senza tavolo" card */}
          {unassignedGuests.length > 0 && (
            <Paper
              sx={{
                minWidth: 220,
                maxWidth: 280,
                p: 2,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor: "action.hover",
              }}
              elevation={0}
              variant="outlined"
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Senza tavolo
              </Typography>
              <Chip
                label={`${unassignedGuests.length} ospit${unassignedGuests.length === 1 ? "e" : "i"}`}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
              <Divider />
              <List dense disablePadding>
                {unassignedGuests.map((g) => (
                  <ListItem
                    key={g.id}
                    disableGutters
                    secondaryAction={
                      tables.length > 0 ? (
                        <AssignInlineButton
                          tables={tables.map((t) => ({ id: t.id, name: t.name }))}
                          onAssign={(tableId) => void updateGuest(g.id, { table_id: tableId })}
                        />
                      ) : null
                    }
                    sx={{ pr: tables.length > 0 ? 6 : 0 }}
                  >
                    <ListItemText
                      primary={g.full_name}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}

      {/* ── Add/Edit table dialog ── */}
      <Dialog open={tableDialogOpen} onClose={() => setTableDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTableId ? "Modifica tavolo" : "Aggiungi tavolo"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {tableFormError && <Alert severity="error">{tableFormError}</Alert>}
            <TextField
              label="Nome tavolo *"
              value={tableForm.name}
              onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
              fullWidth
              size="small"
              autoFocus
            />
            <TextField
              label="Capienza (posti)"
              type="number"
              value={tableForm.capacity ?? ""}
              onChange={(e) =>
                setTableForm({
                  ...tableForm,
                  capacity: e.target.value === "" ? null : parseInt(e.target.value, 10),
                })
              }
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Note"
              value={tableForm.notes ?? ""}
              onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value || null })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialogOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={() => void handleSaveTable()} disabled={tableSaving}>
            {tableSaving ? "Salvataggio…" : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Elimina tavolo</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare il tavolo{" "}
            <strong>{tables.find((t) => t.id === deleteTableId)?.name ?? ""}</strong>?{" "}
            Gli ospiti assegnati non verranno eliminati, ma perderanno l&apos;associazione al tavolo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteTable()}
            disabled={deleting}
          >
            {deleting ? "Eliminazione…" : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Assign guest dialog ── */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Aggiungi ospite al tavolo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Ospite</InputLabel>
              <Select
                label="Ospite"
                value={assignGuestId}
                onChange={(e) => setAssignGuestId(e.target.value)}
              >
                <MenuItem value="">— Seleziona —</MenuItem>
                {unassignedGuests.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            onClick={() => void handleAssignGuest()}
            disabled={!assignGuestId}
          >
            Assegna
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── Inline "Assegna" button for the unassigned card ──────────────────────────
interface AssignInlineButtonProps {
  tables: { id: string; name: string }[];
  onAssign: (tableId: string) => void;
}

function AssignInlineButton({ tables, onAssign }: AssignInlineButtonProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const handleConfirm = () => {
    if (!selected) return;
    onAssign(selected);
    setOpen(false);
    setSelected("");
  };

  return (
    <>
      <Tooltip title="Assegna a un tavolo">
        <IconButton size="small" onClick={() => setOpen(true)} sx={{ color: "primary.main" }}>
          <PersonAddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assegna a un tavolo</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Tavolo</InputLabel>
            <Select
              label="Tavolo"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <MenuItem value="">— Seleziona —</MenuItem>
              {tables.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!selected}>
            Assegna
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
