'use client';

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { muiTheme } from "./mui-theme";

type Props = {
  children: ReactNode;
};

// Client-side MUI theme provider, used once in `layout.tsx`.
export function MuiThemeProvider({ children }: Props) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

