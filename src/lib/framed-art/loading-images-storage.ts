export const FRAMED_ART_LOADING_IMAGES_STORAGE_PREFIX =
  "little-gali-framed-art-loading-images";

export function readFramedArtLoadingImageUrls(sessionId: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(
      `${FRAMED_ART_LOADING_IMAGES_STORAGE_PREFIX}:${sessionId}`,
    );
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((url): url is string => typeof url === "string" && !!url)
      : [];
  } catch {
    return [];
  }
}

export function saveFramedArtLoadingImageUrls(
  sessionId: string,
  urls: string[],
): void {
  if (typeof window === "undefined" || urls.length === 0) {
    return;
  }
  sessionStorage.setItem(
    `${FRAMED_ART_LOADING_IMAGES_STORAGE_PREFIX}:${sessionId}`,
    JSON.stringify(urls.slice(0, 1)),
  );
}

export function clearFramedArtLoadingImageUrls(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(
    `${FRAMED_ART_LOADING_IMAGES_STORAGE_PREFIX}:${sessionId}`,
  );
}
