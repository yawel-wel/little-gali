import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./src/lib/preview-session/assets/**/*.ttf"],
  },
  // Client bundles: recent deps that ship untranspiled ESM (Sentry, Motion, MUI, Swiper, dnd-kit, etc.)
  transpilePackages: [
    "@dnd-kit/core",
    "@dnd-kit/modifiers",
    "@dnd-kit/sortable",
    "@dnd-kit/utilities",
    "@mui/material",
    "@radix-ui/react-accordion",
    "@radix-ui/react-dialog",
    "@radix-ui/react-slot",
    "@sentry/nextjs",
    "@vercel/analytics",
    "@vercel/speed-insights",
    "framer-motion",
    "react-easy-crop",
    "swiper",
  ],
  // Requested for older Next versions; Next.js 16 already uses .browserslistrc by default (key is ignored).
  experimental: {
    browsersListForSwc: true,
  } as NextConfig["experimental"],
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    qualities: [75, 85, 90],
  },
};

export default nextConfig;
