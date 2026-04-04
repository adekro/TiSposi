import { createTheme } from '@mui/material/styles'

// ─────────────────────────────────────────────────────────────────
//  WEDDING THEME — modifica qui per cambiare l'aspetto dell'app
// ─────────────────────────────────────────────────────────────────

export const COUPLE_NAMES = import.meta.env.VITE_WEDDING_COUPLE ?? 'Martina & Natan'
export const WEDDING_DATE = import.meta.env.VITE_WEDDING_DATE ?? '10 Ottobre 2026'

// Palette colori — cambia qui per aggiornare tutto il tema
const COLORS = {
  gold: '#C9A76C',        // oro — colore primario
  goldDark: '#A8813E',    // oro scuro (hover / active)
  rose: '#C9A0B0',        // rosa antico — colore secondario
  roseDark: '#A87888',    // rosa scuro
  bgWarm: '#FAF7F2',      // bianco caldo — sfondo
  bgCard: '#FFFFFF',      // bianco per le card
  text: '#3D2B1F',        // marrone scuro — testo principale
  textLight: '#7A6055',   // marrone chiaro — testo secondario
}

// Font Google — già importati in index.html
const FONT_TITLE = '"Playfair Display", Georgia, serif'
const FONT_BODY = '"Lato", "Helvetica Neue", Arial, sans-serif'

const weddingTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.gold,
      dark: COLORS.goldDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: COLORS.rose,
      dark: COLORS.roseDark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: COLORS.bgWarm,
      paper: COLORS.bgCard,
    },
    text: {
      primary: COLORS.text,
      secondary: COLORS.textLight,
    },
  },
  typography: {
    fontFamily: FONT_BODY,
    h1: { fontFamily: FONT_TITLE, fontWeight: 700 },
    h2: { fontFamily: FONT_TITLE, fontWeight: 700 },
    h3: { fontFamily: FONT_TITLE, fontWeight: 600 },
    h4: { fontFamily: FONT_TITLE, fontWeight: 600 },
    h5: { fontFamily: FONT_TITLE, fontWeight: 500 },
    h6: { fontFamily: FONT_TITLE, fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: FONT_BODY,
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(201,167,108,0.4)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(61,43,31,0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
})

export default weddingTheme
