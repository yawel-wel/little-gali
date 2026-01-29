import { createTheme } from "@mui/material/styles";
import { muiPalette } from "./colors";

// Global MUI theme for Little Gali.
// This pulls its colors from `brandColors` via `muiPalette`,
// so you only need to change colors in `colors.ts`.
export const muiTheme = createTheme({
  direction: "rtl",
  palette: muiPalette,
});

