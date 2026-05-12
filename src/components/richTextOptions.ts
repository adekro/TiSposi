export const RICH_TEXT_GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;700&family=Great+Vibes:wght@400&family=Lora:wght@400;600;700&family=Montserrat:wght@400;500;600;700&display=swap";

export const RICH_TEXT_FONT_OPTIONS = [
  {
    label: "Playfair Display",
    value: "'Playfair Display', serif",
    commandValue: "Playfair Display",
  },
  {
    label: "Cormorant Garamond",
    value: "'Cormorant Garamond', serif",
    commandValue: "Cormorant Garamond",
  },
  {
    label: "Great Vibes",
    value: "'Great Vibes', cursive",
    commandValue: "Great Vibes",
  },
  {
    label: "Lora",
    value: "'Lora', serif",
    commandValue: "Lora",
  },
  {
    label: "Montserrat",
    value: "'Montserrat', sans-serif",
    commandValue: "Montserrat",
  },
] as const;

export const RICH_TEXT_COLOR_OPTIONS = [
  { label: "Bordeaux", value: "#3E1F1F" },
  { label: "Oro", value: "#D4AF37" },
  { label: "Blu notte", value: "#1B3A66" },
  { label: "Malva", value: "#4A3C52" },
  { label: "Marrone caldo", value: "#5C4033" },
  { label: "Grigio scuro", value: "#2C3E50" },
] as const;