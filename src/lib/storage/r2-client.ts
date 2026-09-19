import { S3Client } from "@aws-sdk/client-s3";
import { requireR2Config, type R2Config } from "./r2-config";

let cached: { endpoint: string; client: S3Client } | null = null;

export function getR2Client(config: R2Config = requireR2Config()): S3Client {
  if (cached && cached.endpoint === config.endpoint) {
    return cached.client;
  }
  const client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  cached = { endpoint: config.endpoint, client };
  return client;
}
