import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
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
import Link from "@mui/material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { GalleryItem, MusicRequest } from "../types";
import { useDashboardGallery } from "../hooks/useDashboardGallery";

interface DeleteDialogProps {
  open: boolean;
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteDialog({ open, label, onConfirm, onCancel, loading }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Elimina elemento</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {label} L'operazione non è reversibile.
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

interface MusicCardProps {
  item: MusicRequest;
  onApprove: (item: MusicRequest) => void;
  onDelete: (item: MusicRequest) => void;
  isApproving: boolean;
  isDeleting: boolean;
}

function MusicCard({ item, onApprove, onDelete, isApproving, isDeleting }: MusicCardProps) {
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
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <MusicNoteIcon color="primary" sx={{ mt: 0.3, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap title={item.song}>
              {item.song}
            </Typography>
            {item.artist && (
              <Typography variant="caption" color="text.secondary" display="block">
                {item.artist}
              </Typography>
            )}
            {item.requestedBy && (
              <Typography variant="caption" color="text.disabled" display="block">
                da {item.requestedBy}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled" display="block">
              {new Date(item.createdAt).toLocaleDateString("it-IT")}
            </Typography>
          </Box>
          {item.approved && (
            <Chip
              label="In playlist"
              size="small"
              color="success"
              icon={<CheckCircleIcon />}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", gap: 0.5, px: 1.5, py: 0.5 }}>
        <Link
          href={`https://open.spotify.com/search/${encodeURIComponent([item.song, item.artist].filter(Boolean).join(" "))}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#1DB954",
          }}
        >
          Spotify
          <OpenInNewIcon sx={{ fontSize: 13 }} />
        </Link>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {!item.approved && (
            <Button
              size="small"
              color="success"
              startIcon={
                isApproving ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CheckCircleIcon fontSize="small" />
                )
              }
              onClick={() => onApprove(item)}
              disabled={isApproving || isDeleting}
            >
              Aggiungi alla playlist
            </Button>
          )}
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={() => onDelete(item)}
            disabled={isApproving || isDeleting}
          >
            Elimina
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}

interface Props {
  userId: string;
}

export default function MediaTab({ userId }: Props) {
  const {
    items,
    loading,
    error,
    deleting,
    deleteEntry,
    musicItems,
    musicLoading,
    approvingMusic,
    deletingMusic,
    approveMusicEntry,
    deleteMusicEntry,
  } = useDashboardGallery(userId);
  const [subTab, setSubTab] = useState(0);
  const [confirmItem, setConfirmItem] = useState<GalleryItem | null>(null);
  const [confirmMusic, setConfirmMusic] = useState<MusicRequest | null>(null);
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

  const handleApproveMusicRequest = async (item: MusicRequest) => {
    setDeleteError("");
    try {
      await approveMusicEntry(item.id);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Errore durante l'approvazione",
      );
    }
  };

  const handleDeleteMusicRequest = (item: MusicRequest) => {
    setDeleteError("");
    setConfirmMusic(item);
  };

  const handleConfirmDeleteMusic = async () => {
    if (!confirmMusic) return;
    try {
      await deleteMusicEntry(confirmMusic.id);
      setConfirmMusic(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Errore durante l'eliminazione",
      );
      setConfirmMusic(null);
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
          <Tab
            label={musicItems.length > 0 ? `Richieste (${musicItems.length})` : "Richieste"}
          />
        </Tabs>
      </Box>

      {subTab < 2 ? (
        <>
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
        </>
      ) : (
        <>
          {musicLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : musicItems.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Nessuna richiesta musicale ricevuta ancora.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {musicItems.map((item) => (
                <MusicCard
                  key={item.id}
                  item={item}
                  onApprove={() => void handleApproveMusicRequest(item)}
                  onDelete={handleDeleteMusicRequest}
                  isApproving={approvingMusic === item.id}
                  isDeleting={deletingMusic === item.id}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      <DeleteDialog
        open={!!confirmItem}
        label={
          confirmItem?.type === "photo"
            ? "Vuoi eliminare questa foto?"
            : `Vuoi eliminare la dedica "${confirmItem?.text?.slice(0, 60) ?? ""}…"?`
        }
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmItem(null)}
        loading={deleting !== null}
      />

      <DeleteDialog
        open={!!confirmMusic}
        label={`Vuoi eliminare la richiesta musicale "${confirmMusic?.song ?? ""}"?`}
        onConfirm={() => void handleConfirmDeleteMusic()}
        onCancel={() => setConfirmMusic(null)}
        loading={deletingMusic !== null}
      />
    </Stack>
  );
}
