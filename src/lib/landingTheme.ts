import type { LandingThemePreset } from "../types";

export interface LandingThemeView {
  pageBackground: string;
  pagePattern: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  accent: string;
  accentAlt: string;
  heroFallback: string;
  titleFont: string;
  bodyFont: string;
}

export const LANDING_THEME_PRESETS: Record<LandingThemePreset, LandingThemeView> = {
  gold: {
    pageBackground: "#FAF7F2",
    pagePattern:
      "repeating-linear-gradient(90deg, rgba(201,167,108,0.045) 0 1px, transparent 1px 32px)",
    cardBackground: "#FFFFFF",
    textColor: "#3D2B1F",
    mutedTextColor: "#7A6055",
    accent: "#C9A76C",
    accentAlt: "#C9A0B0",
    heroFallback: "linear-gradient(135deg, #F2E2C4 0%, #EBCFD8 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  green: {
    pageBackground: "#F6F9F6",
    pagePattern: "repeating-linear-gradient(90deg, rgba(83,119,91,0.045) 0 1px, transparent 1px 32px)",
    cardBackground: "#FFFFFF",
    textColor: "#26352A",
    mutedTextColor: "#607064",
    accent: "#53775B",
    accentAlt: "#799A80",
    heroFallback: "linear-gradient(135deg, #E4EEE5 0%, #F7F9F5 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  blue: {
    pageBackground: "#F5F8FB",
    pagePattern: "repeating-linear-gradient(90deg, rgba(61,101,139,0.045) 0 1px, transparent 1px 32px)",
    cardBackground: "#FFFFFF",
    textColor: "#243443",
    mutedTextColor: "#5C6F80",
    accent: "#3D658B",
    accentAlt: "#6F91B0",
    heroFallback: "linear-gradient(135deg, #E4EDF5 0%, #F6F9FC 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  rose_gold: {
    pageBackground: "#FCF7F6",
    pagePattern: "repeating-linear-gradient(90deg, rgba(181,124,112,0.045) 0 1px, transparent 1px 32px)",
    cardBackground: "#FFFFFF",
    textColor: "#493331",
    mutedTextColor: "#7D625E",
    accent: "#B57C70",
    accentAlt: "#D0A097",
    heroFallback: "linear-gradient(135deg, #F2DFDB 0%, #FCF7F6 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  black: {
    pageBackground: "#F8F8F7",
    pagePattern: "repeating-linear-gradient(90deg, rgba(25,25,25,0.045) 0 1px, transparent 1px 32px)",
    cardBackground: "#FFFFFF",
    textColor: "#1B1B1A",
    mutedTextColor: "#5E5E5A",
    accent: "#1B1B1A",
    accentAlt: "#555552",
    heroFallback: "linear-gradient(135deg, #E6E6E3 0%, #FAFAF9 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  rose: {
    pageBackground: "#FEF7F9",
    pagePattern:
      "radial-gradient(circle at 18% 22%, rgba(185,121,141,0.16) 0 2px, transparent 2px 100%), radial-gradient(circle at 74% 72%, rgba(215,168,104,0.14) 0 2px, transparent 2px 100%), repeating-linear-gradient(120deg, rgba(185,121,141,0.05) 0 1px, transparent 1px 24px)",
    cardBackground: "#FFFFFF",
    textColor: "#4F2F39",
    mutedTextColor: "#7C5A66",
    accent: "#B9798D",
    accentAlt: "#D7A868",
    heroFallback: "linear-gradient(135deg, #F8D9E3 0%, #F6E2C8 100%)",
    titleFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
  },
  classic: {
    pageBackground: "#F7F3EA",
    pagePattern:
      "radial-gradient(circle at 20% 18%, rgba(182,141,76,0.16) 0 2px, transparent 2px 100%), radial-gradient(circle at 78% 78%, rgba(46,76,125,0.12) 0 2px, transparent 2px 100%), repeating-linear-gradient(90deg, rgba(30,43,67,0.045) 0 1px, transparent 1px 28px)",
    cardBackground: "#FFFDF8",
    textColor: "#1E2B43",
    mutedTextColor: "#4E5C75",
    accent: "#2E4C7D",
    accentAlt: "#B68D4C",
    heroFallback: "linear-gradient(135deg, #DCE4F2 0%, #F0E7D8 100%)",
    titleFont: '"Abril Fatface", "Times New Roman", serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  wallpaper_ivory: {
    pageBackground: "#F6F3EE",
    pagePattern:
      "radial-gradient(circle at 25% 28%, rgba(155,144,128,0.12) 0 2px, transparent 2px 100%), radial-gradient(circle at 76% 72%, rgba(155,144,128,0.1) 0 2px, transparent 2px 100%), repeating-radial-gradient(circle at 0 0, rgba(175,162,143,0.06) 0 1px, transparent 1px 18px), repeating-linear-gradient(45deg, rgba(175,162,143,0.05) 0 1px, transparent 1px 32px)",
    cardBackground: "#FFFDF9",
    textColor: "#3A332B",
    mutedTextColor: "#6D6256",
    accent: "#A58A64",
    accentAlt: "#B89F7B",
    heroFallback: "linear-gradient(135deg, #F0ECE5 0%, #E6DED2 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Lato", "Helvetica Neue", Arial, sans-serif',
  },
  eucalyptus_mint: {
    pageBackground: "#F4F8F4",
    pagePattern:
      "radial-gradient(ellipse at 12% 15%, rgba(110,145,120,0.18) 0 12%, transparent 13% 100%), radial-gradient(ellipse at 88% 12%, rgba(145,175,150,0.18) 0 10%, transparent 11% 100%), radial-gradient(ellipse at 8% 88%, rgba(110,145,120,0.16) 0 11%, transparent 12% 100%), radial-gradient(ellipse at 90% 84%, rgba(145,175,150,0.16) 0 12%, transparent 13% 100%), repeating-linear-gradient(0deg, rgba(110,145,120,0.05) 0 1px, transparent 1px 30px)",
    cardBackground: "#FBFEFB",
    textColor: "#2E4135",
    mutedTextColor: "#5D7567",
    accent: "#6E9178",
    accentAlt: "#99B79F",
    heroFallback: "linear-gradient(135deg, #E3EFE6 0%, #D9E6DC 100%)",
    titleFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
  },
  blush_watercolor: {
    pageBackground: "#FEF7F8",
    pagePattern:
      "radial-gradient(circle at 16% 26%, rgba(246,189,196,0.35) 0 12%, transparent 13% 100%), radial-gradient(circle at 82% 22%, rgba(248,208,213,0.3) 0 10%, transparent 11% 100%), radial-gradient(circle at 22% 82%, rgba(250,214,219,0.28) 0 11%, transparent 12% 100%), radial-gradient(circle at 78% 76%, rgba(246,189,196,0.26) 0 12%, transparent 13% 100%), repeating-radial-gradient(circle at 0 0, rgba(210,171,94,0.1) 0 1px, transparent 1px 24px)",
    cardBackground: "#FFFCFD",
    textColor: "#55353D",
    mutedTextColor: "#84616A",
    accent: "#D18896",
    accentAlt: "#D9B067",
    heroFallback: "linear-gradient(135deg, #FCE7EA 0%, #F8D9E1 100%)",
    titleFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
  },
  floral_frame: {
    pageBackground: "#F8F5EF",
    pagePattern:
      "radial-gradient(ellipse at 0% 0%, rgba(111,150,122,0.26) 0 15%, transparent 16% 100%), radial-gradient(ellipse at 100% 0%, rgba(111,150,122,0.26) 0 15%, transparent 16% 100%), radial-gradient(ellipse at 0% 100%, rgba(111,150,122,0.24) 0 15%, transparent 16% 100%), radial-gradient(ellipse at 100% 100%, rgba(111,150,122,0.24) 0 15%, transparent 16% 100%), linear-gradient(to bottom, rgba(111,150,122,0.18), rgba(111,150,122,0.18)), linear-gradient(to top, rgba(111,150,122,0.18), rgba(111,150,122,0.18)), linear-gradient(to right, rgba(111,150,122,0.18), rgba(111,150,122,0.18)), linear-gradient(to left, rgba(111,150,122,0.18), rgba(111,150,122,0.18)), radial-gradient(circle at 18% 22%, rgba(212,170,121,0.18) 0 2px, transparent 2px 100%), radial-gradient(circle at 82% 78%, rgba(212,170,121,0.14) 0 2px, transparent 2px 100%)",
    cardBackground: "#FFFDF9",
    textColor: "#2D3D33",
    mutedTextColor: "#5A6F63",
    accent: "#6F967A",
    accentAlt: "#D4AA79",
    heroFallback: "linear-gradient(135deg, #E4EFE6 0%, #F1E6D9 100%)",
    titleFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
  },
};

export function resolveLandingTheme(theme: LandingThemePreset | null | undefined) {
  if (!theme) return LANDING_THEME_PRESETS.gold;
  return LANDING_THEME_PRESETS[theme] ?? LANDING_THEME_PRESETS.gold;
}
