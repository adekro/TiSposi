import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
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
import DashboardHeader from "../components/DashboardHeader";
import EventSettingsForm from "../components/EventSettingsForm";

export default function DashboardPage() {
  const { user, signOut, configError } = useAuth();
  const { handleSave, handleDownloadQr, handleDownloadRsvpQr, ...formProps } =
    useEventSettings(user?.id ?? "", user?.email);
  const { entries, stats, loading: rsvpLoading, error: rsvpError } = useRsvp(
    user?.id ?? "",
  );
  const [tab, setTab] = useState(0);

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
    const header = ["Nome", "Presente", "N. Persone", "Menu", "Intolleranze", "Note", "Data"];
    const rows = entries.map((e) => [
      e.guest_name,
      e.attending ? "Sì" : "No",
      e.attending ? String(e.num_guests) : "0",
      e.menu_choice ?? "",
      e.dietary_restrictions ?? "",
      e.notes ?? "",
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
            <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
              <Tab label="Configurazione evento" />
              <Tab
                label={
                  stats.totalRsvp > 0
                    ? `RSVP (${stats.totalRsvp})`
                    : "RSVP"
                }
              />
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
              {/* Stats */}
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
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
