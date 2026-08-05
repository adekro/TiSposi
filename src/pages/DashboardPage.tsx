import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon, Link as LinkIcon } from "@mui/icons-material";
import { AdminPanelSettings as AdminPanelSettingsIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import AdminPanel from "../components/AdminPanel";
import { useEventSettings } from "../hooks/useEventSettings";
import { useRsvp } from "../hooks/useRsvp";
import { useChecklist } from "../hooks/useChecklist";
import { useGuestList } from "../hooks/useGuestList";
import { useBudget } from "../hooks/useBudget";
import { useSuppliers } from "../hooks/useSuppliers";
import { useActivities } from "../hooks/useActivities";
import { useTables } from "../hooks/useTables";
import { useWeddingList } from "../hooks/useWeddingList";
import DashboardHeader from "../components/DashboardHeader";
import EventSettingsForm from "../components/EventSettingsForm";
import ChecklistTab from "../components/ChecklistTab";
import GuestListTab from "../components/GuestListTab";
import BudgetTab from "../components/BudgetTab";
import SuppliersTab from "../components/SuppliersTab";
import ActivitiesTab from "../components/ActivitiesTab";
import TablesTab from "../components/TablesTab";
import RoomLayoutTab from "../components/RoomLayoutTab";
import WeddingListTab from "../components/WeddingListTab";
import StatisticsTab from "../components/StatisticsTab";
import MediaTab from "../components/MediaTab";
import LandingBuilderTab from "../components/LandingBuilderTab";

const ADMIN_EMAIL = "e.croce88@gmail.com";

export default function DashboardPage() {
  const { user, signOut, configError } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const userId = user?.id ?? "";

  const {
    handleSave,
    handleDownloadQr,
    handleDownloadRsvpQr,
    handleDownloadLandingQr,
    ...formProps
  } =
    useEventSettings(userId, user?.email);
  const {
    entries,
    stats,
    loading: rsvpLoading,
    error: rsvpError,
    aligning: rsvpAligning,
    alignError: rsvpAlignError,
    unalignedEntries,
    alignEntries,
  } = useRsvp(userId);
  const checklistHook = useChecklist(userId);
  const guestListHook = useGuestList(userId);
  const budgetHook = useBudget(userId);
  const suppliersHook = useSuppliers(userId);
  const activitiesHook = useActivities(userId);
  const tablesHook = useTables(userId);
  const weddingListHook = useWeddingList(userId);
  const [tab, setTab] = useState(0);
  const [rsvpSubTab, setRsvpSubTab] = useState(0);
  const [guestSubTab, setGuestSubTab] = useState(0);
  const [alignDialogOpen, setAlignDialogOpen] = useState(false);
  const [alignSelections, setAlignSelections] = useState<Record<string, string>>({});
  const [alignDialogError, setAlignDialogError] = useState("");

  if (!user) {
    return null;
  }

  if (configError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error">{configError}</Alert>
        </Container>
      </Box>
    );
  }

  const handleExportCsv = () => {
    const header = [
      "Nome", "Presente", "N. Persone", "Menu", "Intolleranze", "Note",
      "Mezzo di trasporto", "Parcheggio", "Navetta", "Alloggio", "Note alloggio", "Data",
    ];
    const rows = entries.map((e) => [
      e.guest_name,
      e.attending ? "Sì" : "No",
      e.attending ? String(e.num_guests) : "0",
      e.menu_choice ?? "",
      e.dietary_restrictions ?? "",
      e.notes ?? "",
      e.arrival_method ?? "",
      e.needs_parking ? "Sì" : "No",
      e.needs_shuttle ? "Sì" : "No",
      e.needs_accommodation ? "Sì" : "No",
      e.accommodation_notes ?? "",
      new Date(e.created_at).toLocaleString("it-IT"),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rsvp.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const availableGuests = guestListHook.guests.filter((guest) => !guestListHook.rsvpByGuestId[guest.id]);
  const selectedGuestIds = new Set(Object.values(alignSelections).filter(Boolean));
  const isAlignConfirmDisabled =
    unalignedEntries.length === 0 ||
    unalignedEntries.some((entry) => !alignSelections[entry.id]) ||
    selectedGuestIds.size !== unalignedEntries.length;

  const openAlignDialog = () => {
    if (unalignedEntries.length === 0) return;
    const initialSelections: Record<string, string> = {};
    for (const entry of unalignedEntries) initialSelections[entry.id] = "";
    setAlignSelections(initialSelections);
    setAlignDialogError("");
    setAlignDialogOpen(true);
  };

  const closeAlignDialog = () => {
    if (rsvpAligning) return;
    setAlignDialogOpen(false);
    setAlignDialogError("");
  };

  const handleAlignSelectionChange = (entryId: string, guestId: string) => {
    setAlignDialogError("");
    setAlignSelections((prev) => ({ ...prev, [entryId]: guestId }));
  };

  const handleAlignConfirm = async () => {
    try {
      const mappings = unalignedEntries.map((entry) => ({
        entryId: entry.id,
        guestId: alignSelections[entry.id],
      }));
      await alignEntries(mappings);
      await guestListHook.refetch();
      closeAlignDialog();
    } catch (err) {
      setAlignDialogError(err instanceof Error ? err.message : "Errore durante l'allineamento RSVP.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf7f2 0%, #ffffff 100%)",
        py: 5,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <DashboardHeader
            email={user.email ?? ""}
            onSignOut={() => void signOut()}
          />

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tab}
              onChange={(_, v: number) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Configurazione evento" />
              <Tab label="Landing Builder" />
              <Tab
                label={
                  stats.totalRsvp > 0
                    ? `RSVP (${stats.totalRsvp})`
                    : "RSVP"
                }
              />
              <Tab
                label={
                  checklistHook.items.length > 0
                    ? `Checklist (${checklistHook.items.filter((i) => i.completed).length}/${checklistHook.items.length})`
                    : "Checklist"
                }
              />
              <Tab
                label={
                  guestListHook.stats.total > 0
                    ? `Invitati (${guestListHook.stats.total})`
                    : "Invitati"
                }
              />
              <Tab label="Budget" />
              <Tab
                label={
                  suppliersHook.suppliers.length > 0
                    ? `Fornitori (${suppliersHook.suppliers.length})`
                    : "Fornitori"
                }
              />
              <Tab
                label={
                  activitiesHook.activities.length > 0
                    ? `Attività (${activitiesHook.activities.length})`
                    : "Attività"
                }
              />
              <Tab
                label={
                  weddingListHook.items.length > 0
                    ? `Lista Nozze (${weddingListHook.items.length})`
                    : "Lista Nozze"
                }
              />
              <Tab label="Statistiche" />
              <Tab label="Media" />
              {isAdmin && (
                <Tab
                  label="Admin"
                  icon={<AdminPanelSettingsIcon fontSize="small" />}
                  iconPosition="start"
                  sx={{ color: "warning.main" }}
                />
              )}
            </Tabs>
          </Box>

          {tab === 0 && (
            <EventSettingsForm
              {...formProps}
              onSave={handleSave}
              onDownloadQr={handleDownloadQr}
              onDownloadRsvpQr={handleDownloadRsvpQr}
              onDownloadLandingQr={handleDownloadLandingQr}
            />
          )}

          {tab === 1 && (
            <LandingBuilderTab
              userId={userId}
              publicId={formProps.normalizedPublicId}
              spouses={formProps.form.spouses}
            />
          )}

          {tab === 2 && (
            <Stack spacing={3}>
              {/* Stats aggregate */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                flexWrap="wrap"
              >
                <Chip
                  label={`Risposte totali: ${stats.totalRsvp}`}
                  color="default"
                  variant="outlined"
                  sx={{ fontSize: 14, py: 2.5 }}
                />
                <Chip
                  label={`Presenti: ${stats.totalAttending} (${stats.totalPeople} persone)`}
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: 14, py: 2.5 }}
                />
                <Chip
                  label={`Assenti: ${stats.totalNotAttending}`}
                  color="error"
                  variant="outlined"
                  sx={{ fontSize: 14, py: 2.5 }}
                />
              </Stack>

              {rsvpError && <Alert severity="error">{rsvpError}</Alert>}

              {!rsvpLoading && entries.length === 0 && !rsvpError && (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  Nessuna risposta ricevuta ancora. Condividi il QR RSVP con gli ospiti!
                </Typography>
              )}

              {entries.length > 0 && (
                <>
                  {/* Sotto-tab */}
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                      value={rsvpSubTab}
                      onChange={(_, v: number) => setRsvpSubTab(v)}
                    >
                      <Tab label={`Risposte (${entries.length})`} />
                      <Tab label="Logistica" />
                    </Tabs>
                  </Box>

                  {/* ── Sub-tab 0: Risposte ── */}
                  {rsvpSubTab === 0 && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
                        {unalignedEntries.length > 0 && (
                          <Button
                            variant="contained"
                            startIcon={<LinkIcon />}
                            onClick={openAlignDialog}
                            size="small"
                          >
                            {`Allinea (${unalignedEntries.length})`}
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={handleExportCsv}
                          size="small"
                        >
                          Esporta CSV
                        </Button>
                      </Box>

                      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Nome</TableCell>
                              <TableCell>Presenza</TableCell>
                              <TableCell align="center">Persone</TableCell>
                              <TableCell>Menu</TableCell>
                              <TableCell>Intolleranze</TableCell>
                              <TableCell>Note</TableCell>
                              <TableCell>Data</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {entries.map((e) => (
                              <TableRow key={e.id} hover>
                                <TableCell>{e.guest_name}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={e.attending ? "Sì ✓" : "No ✗"}
                                    color={e.attending ? "success" : "error"}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {e.attending ? e.num_guests : "—"}
                                </TableCell>
                                <TableCell>{e.menu_choice ?? "—"}</TableCell>
                                <TableCell>{e.dietary_restrictions ?? "—"}</TableCell>
                                <TableCell>{e.notes ?? "—"}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                  {new Date(e.created_at).toLocaleDateString("it-IT")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}

                  {/* ── Sub-tab 1: Logistica ── */}
                  {rsvpSubTab === 1 && (
                    <Stack spacing={3}>
                      {stats.totalAttending === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                          Nessun ospite confermato ancora.
                        </Typography>
                      ) : (
                        <>
                          {/* Chips aggregate mezzo di trasporto */}
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Mezzo di trasporto
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {stats.logisticsStats.auto > 0 && (
                                <Chip label={`Auto 🚗: ${stats.logisticsStats.auto}`} variant="outlined" />
                              )}
                              {stats.logisticsStats.treno > 0 && (
                                <Chip label={`Treno 🚂: ${stats.logisticsStats.treno}`} variant="outlined" />
                              )}
                              {stats.logisticsStats.aereo > 0 && (
                                <Chip label={`Aereo ✈️: ${stats.logisticsStats.aereo}`} variant="outlined" />
                              )}
                              {stats.logisticsStats.altro > 0 && (
                                <Chip label={`Altro: ${stats.logisticsStats.altro}`} variant="outlined" />
                              )}
                              {stats.logisticsStats.noMethod > 0 && (
                                <Chip label={`Non specificato: ${stats.logisticsStats.noMethod}`} variant="outlined" color="default" />
                              )}
                            </Stack>
                          </Box>

                          <Divider />

                          {/* Chips richieste logistiche */}
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Richieste logistiche
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip
                                label={`Parcheggio 🅿️: ${stats.logisticsStats.needsParking}`}
                                color={stats.logisticsStats.needsParking > 0 ? "warning" : "default"}
                                variant="outlined"
                              />
                              <Chip
                                label={`Navetta 🚌: ${stats.logisticsStats.needsShuttle}`}
                                color={stats.logisticsStats.needsShuttle > 0 ? "warning" : "default"}
                                variant="outlined"
                              />
                              <Chip
                                label={`Alloggio 🏨: ${stats.logisticsStats.needsAccommodation}`}
                                color={stats.logisticsStats.needsAccommodation > 0 ? "warning" : "default"}
                                variant="outlined"
                              />
                            </Stack>
                          </Box>

                          <Divider />

                          {/* Tabella dettaglio ospiti presenti */}
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Dettaglio per ospite (presenti)
                            </Typography>
                            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Mezzo</TableCell>
                                    <TableCell align="center">Parcheggio</TableCell>
                                    <TableCell align="center">Navetta</TableCell>
                                    <TableCell align="center">Alloggio</TableCell>
                                    <TableCell>Note alloggio</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {entries
                                    .filter((e) => e.attending)
                                    .map((e) => (
                                      <TableRow key={e.id} hover>
                                        <TableCell>{e.guest_name}</TableCell>
                                        <TableCell>
                                          {e.arrival_method
                                            ? { auto: "Auto 🚗", treno: "Treno 🚂", aereo: "Aereo ✈️", altro: "Altro" }[e.arrival_method]
                                            : "—"}
                                        </TableCell>
                                        <TableCell align="center">
                                          {e.needs_parking ? "✓" : "—"}
                                        </TableCell>
                                        <TableCell align="center">
                                          {e.needs_shuttle ? "✓" : "—"}
                                        </TableCell>
                                        <TableCell align="center">
                                          {e.needs_accommodation ? "✓" : "—"}
                                        </TableCell>
                                        <TableCell>{e.accommodation_notes ?? "—"}</TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </>
                      )}
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          )}
          {tab === 3 && <ChecklistTab hook={checklistHook} />}
          {tab === 4 && (
            <Stack spacing={2}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={guestSubTab}
                  onChange={(_, v: number) => setGuestSubTab(v)}
                >
                  <Tab
                    label={
                      guestListHook.stats.total > 0
                        ? `Lista (${guestListHook.stats.total})`
                        : "Lista"
                    }
                  />
                  <Tab
                    label={
                      tablesHook.tables.length > 0
                        ? `Tavoli (${tablesHook.tables.length})`
                        : "Tavoli"
                    }
                  />
                  <Tab label="Layout" />
                </Tabs>
              </Box>
              {guestSubTab === 0 && (
                <GuestListTab
                  hook={guestListHook}
                  publicId={formProps.normalizedPublicId}
                  tables={tablesHook.tables}
                  assignments={tablesHook.assignments}
                />
              )}
              {guestSubTab === 1 && (
                <TablesTab tablesHook={tablesHook} guestListHook={guestListHook} />
              )}
              {guestSubTab === 2 && (
                <RoomLayoutTab
                  userId={userId}
                  tablesHook={tablesHook}
                  guestListHook={guestListHook}
                  spouses={formProps.form.spouses}
                />
              )}
            </Stack>
          )}
          {tab === 5 && <BudgetTab hook={budgetHook} />}
          {tab === 6 && <SuppliersTab hook={suppliersHook} />}
          {tab === 7 && <ActivitiesTab hook={activitiesHook} />}
          {tab === 8 && <WeddingListTab hook={weddingListHook} />}
          {tab === 9 && <StatisticsTab userId={userId} />}
          {tab === 10 && <MediaTab userId={userId} />}
          {tab === 11 && isAdmin && <AdminPanel />}
        </Stack>
      </Container>

      <Dialog open={alignDialogOpen} onClose={closeAlignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Allinea RSVP agli invitati</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Associa ogni RSVP non ancora collegato a un invitato della lista.
            </Typography>

            {(alignDialogError || rsvpAlignError) && (
              <Alert severity="error">{alignDialogError || rsvpAlignError}</Alert>
            )}

            {unalignedEntries.length === 0 ? (
              <Alert severity="info">Tutti gli RSVP sono già allineati.</Alert>
            ) : (
              unalignedEntries.map((entry) => {
                const selectedGuestId = alignSelections[entry.id] ?? "";
                return (
                  <Stack
                    key={entry.id}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <TextField
                      label="RSVP"
                      value={`${entry.guest_name} • ${new Date(entry.created_at).toLocaleDateString("it-IT")}`}
                      size="small"
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel>Invitato</InputLabel>
                      <Select
                        value={selectedGuestId}
                        label="Invitato"
                        onChange={(e) => handleAlignSelectionChange(entry.id, e.target.value)}
                      >
                        {availableGuests.map((guest) => {
                          const isTakenElsewhere =
                            guest.id !== selectedGuestId && selectedGuestIds.has(guest.id);
                          return (
                            <MenuItem key={guest.id} value={guest.id} disabled={isTakenElsewhere}>
                              {guest.full_name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Stack>
                );
              })
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAlignDialog} disabled={rsvpAligning}>
            Annulla
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleAlignConfirm()}
            disabled={isAlignConfirmDisabled || rsvpAligning}
          >
            {rsvpAligning ? "Allineamento…" : "Conferma"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
