/** Shopify line item property values are limited to 255 characters. */
export const SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH = 255;

function r2PublicBaseUrl(): string | null {
  return process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "") || null;
}

function r2PublicHost(): string | null {
  const base = r2PublicBaseUrl();
  if (!base) return null;
  try {
    return new URL(base).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function cloudinaryCloudName(): string | null {
  return (
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    null
  );
}

export function isR2PublicHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  const configured = r2PublicHost();
  if (configured && normalized === configured) return true;
  return (
    normalized.endsWith(".r2.dev") ||
    normalized === "images.littlegali.com"
  );
}

export function publicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const uploadMarker = "/upload/";
    const markerIndex = parsed.pathname.indexOf(uploadMarker);
    if (markerIndex === -1) {
      return null;
    }
    let rest = parsed.pathname.slice(markerIndex + uploadMarker.length);
    rest = rest.replace(/^v\d+\//, "");
    const segments = rest.split("/");
    while (segments.length > 1 && segments[0]?.includes(",")) {
      segments.shift();
    }
    const publicId = decodeURIComponent(segments.join("/"));
    return publicId || null;
  } catch {
    return null;
  }
}

export function publicIdFromStorageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (isR2PublicHost(parsed.hostname)) {
      const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
      return key || null;
    }
    if (parsed.hostname === "res.cloudinary.com") {
      return publicIdFromCloudinaryUrl(url);
    }
    return null;
  } catch {
    return null;
  }
}

export function buildR2DeliveryUrl(publicId: string): string {
  const base = r2PublicBaseUrl();
  if (!base) {
    throw new Error("R2 public base URL is not configured");
  }
  const id = publicId.replace(/^\/+/, "");
  return `${base}/${id}`;
}

export function buildCloudinaryDeliveryUrl(publicId: string): string {
  const cloudName = cloudinaryCloudName();
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

export function buildStorageDeliveryUrl(publicId: string): string {
  if (r2PublicBaseUrl()) {
    return buildR2DeliveryUrl(publicId);
  }
  return buildCloudinaryDeliveryUrl(publicId);
}

export function isAllowedCloudinaryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const cloudName = cloudinaryCloudName();
    if (!cloudName) return false;
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

export function isAllowedR2Url(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && isR2PublicHost(parsed.hostname);
  } catch {
    return false;
  }
}

/** Dual-read allowlist: Cloudinary (legacy orders) and R2 (new uploads). */
export function isAllowedStorageUrl(url: string): boolean {
  return isAllowedR2Url(url) || isAllowedCloudinaryUrl(url);
}

export function assertShopifyUrlLength(url: string): string {
  if (url.length > SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH) {
    throw new Error(
      `Image URL exceeds Shopify 255-character line property limit (${url.length}): ${url}`,
    );
  }
  return url;
}

export function longestExpectedFulfillmentUrl(sessionId: string): string {
  const samplePublicId = `little-gali/fulfillment/${sessionId}/color_image_9`;
  return buildStorageDeliveryUrl(samplePublicId);
}
