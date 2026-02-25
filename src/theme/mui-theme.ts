import { createTheme } from "@mui/material/styles";
import { muiPalette, brandColors } from "./colors";

// Global MUI theme for Little Gali.
// This pulls its colors from `brandColors` via `muiPalette`,
// so you only need to change colors in `colors.ts`.
export const muiTheme = createTheme({
  direction: "rtl",
  palette: muiPalette,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
            opacity: 0.85,
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: brandColors.primary,
          },
        },
      },
    },
  },
});
