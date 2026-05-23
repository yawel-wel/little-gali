import type { CloudinaryUploadResult } from "./cloudinary";
import type { PreviewCandidate } from "./types";

export function withCacheBustedUrl(url: string, version: number): string {
  const parsed = new URL(url);
  parsed.searchParams.set("v", String(version));
  return parsed.toString();
}

export function applyCropUploadToCandidate(
  candidate: PreviewCandidate,
  upload: CloudinaryUploadResult,
  cacheVersion: number,
): void {
  const secureUrl = withCacheBustedUrl(upload.secureUrl, cacheVersion);
  candidate.previewUrl = secureUrl;
  candidate.previewPublicId = upload.publicId;
  if (candidate.cleanUrl) {
    candidate.cleanUrl = secureUrl;
  }
  if (candidate.cleanPublicId) {
    candidate.cleanPublicId = upload.publicId;
  }
}
