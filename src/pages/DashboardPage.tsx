import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "../contexts/AuthContext";
import { useEventSettings } from "../hooks/useEventSettings";
import { useRsvp } from "../hooks/useRsvp";
import { useChecklist } from "../hooks/useChecklist";
import { useGuestList } from "../hooks/useGuestList";
import { useBudget } from "../hooks/useBudget";
import { useSuppliers } from "../hooks/useSuppliers";
import DashboardHeader from "../components/DashboardHeader";
import EventSettingsForm from "../components/EventSettingsForm";
import ChecklistTab from "../components/ChecklistTab";
import GuestListTab from "../components/GuestListTab";
import BudgetTab from "../components/BudgetTab";
import SuppliersTab from "../components/SuppliersTab";
import StatisticsTab from "../components/StatisticsTab";
import MediaTab from "../components/MediaTab";

export default function DashboardPage() {
  const { user, signOut, configError } = useAuth();
  const { handleSave, handleDownloadQr, handleDownloadRsvpQr, ...formProps } =
    useEventSettings(user?.id ?? "", user?.email);
  const { entries, stats, loading: rsvpLoading, error: rsvpError } = useRsvp(
    user?.id ?? "",
  );
  const checklistHook = useChecklist(user?.id ?? "");
  const guestListHook = useGuestList(user?.id ?? "");
  const budgetHook = useBudget(user?.id ?? "");
  const suppliersHook = useSuppliers(user?.id ?? "");
  const [tab, setTab] = useState(0);
  const [rsvpSubTab, setRsvpSubTab] = useState(0);

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
              <Tab label="Statistiche" />
              <Tab label="Media" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <EventSettingsForm
              {...formProps}
              onSave={handleSave}
              onDownloadQr={handleDownloadQr}
              onDownloadRsvpQr={handleDownloadRsvpQr}
            />
          )}

          {tab === 1 && (
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
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
          {tab === 2 && <ChecklistTab hook={checklistHook} />}
          {tab === 3 && <GuestListTab hook={guestListHook} publicId={formProps.normalizedPublicId} />}
          {tab === 4 && <BudgetTab hook={budgetHook} />}
          {tab === 5 && <SuppliersTab hook={suppliersHook} />}
          {tab === 6 && <StatisticsTab userId={user.id} />}
          {tab === 7 && <MediaTab userId={user.id} />}
        </Stack>
      </Container>
    </Box>
  );
}
