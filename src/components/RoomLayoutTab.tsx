import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import type { Stage as StageType } from "konva/lib/Stage";
import RoomLayoutCanvas from "./RoomLayoutCanvas";
import { useRoomLayout } from "../hooks/useRoomLayout";
import type { useTables } from "../hooks/useTables";
import type { useGuestList } from "../hooks/useGuestList";
import type { TablePositionFormData, GuestIconFormData } from "../types";

type TablesHook = ReturnType<typeof useTables>;
type GuestListHook = ReturnType<typeof useGuestList>;

interface Props {
  userId: string;
  tablesHook: TablesHook;
  guestListHook: GuestListHook;
  spouses?: string;
}

// Funzione per generare colore pseudo-casuale da stringa
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

// Funzione per ottenere iniziali dal nome
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function RoomLayoutTab({
  userId,
  tablesHook,
  guestListHook,
  spouses = "layout-sala",
}: Props) {
  const { tables, assignments } = tablesHook;
  const { guests } = guestListHook;
  const { layout, tablePositions, guestIcons, loading, error, saveLayout } =
    useRoomLayout(userId);

  const stageRef = useRef<StageType>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // State locale per posizioni modificate
  const [localTablePositions, setLocalTablePositions] = useState<
    Record<string, TablePositionFormData>
  >({});
  const [localGuestIcons, setLocalGuestIcons] = useState<
    Record<string, GuestIconFormData>
  >({});

  const canvasWidth = layout?.canvas_width ?? 1200;
  const canvasHeight = layout?.canvas_height ?? 800;

  // Tavoli senza posizione
  const unpositionedTables = tables.filter(
    (t) =>
      !tablePositions.some((p) => p.table_id === t.id) &&
      !localTablePositions[t.id],
  );

  // Ospiti assegnati senza icona
  const assignedGuestIds = new Set(assignments.map((a) => a.guest_id));
  const unpositionedGuests = guests.filter(
    (g) =>
      assignedGuestIds.has(g.id) &&
      !guestIcons.some((i) => i.guest_id === g.id) &&
      !localGuestIcons[g.id],
  );

  const handleChange = (
    positions: Record<string, TablePositionFormData>,
    icons: Record<string, GuestIconFormData>,
  ) => {
    setLocalTablePositions(positions);
    setLocalGuestIcons(icons);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await saveLayout({
        layout: {
          canvas_width: canvasWidth,
          canvas_height: canvasHeight,
          background_image_url: null,
        },
        tablePositions: localTablePositions,
        guestIcons: localGuestIcons,
      });
      // Reset local state dopo salvataggio
      setLocalTablePositions({});
      setLocalGuestIcons({});
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Errore nel salvataggio.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePositionTable = (tableId: string) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const newPos: TablePositionFormData = {
      table_id: tableId,
      x: centerX,
      y: centerY,
      width: null,
      height: null,
      radius: 60,
      shape: "circle",
      rotation: 0,
    };
    const updated = { ...localTablePositions, [tableId]: newPos };
    setLocalTablePositions(updated);
    handleChange(updated, localGuestIcons);
  };

  const handlePositionGuest = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const newIcon: GuestIconFormData = {
      guest_id: guestId,
      x: centerX,
      y: centerY,
      icon_type: "avatar",
      icon_color: stringToColor(guest.full_name),
      icon_text: getInitials(guest.full_name),
    };
    const updated = { ...localGuestIcons, [guestId]: newIcon };
    setLocalGuestIcons(updated);
    handleChange(localTablePositions, updated);
  };

  const handleRemoveTablePosition = (tableId: string) => {
    const updated = { ...localTablePositions };
    delete updated[tableId];
    setLocalTablePositions(updated);
    handleChange(updated, localGuestIcons);
  };

  const handleRemoveGuestIcon = (guestId: string) => {
    const updated = { ...localGuestIcons };
    delete updated[guestId];
    setLocalGuestIcons(updated);
    handleChange(localTablePositions, updated);
  };

  const handleExportPNG = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `${spouses}-${new Date().toISOString().split("T")[0]}.png`;
    link.href = dataURL;
    link.click();
  };

  const handleExportPDF = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    // eslint-disable-next-line new-cap
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgAspectRatio = canvasWidth / canvasHeight;
    const pdfAspectRatio = pdfWidth / pdfHeight;
    let imgWidth = pdfWidth;
    let imgHeight = pdfHeight;
    if (imgAspectRatio > pdfAspectRatio) {
      imgHeight = pdfWidth / imgAspectRatio;
    } else {
      imgWidth = pdfHeight * imgAspectRatio;
    }
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    pdf.addImage(dataURL, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`${spouses}-${new Date().toISOString().split("T")[0]}.pdf`);
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
      {saveError && <Alert severity="error">{saveError}</Alert>}

      {/* Toolbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => void handleSave()}
            disabled={saving}
            size="small"
          >
            {saving ? "Salvataggio..." : "Salva layout"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPNG}
            size="small"
          >
            Esporta PNG
          </Button>
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={handleExportPDF}
            size="small"
          >
            Esporta PDF
          </Button>
        </Stack>
      </Stack>

      {/* Main content: sidebar + canvas */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {/* Sidebar sinistra: elementi da posizionare */}
        {(unpositionedTables.length > 0 || unpositionedGuests.length > 0) && (
          <Paper
            sx={{
              minWidth: 200,
              maxWidth: 280,
              p: 2,
              flexShrink: 0,
            }}
            elevation={2}
          >
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Da posizionare
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {unpositionedTables.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  Tavoli
                </Typography>
                <List dense disablePadding sx={{ mb: 2 }}>
                  {unpositionedTables.map((t) => (
                    <ListItem
                      key={t.id}
                      disableGutters
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handlePositionTable(t.id)}
                        >
                          Posiziona
                        </Button>
                      }
                      sx={{ pr: 12 }}
                    >
                      <ListItemText
                        primary={t.name}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {unpositionedGuests.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  Ospiti
                </Typography>
                <List dense disablePadding>
                  {unpositionedGuests.map((g) => (
                    <ListItem
                      key={g.id}
                      disableGutters
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handlePositionGuest(g.id)}
                        >
                          Posiziona
                        </Button>
                      }
                      sx={{ pr: 12 }}
                    >
                      <ListItemText
                        primary={g.full_name}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        )}

        {/* Canvas centrale */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <RoomLayoutCanvas
            ref={stageRef}
            tables={tables}
            guests={guests}
            assignments={assignments}
            tablePositions={tablePositions}
            guestIcons={guestIcons}
            width={canvasWidth}
            height={canvasHeight}
            onChange={handleChange}
          />
        </Box>

        {/* Sidebar destra: elementi posizionati */}
        {(Object.keys(localTablePositions).length > 0 ||
          Object.keys(localGuestIcons).length > 0) && (
          <Paper
            sx={{
              minWidth: 200,
              maxWidth: 280,
              p: 2,
              flexShrink: 0,
            }}
            elevation={2}
          >
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Posizionati
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {Object.keys(localTablePositions).length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  Tavoli
                </Typography>
                <List dense disablePadding sx={{ mb: 2 }}>
                  {Object.keys(localTablePositions).map((tableId) => {
                    const table = tables.find((t) => t.id === tableId);
                    if (!table) return null;
                    return (
                      <ListItem
                        key={tableId}
                        disableGutters
                        secondaryAction={
                          <Tooltip title="Rimuovi dal canvas">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveTablePosition(tableId)}
                              sx={{ color: "error.main" }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        }
                        sx={{ pr: 4 }}
                      >
                        <ListItemText
                          primary={table.name}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}

            {Object.keys(localGuestIcons).length > 0 && (
              <>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  Ospiti
                </Typography>
                <List dense disablePadding>
                  {Object.keys(localGuestIcons).map((guestId) => {
                    const guest = guests.find((g) => g.id === guestId);
                    if (!guest) return null;
                    const icon = localGuestIcons[guestId];
                    return (
                      <ListItem
                        key={guestId}
                        disableGutters
                        secondaryAction={
                          <Tooltip title="Rimuovi dal canvas">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveGuestIcon(guestId)}
                              sx={{ color: "error.main" }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        }
                        sx={{ pr: 4 }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  bgcolor: icon.icon_color,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography variant="body2">
                                {guest.full_name}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}
          </Paper>
        )}
      </Box>

      {tables.length === 0 && (
        <Alert severity="info">
          Nessun tavolo creato. Vai alla scheda &quot;Tavoli&quot; per creare il
          primo tavolo e poi torna qui per posizionarlo sul canvas!
        </Alert>
      )}
    </Stack>
  );
}
