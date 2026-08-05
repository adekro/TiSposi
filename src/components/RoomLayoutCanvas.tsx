import { useRef, useState, forwardRef } from "react";
import { Stage, Layer, Circle, Rect, Text, Group } from "react-konva";
import type { Stage as StageType } from "konva/lib/Stage";
import type {
  TableEntry,
  GuestEntry,
  TablePosition,
  GuestIcon,
  TableAssignment,
  TablePositionFormData,
  GuestIconFormData,
} from "../types";

interface Props {
  tables: TableEntry[];
  guests: GuestEntry[];
  assignments: TableAssignment[];
  tablePositions: TablePosition[];
  guestIcons: GuestIcon[];
  width: number;
  height: number;
  onChange: (
    positions: Record<string, TablePositionFormData>,
    icons: Record<string, GuestIconFormData>,
  ) => void;
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

const RoomLayoutCanvas = forwardRef<StageType, Props>(
  (
    {
      tables,
      tablePositions,
      guestIcons,
      assignments,
      guests,
      width,
      height,
      onChange,
    },
    ref,
  ) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // State locale per tracking posizioni durante drag
    const [localPositions, setLocalPositions] = useState<
      Record<string, TablePositionFormData>
    >({});
    const [localIcons, setLocalIcons] = useState<
      Record<string, GuestIconFormData>
    >({});

    // Merge posizioni salvate + locali
    const getTablePosition = (
      tableId: string,
    ): TablePositionFormData | null => {
      if (localPositions[tableId]) return localPositions[tableId];
      const saved = tablePositions.find((p) => p.table_id === tableId);
      if (!saved) return null;
      return {
        table_id: saved.table_id,
        x: saved.x,
        y: saved.y,
        width: saved.width,
        height: saved.height,
        radius: saved.radius,
        shape: saved.shape,
        rotation: saved.rotation,
      };
    };

    const getGuestIcon = (guestId: string): GuestIconFormData | null => {
      if (localIcons[guestId]) return localIcons[guestId];
      const saved = guestIcons.find((i) => i.guest_id === guestId);
      if (!saved) return null;
      return {
        guest_id: saved.guest_id,
        x: saved.x,
        y: saved.y,
        icon_type: saved.icon_type,
        icon_color: saved.icon_color,
        icon_text: saved.icon_text,
      };
    };

    // Handler drag tavolo
    const handleTableDragEnd = (tableId: string, x: number, y: number) => {
      const existing = getTablePosition(tableId);
      const updated: TablePositionFormData = existing
        ? { ...existing, x, y }
        : {
            table_id: tableId,
            x,
            y,
            width: null,
            height: null,
            radius: 60,
            shape: "circle",
            rotation: 0,
          };
      const newPositions = { ...localPositions, [tableId]: updated };
      setLocalPositions(newPositions);
      onChange(newPositions, localIcons);
    };

    // Handler drag ospite
    const handleGuestDragEnd = (guestId: string, x: number, y: number) => {
      const guest = guests.find((g) => g.id === guestId);
      if (!guest) return;
      const existing = getGuestIcon(guestId);
      const updated: GuestIconFormData = existing
        ? { ...existing, x, y }
        : {
            guest_id: guestId,
            x,
            y,
            icon_type: "avatar",
            icon_color: stringToColor(guest.full_name),
            icon_text: getInitials(guest.full_name),
          };
      const newIcons = { ...localIcons, [guestId]: updated };
      setLocalIcons(newIcons);
      onChange(localPositions, newIcons);
    };

    // Render tavoli posizionati
    const renderTables = () => {
      return tables.map((table) => {
        const pos = getTablePosition(table.id);
        if (!pos) return null;

        const isSelected = selectedId === `table-${table.id}`;
        const radius = pos.radius ?? 60;
        const rectWidth = pos.width ?? 120;
        const rectHeight = pos.height ?? 80;

        // Calcola occupazione
        const seatsOccupied = assignments
          .filter((a) => a.table_id === table.id)
          .reduce((sum, a) => sum + a.num_seats, 0);
        const capacityLabel = table.capacity
          ? `${seatsOccupied}/${table.capacity}`
          : `${seatsOccupied}`;

        return (
          <Group
            key={table.id}
            x={pos.x}
            y={pos.y}
            draggable
            onDragEnd={(e) =>
              handleTableDragEnd(table.id, e.target.x(), e.target.y())
            }
            onClick={() => setSelectedId(`table-${table.id}`)}
            onTap={() => setSelectedId(`table-${table.id}`)}
          >
            {pos.shape === "circle" ? (
              <Circle
                radius={radius}
                fill="#ffffff"
                stroke={isSelected ? "#1976d2" : "#999"}
                strokeWidth={isSelected ? 3 : 2}
                shadowBlur={5}
                shadowColor="rgba(0,0,0,0.3)"
                shadowOffsetY={2}
              />
            ) : (
              <Rect
                width={rectWidth}
                height={rectHeight}
                offsetX={rectWidth / 2}
                offsetY={rectHeight / 2}
                fill="#ffffff"
                stroke={isSelected ? "#1976d2" : "#999"}
                strokeWidth={isSelected ? 3 : 2}
                cornerRadius={8}
                shadowBlur={5}
                shadowColor="rgba(0,0,0,0.3)"
                shadowOffsetY={2}
              />
            )}
            <Text
              text={table.name}
              fontSize={16}
              fontStyle="bold"
              fill="#333"
              align="center"
              verticalAlign="middle"
              width={pos.shape === "circle" ? radius * 2 : rectWidth}
              height={pos.shape === "circle" ? radius * 2 : rectHeight}
              offsetX={pos.shape === "circle" ? radius : rectWidth / 2}
              offsetY={pos.shape === "circle" ? radius : rectHeight / 2}
            />
            <Text
              text={capacityLabel}
              fontSize={12}
              fill="#666"
              align="center"
              y={pos.shape === "circle" ? 10 : 10}
              width={pos.shape === "circle" ? radius * 2 : rectWidth}
              offsetX={pos.shape === "circle" ? radius : rectWidth / 2}
            />
          </Group>
        );
      });
    };

    // Render ospiti posizionati
    const renderGuests = () => {
      // Solo ospiti assegnati ad almeno un tavolo
      const assignedGuestIds = new Set(assignments.map((a) => a.guest_id));
      return Array.from(assignedGuestIds).map((guestId) => {
        const icon = getGuestIcon(guestId);
        if (!icon) return null;

        const guest = guests.find((g) => g.id === guestId);
        if (!guest) return null;

        const isSelected = selectedId === `guest-${guestId}`;
        const radius = 20;

        return (
          <Group
            key={guestId}
            x={icon.x}
            y={icon.y}
            draggable
            onDragEnd={(e) =>
              handleGuestDragEnd(guestId, e.target.x(), e.target.y())
            }
            onClick={() => setSelectedId(`guest-${guestId}`)}
            onTap={() => setSelectedId(`guest-${guestId}`)}
          >
            <Circle
              radius={radius}
              fill={icon.icon_color}
              stroke={isSelected ? "#fff" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
              shadowBlur={4}
              shadowColor="rgba(0,0,0,0.3)"
              shadowOffsetY={1}
            />
            <Text
              text={icon.icon_text}
              fontSize={12}
              fontStyle="bold"
              fill="#fff"
              align="center"
              verticalAlign="middle"
              width={radius * 2}
              height={radius * 2}
              offsetX={radius}
              offsetY={radius}
            />
          </Group>
        );
      });
    };

    return (
      <Stage
        ref={ref}
        width={width}
        height={height}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#f9f9f9",
        }}
        onClick={(e) => {
          // Deseleziona se click su sfondo
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        <Layer>
          {renderTables()}
          {renderGuests()}
        </Layer>
      </Stage>
    );
  },
);

RoomLayoutCanvas.displayName = "RoomLayoutCanvas";

export default RoomLayoutCanvas;

export function useCanvasExport(stageRef: React.RefObject<StageType>) {
  const exportToPNG = (filename: string) => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataURL;
    link.click();
  };

  return { exportToPNG };
}
