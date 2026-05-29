export const UPLOAD_PREVIEW_BLOCKED_KEY = "upload_preview_blocked";

export type UploadPreviewBlockedCode =
  | "preview_rate_limit"
  | "generation_rate_limit";

export function readUploadPreviewBlocked(): UploadPreviewBlockedCode | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = sessionStorage.getItem(UPLOAD_PREVIEW_BLOCKED_KEY);
    if (stored === "preview_rate_limit" || stored === "generation_rate_limit") {
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

export function persistUploadPreviewBlocked(
  code: UploadPreviewBlockedCode | null,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!code) {
      sessionStorage.removeItem(UPLOAD_PREVIEW_BLOCKED_KEY);
      return;
    }
    sessionStorage.setItem(UPLOAD_PREVIEW_BLOCKED_KEY, code);
  } catch {
    // ignore
  }
}

export function clearUploadPreviewBlocked(): void {
  persistUploadPreviewBlocked(null);
}
