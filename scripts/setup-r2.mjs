#!/usr/bin/env node
/**
 * Applies CORS and lifecycle rules to the R2 bucket.
 *
 * Prerequisites (Cloudflare dashboard):
 *   1. Create Standard bucket `little-gali-images`
 *   2. Create an R2 API token with Object Read & Write
 *   3. Attach custom domain images.littlegali.com
 *
 * Usage (from little-gali, with .env.local populated):
 *   node scripts/setup-r2.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { PutBucketCorsCommand, PutBucketLifecycleConfigurationCommand, S3Client } from "@aws-sdk/client-s3";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const accountId = process.env.R2_ACCOUNT_ID?.trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
const bucket = process.env.R2_BUCKET?.trim();

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error(
    "Missing R2 env. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.",
  );
  process.exit(1);
}

const corsOrigins = [
  "https://www.littlegali.com",
  "https://littlegali.com",
  "https://little-gali-processing.vercel.app",
  "http://localhost:3000",
  "http://localhost:3003",
];

const lifecycleRules = [
  { id: "expire-uploads", prefix: "little-gali/uploads/", days: 14 },
  { id: "expire-sessions", prefix: "little-gali/sessions/", days: 14 },
  { id: "expire-framed-art", prefix: "little-gali/framed-art/", days: 14 },
  { id: "expire-fulfillment", prefix: "little-gali/fulfillment/", days: 365 },
];

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "HEAD"],
          AllowedOrigins: corsOrigins,
          ExposeHeaders: ["ETag", "Content-Type", "Content-Length"],
          MaxAgeSeconds: 86400,
        },
      ],
    },
  }),
);
console.log("CORS applied for", corsOrigins.join(", "));

await client.send(
  new PutBucketLifecycleConfigurationCommand({
    Bucket: bucket,
    LifecycleConfiguration: {
      Rules: [
        ...lifecycleRules.map((rule) => ({
          ID: rule.id,
          Filter: { Prefix: rule.prefix },
          Status: "Enabled",
          Expiration: { Days: rule.days },
        })),
        {
          ID: "abort-incomplete-multipart",
          Filter: { Prefix: "" },
          Status: "Enabled",
          AbortIncompleteMultipartUpload: { DaysAfterInitiation: 7 },
        },
      ],
    },
  }),
);
console.log(
  "Lifecycle applied:",
  lifecycleRules.map((rule) => `${rule.prefix} ${rule.days}d`).join("; "),
);
console.log("R2 bucket policy setup complete.");
