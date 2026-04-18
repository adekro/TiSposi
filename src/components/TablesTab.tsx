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
  const {
    tables,
    assignments,
    loading: tablesLoading,
    error: tablesError,
    addTable,
    updateTable,
    deleteTable,
    assignGuest,
    removeAssignment,
    remainingSeatsForGuest,
  } = tablesHook;
  const { guests, rsvpByGuestId } = guestListHook;

  // Totale posti di un invitato (da RSVP, default 1)
  const guestTotalSeats = (guestId: string): number =>
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
  const [assignNumSeats, setAssignNumSeats] = useState<number>(1);

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
      setTableFormError("Il nome del tavolo Ã¨ obbligatorio.");
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
    setAssignNumSeats(1);
    setAssignDialogOpen(true);
  };

  // Quando si seleziona un ospite nel dialog, precompila il numero di posti rimanenti
  const handleSelectAssignGuest = (guestId: string) => {
    setAssignGuestId(guestId);
    if (guestId) {
      const remaining = remainingSeatsForGuest(guestId, guestTotalSeats(guestId));
      setAssignNumSeats(remaining > 0 ? remaining : 1);
    } else {
      setAssignNumSeats(1);
    }
  };

  const handleAssignGuest = async () => {
    if (!assignGuestId || !assignTargetTableId || assignNumSeats < 1) return;
    try {
      await assignGuest(assignGuestId, assignTargetTableId, assignNumSeats);
      setAssignDialogOpen(false);
    } catch {
      // ignore
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await removeAssignment(assignmentId);
    } catch {
      // ignore
    }
  };

  // Assignments per un tavolo specifico, con il guest object allegato
  const assignmentsAtTable = (tableId: string) =>
    assignments
      .filter((a) => a.table_id === tableId)
      .map((a) => ({ assignment: a, guest: guests.find((g) => g.id === a.guest_id) }))
      .filter((x): x is { assignment: typeof x.assignment; guest: NonNullable<typeof x.guest> } => !!x.guest);

  // Ospiti che hanno ancora posti non assegnati (non assegnati del tutto O parzialmente)
  const guestsWithRemainingSeats = guests.filter((g) => {
    const total = guestTotalSeats(g.id);
    return remainingSeatsForGuest(g.id, total) > 0;
  });

  // Ospiti non assegnati del tutto
  const fullyUnassignedGuests = guests.filter((g) => !assignments.some((a) => a.guest_id === g.id));

  // Ospiti parzialmente assegnati (hanno almeno 1 assignment ma anche posti rimanenti)
  const partiallyAssignedGuests = guests.filter((g) => {
    const hasAssignment = assignments.some((a) => a.guest_id === g.id);
    const total = guestTotalSeats(g.id);
    return hasAssignment && remainingSeatsForGuest(g.id, total) > 0;
  });

  const totalAssignedGuests = guests.filter((g) => assignments.some((a) => a.guest_id === g.id)).length;
  const totalAssignedSeats = assignments.reduce((sum, a) => sum + a.num_seats, 0);
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity ?? 0), 0);

  // Ospiti disponibili per il dialog di assegnazione (posti rimanenti > 0,
  // ma non giÃ  assegnati al tavolo target)
  const availableGuestsForAssign = guestsWithRemainingSeats.filter(
    (g) => !assignments.some((a) => a.guest_id === g.id && a.table_id === assignTargetTableId)
  );

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
        {fullyUnassignedGuests.length > 0 && (
          <Chip
            label={`Senza tavolo: ${fullyUnassignedGuests.length}`}
            color="warning"
            variant="outlined"
            sx={{ fontSize: 14, py: 2.5 }}
          />
        )}
        {partiallyAssignedGuests.length > 0 && (
          <Chip
            label={`Parzialmente assegnati: ${partiallyAssignedGuests.length}`}
            color="info"
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
            const atTable = assignmentsAtTable(table.id);
            const seatsOccupied = atTable.reduce((sum, x) => sum + x.assignment.num_seats, 0);
            const seatsLabel =
              table.capacity != null
                ? `${seatsOccupied} / ${table.capacity} posti`
                : `${atTable.length} ospit${atTable.length === 1 ? "e" : "i"}${seatsOccupied !== atTable.length ? ` (${seatsOccupied} posti)` : ""}`;
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
                {atTable.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ py: 0.5 }}>
                    Nessun ospite assegnato
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {atTable.map(({ assignment, guest }) => (
                      <ListItem
                        key={assignment.id}
                        disableGutters
                        secondaryAction={
                          <Tooltip title="Rimuovi dal tavolo">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => void handleRemoveAssignment(assignment.id)}
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
                            assignment.num_seats > 1
                              ? `${guest.full_name} Ã—${assignment.num_seats}`
                              : guest.full_name
                          }
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => openAssignDialog(table.id)}
                  disabled={availableGuestsForAssign.length === 0 && assignTargetTableId !== table.id}
                  sx={{ mt: 0.5 }}
                >
                  Aggiungi ospite
                </Button>
              </Paper>
            );
          })}

          {/* "Senza tavolo" card â€” mostra ospiti non assegnati del tutto */}
          {guestsWithRemainingSeats.length > 0 && (
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
                Da assegnare
              </Typography>
              <Chip
                label={`${guestsWithRemainingSeats.length} ospit${guestsWithRemainingSeats.length === 1 ? "e" : "i"} con posti liberi`}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              />
              <Divider />
              <List dense disablePadding>
                {guestsWithRemainingSeats.map((g) => {
                  const total = guestTotalSeats(g.id);
                  const remaining = remainingSeatsForGuest(g.id, total);
                  const isPartial = assignments.some((a) => a.guest_id === g.id);
                  return (
                    <ListItem
                      key={g.id}
                      disableGutters
                      secondaryAction={
                        tables.length > 0 ? (
                          <AssignInlineButton
                            guestId={g.id}
                            remainingSeats={remaining}
                            tables={tables.map((t) => ({ id: t.id, name: t.name }))}
                            excludeTableIds={assignments
                              .filter((a) => a.guest_id === g.id)
                              .map((a) => a.table_id)}
                            onAssign={(tableId, numSeats) => void assignGuest(g.id, tableId, numSeats)}
                          />
                        ) : null
                      }
                      sx={{ pr: tables.length > 0 ? 6 : 0 }}
                    >
                      <ListItemText
                        primary={
                          isPartial
                            ? `${g.full_name} (${remaining}/${total} rimasti)`
                            : remaining > 1
                            ? `${g.full_name} Ã—${remaining}`
                            : g.full_name
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          color: isPartial ? "info.main" : undefined,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          )}
        </Box>
      )}

      {/* â”€â”€ Add/Edit table dialog â”€â”€ */}
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
            {tableSaving ? "Salvataggioâ€¦" : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* â”€â”€ Delete confirmation dialog â”€â”€ */}
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
            {deleting ? "Eliminazioneâ€¦" : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* â”€â”€ Assign guest dialog â”€â”€ */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Aggiungi ospite al tavolo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Ospite</InputLabel>
              <Select
                label="Ospite"
                value={assignGuestId}
                onChange={(e) => handleSelectAssignGuest(e.target.value)}
              >
                <MenuItem value="">â€” Seleziona â€”</MenuItem>
                {guests
                  .filter(
                    (g) =>
                      remainingSeatsForGuest(g.id, guestTotalSeats(g.id)) > 0 &&
                      !assignments.some((a) => a.guest_id === g.id && a.table_id === assignTargetTableId)
                  )
                  .map((g) => {
                    const total = guestTotalSeats(g.id);
                    const remaining = remainingSeatsForGuest(g.id, total);
                    return (
                      <MenuItem key={g.id} value={g.id}>
                        {g.full_name}
                        {remaining < total ? ` (${remaining} di ${total} rimasti)` : remaining > 1 ? ` (Ã—${remaining})` : ""}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
            {assignGuestId && (
              <TextField
                label="Quanti posti assegnare a questo tavolo?"
                type="number"
                value={assignNumSeats}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const maxSeats = remainingSeatsForGuest(assignGuestId, guestTotalSeats(assignGuestId));
                  setAssignNumSeats(Math.min(Math.max(1, isNaN(val) ? 1 : val), maxSeats));
                }}
                fullWidth
                size="small"
                inputProps={{
                  min: 1,
                  max: remainingSeatsForGuest(assignGuestId, guestTotalSeats(assignGuestId)),
                }}
                helperText={`Max: ${remainingSeatsForGuest(assignGuestId, guestTotalSeats(assignGuestId))} posti disponibili`}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            onClick={() => void handleAssignGuest()}
            disabled={!assignGuestId || assignNumSeats < 1}
          >
            Assegna
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// â”€â”€ Inline "Assegna" button for the unassigned card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface AssignInlineButtonProps {
  guestId: string;
  remainingSeats: number;
  tables: { id: string; name: string }[];
  excludeTableIds: string[];
  onAssign: (tableId: string, numSeats: number) => void;
}

function AssignInlineButton({ remainingSeats, tables, excludeTableIds, onAssign }: AssignInlineButtonProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [numSeats, setNumSeats] = useState(remainingSeats);

  const availableTables = tables.filter((t) => !excludeTableIds.includes(t.id));

  const handleOpen = () => {
    setSelected("");
    setNumSeats(remainingSeats);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!selected || numSeats < 1) return;
    onAssign(selected, numSeats);
    setOpen(false);
    setSelected("");
  };

  return (
    <>
      <Tooltip title="Assegna a un tavolo">
        <IconButton size="small" onClick={handleOpen} sx={{ color: "primary.main" }}>
          <PersonAddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assegna a un tavolo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Tavolo</InputLabel>
              <Select
                label="Tavolo"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <MenuItem value="">â€” Seleziona â€”</MenuItem>
                {availableTables.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quanti posti assegnare?"
              type="number"
              value={numSeats}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setNumSeats(Math.min(Math.max(1, isNaN(val) ? 1 : val), remainingSeats));
              }}
              size="small"
              fullWidth
              inputProps={{ min: 1, max: remainingSeats }}
              helperText={`Max disponibili: ${remainingSeats}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!selected || numSeats < 1}>
            Assegna
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
