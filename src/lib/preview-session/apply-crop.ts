import type { CloudinaryUploadResult } from "./cloudinary";
import type { PreviewCandidate } from "./types";

export function withCacheBustedUrl(url: string, version: number): string {
  const parsed = new URL(url);
  parsed.searchParams.set("v", String(version));
  return parsed.toString();
}

export function applyCropUploadToCandidate(
  candidate: PreviewCandidate,
  cleanUpload: CloudinaryUploadResult,
  previewUpload: CloudinaryUploadResult,
  cacheVersion: number,
): void {
  candidate.cleanUrl = withCacheBustedUrl(cleanUpload.secureUrl, cacheVersion);
  candidate.cleanPublicId = cleanUpload.publicId;
  candidate.previewUrl = withCacheBustedUrl(previewUpload.secureUrl, cacheVersion);
  candidate.previewPublicId = previewUpload.publicId;
}
