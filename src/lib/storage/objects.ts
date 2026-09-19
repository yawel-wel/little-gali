import {
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { formatUnknownError } from "@/lib/preview-session/generation-errors";
import { getR2Client } from "./r2-client";
import { isR2Configured, requireR2Config } from "./r2-config";
import {
  buildR2DeliveryUrl,
  isAllowedR2Url,
  isR2PublicHost,
  publicIdFromStorageUrl,
} from "./urls";

export type StorageUploadResult = {
  secureUrl: string;
  publicId: string;
};

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function encodeCopySource(bucket: string, key: string): string {
  return `${bucket}/${key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export async function bodyFromBlob(file: Blob | File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

export function contentTypeFromFile(
  file: Blob | File,
  fallback = "image/jpeg",
): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const name = file instanceof File ? file.name.toLowerCase() : "";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".json")) return "application/json";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return fallback;
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array | Blob | File,
  contentType: string,
): Promise<StorageUploadResult> {
  const config = requireR2Config();
  const client = getR2Client(config);
  const bytes =
    body instanceof Blob ? await bodyFromBlob(body) : Buffer.from(body);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
  );
  return { secureUrl: buildR2DeliveryUrl(key), publicId: key };
}

export async function copyObjectSameBucket(
  sourceKey: string,
  destKey: string,
): Promise<StorageUploadResult> {
  const config = requireR2Config();
  const client = getR2Client(config);
  await client.send(
    new CopyObjectCommand({
      Bucket: config.bucket,
      Key: destKey,
      CopySource: encodeCopySource(config.bucket, sourceKey),
      MetadataDirective: "COPY",
    }),
  );
  return { secureUrl: buildR2DeliveryUrl(destKey), publicId: destKey };
}

export async function getObjectBuffer(key: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const config = requireR2Config();
  const client = getR2Client(config);
  const result = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
  if (!result.Body) {
    throw new Error(`R2 object has no body: ${key}`);
  }
  const buffer = Buffer.from(await result.Body.transformToByteArray());
  return {
    buffer,
    contentType: result.ContentType?.split(";")[0].trim() || "image/jpeg",
  };
}

/** Prefer S3 GetObject for our R2 URLs so local Node does not hang on r2.dev. */
export async function fetchStorageBuffer(sourceUrl: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  let hostname = "";
  try {
    hostname = new URL(sourceUrl).hostname;
  } catch {
    throw new Error("Invalid storage URL");
  }

  if (isR2PublicHost(hostname)) {
    if (!isR2Configured()) {
      throw new Error("R2 is not configured; cannot read R2 object");
    }
    const sourceKey = publicIdFromStorageUrl(sourceUrl);
    if (!sourceKey) {
      throw new Error("Could not parse R2 object key from URL");
    }
    return getObjectBuffer(sourceKey);
  }

  let response: Response;
  try {
    response = await fetch(sourceUrl);
  } catch (error) {
    throw new Error(
      `Failed to fetch storage source: ${formatUnknownError(error)}`,
      { cause: error },
    );
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch storage source: ${response.status}`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType:
      response.headers.get("content-type")?.split(";")[0].trim() || "image/jpeg",
  };
}

export async function copyUrlToKey(
  sourceUrl: string,
  destKey: string,
): Promise<StorageUploadResult> {
  const sourceKey = publicIdFromStorageUrl(sourceUrl);
  if (sourceKey === destKey) {
    return { secureUrl: buildR2DeliveryUrl(destKey), publicId: destKey };
  }
  if (sourceKey && isAllowedR2Url(sourceUrl)) {
    try {
      return await copyObjectSameBucket(sourceKey, destKey);
    } catch {
      // Fall through to read + put if CopyObject is unavailable.
    }
  }

  const { buffer, contentType } = await fetchStorageBuffer(sourceUrl);
  return putObject(destKey, buffer, contentType);
}

export type ListedStorageObject = {
  key: string;
  size: number;
  lastModified: string | null;
  url: string;
};

export async function listObjectsByPrefix(
  prefix: string,
): Promise<ListedStorageObject[]> {
  const config = requireR2Config();
  const client = getR2Client(config);
  const objects: ListedStorageObject[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const item of page.Contents ?? []) {
      if (!item.Key) continue;
      objects.push({
        key: item.Key,
        size: item.Size ?? 0,
        lastModified: item.LastModified?.toISOString() ?? null,
        url: buildR2DeliveryUrl(item.Key),
      });
    }
    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);
  return objects;
}
