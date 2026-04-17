import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { GalleryItem } from "../types";
import { useDashboardGallery } from "../hooks/useDashboardGallery";

interface DeleteDialogProps {
  item: GalleryItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteDialog({ item, onConfirm, onCancel, loading }: DeleteDialogProps) {
  return (
    <Dialog open={!!item} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Elimina {item?.type === "photo" ? "foto" : "dedica"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {item?.type === "photo"
            ? "Vuoi eliminare questa foto? L'operazione non è reversibile."
            : `Vuoi eliminare la dedica "${item?.text?.slice(0, 60)}…"? L'operazione non è reversibile.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
        >
          Elimina
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface MediaItemCardProps {
  item: GalleryItem;
  onDelete: (item: GalleryItem) => void;
  isDeleting: boolean;
}

function PhotoCard({ item, onDelete, isDeleting }: MediaItemCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        opacity: isDeleting ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <CardMedia
        component="img"
        image={item.url}
        alt="Foto galleria"
        sx={{ height: 160, objectFit: "cover", bgcolor: "grey.100" }}
      />
      <CardActions sx={{ justifyContent: "flex-end", px: 1, py: 0.5 }}>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon fontSize="small" />}
          onClick={() => onDelete(item)}
          disabled={isDeleting}
        >
          Elimina
        </Button>
      </CardActions>
    </Card>
  );
}

function DedicaCard({ item, onDelete, isDeleting }: MediaItemCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        opacity: isDeleting ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
          }}
        >
          "{item.text}"
        </Typography>
        <Typography variant="caption" color="text.disabled" mt={1} display="block">
          {new Date(item.timestamp).toLocaleDateString("it-IT")}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 1, py: 0.5 }}>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon fontSize="small" />}
          onClick={() => onDelete(item)}
          disabled={isDeleting}
        >
          Elimina
        </Button>
      </CardActions>
    </Card>
  );
}

interface Props {
  userId: string;
}

export default function MediaTab({ userId }: Props) {
  const { items, loading, error, deleting, deleteEntry } =
    useDashboardGallery(userId);
  const [subTab, setSubTab] = useState(0);
  const [confirmItem, setConfirmItem] = useState<GalleryItem | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const photos = items.filter((i) => i.type === "photo");
  const dediche = items.filter((i) => i.type === "dedica");

  const handleDeleteRequest = (item: GalleryItem) => {
    setDeleteError("");
    setConfirmItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!confirmItem) return;
    try {
      await deleteEntry(confirmItem.id);
      setConfirmItem(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Errore durante l'eliminazione",
      );
      setConfirmItem(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const visibleItems = subTab === 0 ? photos : dediche;
  const emptyLabel =
    subTab === 0
      ? "Nessuna foto caricata ancora."
      : "Nessuna dedica ricevuta ancora.";

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={600}>
        Gestione media
      </Typography>

      {deleteError && <Alert severity="error">{deleteError}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={subTab} onChange={(_, v: number) => setSubTab(v)}>
          <Tab label={photos.length > 0 ? `Foto (${photos.length})` : "Foto"} />
          <Tab
            label={dediche.length > 0 ? `Dediche (${dediche.length})` : "Dediche"}
          />
        </Tabs>
      </Box>

      {visibleItems.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          {emptyLabel}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              subTab === 0
                ? "repeat(auto-fill, minmax(180px, 1fr))"
                : "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          {visibleItems.map((item) =>
            item.type === "photo" ? (
              <PhotoCard
                key={item.id}
                item={item}
                onDelete={handleDeleteRequest}
                isDeleting={deleting === item.id}
              />
            ) : (
              <DedicaCard
                key={item.id}
                item={item}
                onDelete={handleDeleteRequest}
                isDeleting={deleting === item.id}
              />
            ),
          )}
        </Box>
      )}

      <DeleteDialog
        item={confirmItem}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmItem(null)}
        loading={deleting !== null}
      />
    </Stack>
  );
}
