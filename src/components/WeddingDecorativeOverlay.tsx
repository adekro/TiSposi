import { Box } from "@mui/material";

interface Props {
  color?: string;
  /** 0–1, default 0.30 */
  intensity?: number;
  /** Size in px of each corner ornament, default 220 */
  size?: number;
}

/**
 * Botanical floral corner ornaments rendered as inline SVG.
 * Position: absolute; call from a position:relative container.
 */
function CornerPath({ color, intensity }: { color: string; intensity: number }) {
  const op = (base: number) => Math.min(1, base * intensity);

  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Rosa centrale nell'angolo ── */}
      {/* Petali esterni */}
      <ellipse cx="22" cy="8"  rx="8"  ry="14" transform="rotate(0  22  8)"  fill={color} opacity={op(0.32)}/>
      <ellipse cx="33" cy="12" rx="10" ry="6"  transform="rotate(35 33 12)"  fill={color} opacity={op(0.32)}/>
      <ellipse cx="36" cy="24" rx="10" ry="6"  transform="rotate(65 36 24)"  fill={color} opacity={op(0.32)}/>
      <ellipse cx="28" cy="36" rx="8"  ry="13" transform="rotate(90 28 36)"  fill={color} opacity={op(0.32)}/>
      <ellipse cx="13" cy="36" rx="8"  ry="13" transform="rotate(90 13 36)"  fill={color} opacity={op(0.32)}/>
      <ellipse cx="7"  cy="24" rx="10" ry="6"  transform="rotate(115 7  24)" fill={color} opacity={op(0.32)}/>
      <ellipse cx="10" cy="12" rx="10" ry="6"  transform="rotate(145 10 12)" fill={color} opacity={op(0.32)}/>
      {/* Petali interni */}
      <ellipse cx="22" cy="14" rx="6"  ry="9"  fill={color} opacity={op(0.58)}/>
      <ellipse cx="30" cy="18" rx="7"  ry="5"  transform="rotate(40  30 18)" fill={color} opacity={op(0.58)}/>
      <ellipse cx="30" cy="28" rx="6"  ry="4"  transform="rotate(75  30 28)" fill={color} opacity={op(0.58)}/>
      <ellipse cx="22" cy="32" rx="6"  ry="9"  fill={color} opacity={op(0.58)}/>
      <ellipse cx="13" cy="28" rx="6"  ry="4"  transform="rotate(105 13 28)" fill={color} opacity={op(0.58)}/>
      <ellipse cx="13" cy="18" rx="7"  ry="5"  transform="rotate(140 13 18)" fill={color} opacity={op(0.58)}/>
      {/* Centro */}
      <circle cx="22" cy="22" r="7"   fill={color} opacity={op(0.78)}/>
      <circle cx="22" cy="22" r="3.5" fill={color} opacity={op(1.0)}/>

      {/* ── Ramo orizzontale lungo il bordo superiore ── */}
      <path
        d="M 44 22 C 68 14 94 18 120 15 C 146 12 172 17 198 14 C 206 13 213 14 218 14"
        stroke={color} strokeWidth="1.8" fill="none" opacity={op(0.58)}
      />
      {/* piccola curva aggiuntiva all'attaccatura */}
      <path d="M 44 22 C 52 29 58 25 68 22" stroke={color} strokeWidth="1" fill="none" opacity={op(0.35)}/>

      {/* ── Ramo verticale lungo il bordo sinistro ── */}
      <path
        d="M 22 44 C 14 68 18 94 15 120 C 12 146 17 172 14 198 C 13 206 14 213 14 218"
        stroke={color} strokeWidth="1.8" fill="none" opacity={op(0.58)}
      />

      {/* ── Foglie sul ramo orizzontale ── */}
      {/* Foglia sopra – x≈78 */}
      <path d="M 78 15 C 73 3 68 -1 65 3 C 62 8 70 15 78 15 Z" fill={color} opacity={op(0.48)}/>
      {/* Foglia sotto – x≈78 */}
      <path d="M 78 15 C 83 27 88 31 91 27 C 94 22 86 15 78 15 Z" fill={color} opacity={op(0.36)}/>
      <line x1="78" y1="15" x2="78" y2="20" stroke={color} strokeWidth="1" opacity={op(0.4)}/>

      {/* Foglia sopra – x≈125 */}
      <path d="M 124 14 C 119 2 114 -2 111 2 C 108 7 116 14 124 14 Z" fill={color} opacity={op(0.44)}/>
      {/* Foglia sotto – x≈125 */}
      <path d="M 124 14 C 129 26 134 30 137 26 C 140 21 132 14 124 14 Z" fill={color} opacity={op(0.33)}/>

      {/* Foglia sopra – x≈170 */}
      <path d="M 170 14 C 165 2 160 -2 157 2 C 154 7 162 14 170 14 Z" fill={color} opacity={op(0.38)}/>

      {/* ── Fiorellino a x≈97 ── */}
      <circle cx="97" cy="14" r="4.5" fill={color} opacity={op(0.54)}/>
      <ellipse cx="97" cy="8"  rx="2.5" ry="4" fill={color} opacity={op(0.38)}/>
      <ellipse cx="97" cy="20" rx="2.5" ry="4" fill={color} opacity={op(0.38)}/>
      <ellipse cx="91" cy="14" rx="4"   ry="2.5" fill={color} opacity={op(0.38)}/>
      <ellipse cx="103" cy="14" rx="4"  ry="2.5" fill={color} opacity={op(0.38)}/>

      {/* ── Fiorellino a x≈150 ── */}
      <circle cx="150" cy="14" r="4" fill={color} opacity={op(0.48)}/>
      <ellipse cx="150" cy="9"  rx="2"   ry="3.5" fill={color} opacity={op(0.33)}/>
      <ellipse cx="150" cy="19" rx="2"   ry="3.5" fill={color} opacity={op(0.33)}/>
      <ellipse cx="145" cy="14" rx="3.5" ry="2"   fill={color} opacity={op(0.33)}/>
      <ellipse cx="155" cy="14" rx="3.5" ry="2"   fill={color} opacity={op(0.33)}/>

      {/* Bocciolo finale orizzontale */}
      <ellipse cx="205" cy="13" rx="4" ry="6" fill={color} opacity={op(0.38)}/>
      <ellipse cx="205" cy="10" rx="2" ry="3" fill={color} opacity={op(0.28)}/>

      {/* ── Foglie sul ramo verticale ── */}
      {/* Foglia sinistra – y≈78 */}
      <path d="M 15 78 C 3 73 -1 68 3 65 C 8 62 15 70 15 78 Z" fill={color} opacity={op(0.48)}/>
      {/* Foglia destra – y≈78 */}
      <path d="M 15 78 C 27 83 31 88 27 91 C 22 94 15 86 15 78 Z" fill={color} opacity={op(0.36)}/>
      <line x1="15" y1="78" x2="20" y2="78" stroke={color} strokeWidth="1" opacity={op(0.4)}/>

      {/* Foglia sinistra – y≈125 */}
      <path d="M 14 124 C 2 119 -2 114 2 111 C 7 108 14 116 14 124 Z" fill={color} opacity={op(0.44)}/>
      {/* Foglia destra – y≈125 */}
      <path d="M 14 124 C 26 129 30 134 26 137 C 21 140 14 132 14 124 Z" fill={color} opacity={op(0.33)}/>

      {/* Foglia sinistra – y≈170 */}
      <path d="M 14 170 C 2 165 -2 160 2 157 C 7 154 14 162 14 170 Z" fill={color} opacity={op(0.38)}/>

      {/* ── Fiorellino a y≈97 ── */}
      <circle cx="14" cy="97" r="4.5" fill={color} opacity={op(0.54)}/>
      <ellipse cx="8"  cy="97" rx="4"   ry="2.5" fill={color} opacity={op(0.38)}/>
      <ellipse cx="20" cy="97" rx="4"   ry="2.5" fill={color} opacity={op(0.38)}/>
      <ellipse cx="14" cy="91" rx="2.5" ry="4"   fill={color} opacity={op(0.38)}/>
      <ellipse cx="14" cy="103" rx="2.5" ry="4"  fill={color} opacity={op(0.38)}/>

      {/* ── Fiorellino a y≈150 ── */}
      <circle cx="14" cy="150" r="4" fill={color} opacity={op(0.48)}/>
      <ellipse cx="9"  cy="150" rx="3.5" ry="2"   fill={color} opacity={op(0.33)}/>
      <ellipse cx="19" cy="150" rx="3.5" ry="2"   fill={color} opacity={op(0.33)}/>
      <ellipse cx="14" cy="145" rx="2"   ry="3.5" fill={color} opacity={op(0.33)}/>
      <ellipse cx="14" cy="155" rx="2"   ry="3.5" fill={color} opacity={op(0.33)}/>

      {/* Bocciolo finale verticale */}
      <ellipse cx="13" cy="205" rx="6" ry="4" fill={color} opacity={op(0.38)}/>
      <ellipse cx="10" cy="205" rx="3" ry="2" fill={color} opacity={op(0.28)}/>
    </svg>
  );
}

export default function WeddingDecorativeOverlay({
  color = "#C9A76C",
  intensity = 0.30,
}: Props) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2,
      }}
      aria-hidden="true"
    >
      {/* Angolo in alto a sinistra */}
      <Box sx={{ position: "absolute", top: 0, left: 0 }}>
        <CornerPath color={color} intensity={intensity} />
      </Box>
      {/* Angolo in alto a destra – specchiato orizzontalmente */}
      <Box sx={{ position: "absolute", top: 0, right: 0, transform: "scaleX(-1)" }}>
        <CornerPath color={color} intensity={intensity} />
      </Box>
      {/* Angolo in basso a sinistra – specchiato verticalmente */}
      <Box sx={{ position: "absolute", bottom: 0, left: 0, transform: "scaleY(-1)" }}>
        <CornerPath color={color} intensity={intensity} />
      </Box>
      {/* Angolo in basso a destra – ruotato 180° */}
      <Box sx={{ position: "absolute", bottom: 0, right: 0, transform: "scale(-1, -1)" }}>
        <CornerPath color={color} intensity={intensity} />
      </Box>
    </Box>
  );
}
