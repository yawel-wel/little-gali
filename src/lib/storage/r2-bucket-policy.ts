export const R2_BUCKET_NAME = "little-gali-images";

export const R2_CORS_ORIGINS = [
  "https://www.littlegali.com",
  "https://littlegali.com",
  "https://little-gali-processing.vercel.app",
  "http://localhost:3000",
  "http://localhost:3003",
];

export const R2_LIFECYCLE_RULES = [
  {
    id: "expire-uploads",
    prefix: "little-gali/uploads/",
    days: 14,
  },
  {
    id: "expire-sessions",
    prefix: "little-gali/sessions/",
    days: 14,
  },
  {
    id: "expire-framed-art",
    prefix: "little-gali/framed-art/",
    days: 14,
  },
  {
    id: "expire-fulfillment",
    prefix: "little-gali/fulfillment/",
    days: 365,
  },
] as const;
