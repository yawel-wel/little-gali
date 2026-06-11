import MuiButton, { type ButtonProps } from "@mui/material/Button";
import { brandColors } from "@/theme/colors";

const HOME_CTA_HOVER = "#5a2b28";

export const homeCtaButtonSx = {
  px: 5,
  py: 1.5,
  fontFamily: "var(--font-assistant)",
  fontWeight: 700,
  fontSize: "1rem",
  textTransform: "none",
  bgcolor: brandColors.accent,
  color: "#ffffff",
  borderRadius: "8px",
  boxShadow: "none",
  "&:hover": {
    bgcolor: HOME_CTA_HOVER,
  },
  "&.Mui-disabled": {
    bgcolor: `${brandColors.accent}99`,
    color: "#ffffff",
  },
} as const;

export function HomeCtaButton({ sx, ...props }: ButtonProps) {
  return (
    <MuiButton variant="contained" sx={{ ...homeCtaButtonSx, ...sx }} {...props} />
  );
}
