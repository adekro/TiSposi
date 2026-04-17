import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PeopleIcon from "@mui/icons-material/People";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "../contexts/AuthContext";
import { useStats } from "../hooks/useStats";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}

function StatCard({ icon, label, value, color = "primary.main" }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        flex: "1 1 140px",
        minWidth: 140,
      }}
    >
      <CardContent>
        <Stack spacing={1} alignItems="center" sx={{ py: 1 }}>
          <Box sx={{ color, fontSize: 32, lineHeight: 1 }}>{icon}</Box>
          <Typography variant="h4" fontWeight={700} lineHeight={1}>
            {value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            {label}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface Props {
  userId: string;
}

export default function StatisticsTab({ userId }: Props) {
  const { session } = useAuth();
  const { stats, loading, error } = useStats(userId);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownloadZip = async () => {
    if (!session?.access_token) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const res = await fetch("/api/gallery-export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Errore durante l'export");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "galleria.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Errore durante il download",
      );
    } finally {
      setDownloading(false);
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

  if (!stats) {
    return (
      <Typography color="text.secondary" textAlign="center" py={4}>
        Configura prima il tuo evento per vedere le statistiche.
      </Typography>
    );
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h6" fontWeight={600}>
        Statistiche evento
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <StatCard
          icon={<VisibilityIcon fontSize="inherit" />}
          label="Visite galleria"
          value={stats.visitCount}
          color="primary.main"
        />
        <StatCard
          icon={<PhotoCameraIcon fontSize="inherit" />}
          label="Foto caricate"
          value={stats.photoCount}
          color="secondary.main"
        />
        <StatCard
          icon={<FavoriteIcon fontSize="inherit" />}
          label="Dediche"
          value={stats.dedicaCount}
          color="#e57373"
        />
        <StatCard
          icon={<PeopleIcon fontSize="inherit" />}
          label="RSVP ricevuti"
          value={stats.rsvpCount}
          color="#66bb6a"
        />
        <StatCard
          icon={<MusicNoteIcon fontSize="inherit" />}
          label="Richieste musicali"
          value={stats.musicCount}
          color="#ffa726"
        />
        <StatCard
          icon={<PersonAddIcon fontSize="inherit" />}
          label="Invitati"
          value={stats.guestCount}
          color="#ab47bc"
        />
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Galleria foto
        </Typography>
        {downloadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {downloadError}
          </Alert>
        )}
        <Tooltip
          title={
            stats.photoCount === 0
              ? "Nessuna foto da scaricare"
              : "Scarica tutte le foto in un archivio ZIP"
          }
        >
          <span>
            <Button
              variant="contained"
              startIcon={
                downloading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={() => void handleDownloadZip()}
              disabled={downloading || stats.photoCount === 0}
            >
              {downloading ? "Preparazione ZIP…" : "Scarica ZIP galleria"}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}
