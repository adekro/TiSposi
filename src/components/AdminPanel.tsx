import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useAuth } from "../contexts/AuthContext";
import type { AdminEventRow } from "../types";

export default function AdminPanel() {
  const { session, startImpersonation, impersonatedUserId } = useAuth();
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    fetch("/api/admin/events", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `Errore ${res.status}`);
        }
        return res.json() as Promise<{ events: AdminEventRow[] }>;
      })
      .then(({ events: rows }) => setEvents(rows))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lista eventi ({events.length})
      </Typography>

      {events.length === 0 ? (
        <Typography color="text.secondary">Nessun evento trovato.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Email proprietario</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nome evento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sposi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data matrimonio</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Creato il</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Azione
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    bgcolor:
                      impersonatedUserId === row.ownerUserId
                        ? "action.selected"
                        : undefined,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {row.ownerEmail || <em>—</em>}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.title || <em>—</em>}</TableCell>
                  <TableCell>{row.spouses || <em>—</em>}</TableCell>
                  <TableCell>
                    {row.weddingDate ? (
                      new Date(row.weddingDate).toLocaleDateString("it-IT")
                    ) : (
                      <Chip label="Non impostata" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleDateString("it-IT")}
                  </TableCell>
                  <TableCell align="right">
                    {impersonatedUserId === row.ownerUserId ? (
                      <Chip
                        label="In gestione"
                        color="primary"
                        size="small"
                        variant="filled"
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ManageAccountsIcon />}
                        onClick={() =>
                          startImpersonation(row.ownerUserId, row.ownerEmail)
                        }
                      >
                        Gestisci
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
