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
import type { useSuppliers, SupplierFormData } from "../hooks/useSuppliers";
import type { ContractStatus, PaymentStatus } from "../types";

type SuppliersHook = ReturnType<typeof useSuppliers>;

interface Props {
  hook: SuppliersHook;
}

const EMPTY_FORM: SupplierFormData = {
  name: "",
  category: "",
  contact_name: null,
  contact_email: null,
  contact_phone: null,
  contract_status: "da_firmare",
  payment_status: "non_pagato",
  notes: null,
};

const contractLabel: Record<ContractStatus, string> = {
  da_firmare: "Da firmare",
  firmato: "Firmato",
  non_necessario: "Non necessario",
};
const contractColor: Record<ContractStatus, "warning" | "success" | "default"> = {
  da_firmare: "warning",
  firmato: "success",
  non_necessario: "default",
};

const paymentLabel: Record<PaymentStatus, string> = {
  non_pagato: "Non pagato",
  acconto: "Acconto versato",
  saldo_pagato: "Saldo pagato",
};
const paymentColor: Record<PaymentStatus, "error" | "warning" | "success"> = {
  non_pagato: "error",
  acconto: "warning",
  saldo_pagato: "success",
};

export default function SuppliersTab({ hook }: Props) {
  const { suppliers, loading, error, addSupplier, updateSupplier, deleteSupplier } = hook;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const s = suppliers.find((x) => x.id === id);
    if (!s) return;
    setEditId(id);
    setForm({
      name: s.name,
      category: s.category,
      contact_name: s.contact_name,
      contact_email: s.contact_email,
      contact_phone: s.contact_phone,
      contract_status: s.contract_status,
      payment_status: s.payment_status,
      notes: s.notes,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Il nome è obbligatorio."); return; }
    if (!form.category.trim()) { setFormError("La categoria è obbligatoria."); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload: SupplierFormData = {
        ...form,
        name: form.name.trim(),
        category: form.category.trim(),
        contact_name: form.contact_name?.trim() || null,
        contact_email: form.contact_email?.trim() || null,
        contact_phone: form.contact_phone?.trim() || null,
        notes: form.notes?.trim() || null,
      };
      if (editId) {
        await updateSupplier(editId, payload);
      } else {
        await addSupplier(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteSupplier(id); } catch { /* ignore */ }
  };

  const handleContractChange = async (id: string, contract_status: ContractStatus) => {
    try { await updateSupplier(id, { contract_status }); } catch { /* ignore */ }
  };

  const handlePaymentChange = async (id: string, payment_status: PaymentStatus) => {
    try { await updateSupplier(id, { payment_status }); } catch { /* ignore */ }
  };

  // Group by category
  const groups: Record<string, typeof suppliers> = {};
  for (const s of suppliers) {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
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

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Aggiungi fornitore
        </Button>
      </Box>

      {suppliers.length === 0 && !error && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nessun fornitore ancora. Inizia ad aggiungerne uno!
        </Typography>
      )}

      {/* Tables by category */}
      {Object.entries(groups).map(([category, catSuppliers]) => (
        <Box key={category}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1 }} color="text.secondary">
            {category}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Referente / Contatti</TableCell>
                  <TableCell>Contratto</TableCell>
                  <TableCell>Pagamento</TableCell>
                  <TableCell align="right">Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catSuppliers.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Stack>
                        <Typography variant="body2">{s.name}</Typography>
                        {s.notes && (
                          <Typography variant="caption" color="text.secondary">{s.notes}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        {s.contact_name && <Typography variant="body2">{s.contact_name}</Typography>}
                        {s.contact_email && <Typography variant="caption">{s.contact_email}</Typography>}
                        {s.contact_phone && <Typography variant="caption">{s.contact_phone}</Typography>}
                        {!s.contact_name && !s.contact_email && !s.contact_phone && "—"}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={s.contract_status}
                        onChange={(e) => void handleContractChange(s.id, e.target.value as ContractStatus)}
                        sx={{ minWidth: 140 }}
                        variant="standard"
                      >
                        {(Object.keys(contractLabel) as ContractStatus[]).map((k) => (
                          <MenuItem key={k} value={k}>
                            <Chip label={contractLabel[k]} color={contractColor[k]} size="small" />
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={s.payment_status}
                        onChange={(e) => void handlePaymentChange(s.id, e.target.value as PaymentStatus)}
                        sx={{ minWidth: 150 }}
                        variant="standard"
                      >
                        {(Object.keys(paymentLabel) as PaymentStatus[]).map((k) => (
                          <MenuItem key={k} value={k}>
                            <Chip label={paymentLabel[k]} color={paymentColor[k]} size="small" />
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifica">
                        <IconButton size="small" onClick={() => openEdit(s.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Elimina">
                        <IconButton size="small" onClick={() => void handleDelete(s.id)} sx={{ color: "error.main" }}>
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
      ))}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Modifica fornitore" : "Aggiungi fornitore"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nome *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Categoria *"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                fullWidth
                size="small"
                placeholder="es. Fotografo, Catering…"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Referente"
                value={form.contact_name ?? ""}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value || null })}
                fullWidth
                size="small"
              />
              <TextField
                label="Email"
                value={form.contact_email ?? ""}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value || null })}
                fullWidth
                size="small"
                type="email"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Telefono"
                value={form.contact_phone ?? ""}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value || null })}
                fullWidth
                size="small"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Stato contratto</InputLabel>
                <Select
                  label="Stato contratto"
                  value={form.contract_status}
                  onChange={(e) => setForm({ ...form, contract_status: e.target.value as ContractStatus })}
                >
                  {(Object.keys(contractLabel) as ContractStatus[]).map((k) => (
                    <MenuItem key={k} value={k}>{contractLabel[k]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Stato pagamento</InputLabel>
                <Select
                  label="Stato pagamento"
                  value={form.payment_status}
                  onChange={(e) => setForm({ ...form, payment_status: e.target.value as PaymentStatus })}
                >
                  {(Object.keys(paymentLabel) as PaymentStatus[]).map((k) => (
                    <MenuItem key={k} value={k}>{paymentLabel[k]}</MenuItem>
                  ))}
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
