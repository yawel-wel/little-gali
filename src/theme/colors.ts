// Centralized color definitions for Little Gali
// --------------------------------------------------
// Update the values here to change colors across:
// - MUI theme (via `muiPalette`)
// - Any custom components that import from this file

// Base brand colors (single source of truth)
export const brandColors = {
  // Main brand / CTA color (matches `.text-primary-orange` etc.)
  primary: "#E5543D",

  // Supporting accent colors (soft, playful palette)
  secondary: "#F4A261", // soft peach
  softBlue: "#74C0FC",
  softYellow: "#FFD43B",
  softGreen: "#69DB7C",

  // Darker blues used in footer/backgrounds
  darkBlue: "#1E3A8A",
  darkerBlue: "#1E293B",

  // Neutrals for text
  text: {
    primary: "#2D3748", // dark gray
    secondary: "#4A5568", // medium gray
    muted: "#718096", // light gray
  },

  // Backgrounds
  background: {
    default: "#FFFFFF",
    softPeachLight: "#FEF3E7",
    softBlueLight: "#E3F2FD",
    softYellowLight: "#FFF9C4",
    softGreenLight: "#F0FDF4",
  },
} as const;

// Optional: MUI-ready palette mapping
// You don't have to touch the structure; just change `brandColors` above.
import type { PaletteOptions } from "@mui/material/styles";

export const muiPalette: PaletteOptions = {
  primary: {
    main: brandColors.primary,
    light: brandColors.background.softPeachLight,
    // Slightly darker than main; tweak if you like
    dark: "#C14331",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: brandColors.secondary,
    contrastText: "#FFFFFF",
  },
  text: {
    primary: brandColors.text.primary,
    secondary: brandColors.text.secondary,
    disabled: brandColors.text.muted,
  },
  background: {
    default: brandColors.background.default,
    paper: "#FFFFFF",
  },
};
