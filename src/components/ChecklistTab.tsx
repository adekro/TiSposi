import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { useChecklist } from "../hooks/useChecklist";

type ChecklistHook = ReturnType<typeof useChecklist>;

interface Props {
  hook: ChecklistHook;
}

export default function ChecklistTab({ hook }: Props) {
  const { items, loading, error, toggleComplete, addItem, deleteItem } = hook;
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by due_label preserving order
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const key = item.due_label ?? "Aggiunto manualmente";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  const handleAdd = async () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setSaving(true);
    await addItem(trimmed);
    setNewTask("");
    setAdding(false);
    setSaving(false);
  };

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

      {/* Progress summary */}
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Completamento checklist
          </Typography>
          <Chip
            label={`${completed} / ${total} completati (${percent}%)`}
            color={percent === 100 ? "success" : "default"}
            size="small"
            variant="outlined"
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{ borderRadius: 4, height: 8 }}
          color={percent === 100 ? "success" : "primary"}
        />
      </Stack>

      {/* Task groups */}
      {Object.entries(groups).map(([label, groupItems]) => (
        <Box key={label}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            {label}
          </Typography>
          <Divider sx={{ mb: 0.5 }} />
          <List dense disablePadding>
            {groupItems.map((item) => (
              <ListItem
                key={item.id}
                disableGutters
                secondaryAction={
                  <Tooltip title="Elimina">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => void deleteItem(item.id)}
                      sx={{ color: "text.disabled" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    size="small"
                    checked={item.completed}
                    onChange={(e) => void toggleComplete(item.id, e.target.checked)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.task}
                  primaryTypographyProps={{
                    sx: {
                      textDecoration: item.completed ? "line-through" : "none",
                      color: item.completed ? "text.disabled" : "text.primary",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}

      {/* Add task */}
      {adding ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            label="Nuovo task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleAdd(); }}
            fullWidth
            autoFocus
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => void handleAdd()}
            disabled={saving || !newTask.trim()}
          >
            Aggiungi
          </Button>
          <Button size="small" onClick={() => { setAdding(false); setNewTask(""); }}>
            Annulla
          </Button>
        </Stack>
      ) : (
        <Box>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setAdding(true)}
          >
            Aggiungi task
          </Button>
        </Box>
      )}
    </Stack>
  );
}
