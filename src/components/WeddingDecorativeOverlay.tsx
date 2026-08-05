import { Box } from "@mui/material";

interface OverlayProps {
  /** 0–1, default 0.30 */
  intensity?: number;
  /** Size in px of each corner detail, default 120 */
  size?: number;
}

interface DividerProps {
  /** 0–1, default 1.0 */
  intensity?: number;
}

const accentColor = "var(--accent-color, #C9A76C)";

function OutlineHeart({ opacity = 1 }: { opacity?: number }) {
  return (
    <path
      d="M 0 5.8 C 0 2.8 3.7 1.1 6 3.6 C 8.3 1.1 12 2.8 12 5.8 C 12 8.7 8.4 10.8 6 13 C 3.6 10.8 0 8.7 0 5.8 Z"
      fill="none"
      stroke={accentColor}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    />
  );
}

/** Separatore minimale a linee sottili con cuore outline centrale. */
export function WeddingDecorativeDivider({ intensity = 1 }: DividerProps) {
  const opacity = Math.min(1, intensity);

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 0.75 }} aria-hidden="true">
      <svg width="100%" height="28" viewBox="0 0 400 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="14" x2="178" y2="14" stroke={accentColor} strokeWidth="0.8" opacity={0.42 * opacity} />
        <line x1="222" y1="14" x2="400" y2="14" stroke={accentColor} strokeWidth="0.8" opacity={0.42 * opacity} />
        <line x1="184" y1="14" x2="190" y2="14" stroke={accentColor} strokeWidth="0.8" opacity={0.7 * opacity} />
        <line x1="210" y1="14" x2="216" y2="14" stroke={accentColor} strokeWidth="0.8" opacity={0.7 * opacity} />
        <g transform="translate(194 7)"><OutlineHeart opacity={opacity} /></g>
      </svg>
    </Box>
  );
}

function CornerLines({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 86 V 24 H 74" stroke={accentColor} strokeWidth="0.8" strokeLinecap="round" opacity={opacity} />
      <path d="M 20 78 V 32 H 66" stroke={accentColor} strokeWidth="0.8" strokeLinecap="round" opacity={opacity * 0.55} />
      <g transform="translate(7 7) scale(0.9)"><OutlineHeart opacity={opacity} /></g>
    </svg>
  );
}

/** Linee minimali negli angoli dell'hero, senza elementi floreali o riempimenti. */
export default function WeddingDecorativeOverlay({ intensity = 0.3, size = 120 }: OverlayProps) {
  const opacity = Math.min(1, intensity);
  const baseStyle = { position: "absolute", width: size, height: size, pointerEvents: "none", zIndex: 1 } as const;

  return (
    <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <Box sx={{ ...baseStyle, top: 8, left: 8 }}><CornerLines size={size} opacity={opacity} /></Box>
      <Box sx={{ ...baseStyle, top: 8, right: 8, transform: "scaleX(-1)" }}><CornerLines size={size} opacity={opacity} /></Box>
      <Box sx={{ ...baseStyle, bottom: 8, left: 8, transform: "scaleY(-1)" }}><CornerLines size={size} opacity={opacity} /></Box>
      <Box sx={{ ...baseStyle, right: 8, bottom: 8, transform: "scale(-1)" }}><CornerLines size={size} opacity={opacity} /></Box>
    </Box>
  );
}
