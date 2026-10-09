import type { PreviewSession, PreviewSessionPublicView } from "./types";
import { SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH } from "@/lib/storage/urls";

export interface PreviewGenerationStats {
  /** Explicit Regenerate clicks during the preview session. */
  regenerations: number;
}

type SessionWithRegenerateCount = Pick<PreviewSession, "regenerateCount"> | PreviewSessionPublicView;

export function buildPreviewGenerationStats(
  session: SessionWithRegenerateCount,
): PreviewGenerationStats {
  return { regenerations: session.regenerateCount ?? 0 };
}

export function mixpanelDistinctIdShopifyAttributes(
  mixpanelDistinctId?: string,
): Array<{ key: string; value: string }> {
  if (!mixpanelDistinctId) {
    return [];
  }

  return [{ key: "_mixpanel_distinct_id", value: mixpanelDistinctId }];
}

export function previewStatsShopifyAttributes(
  previewSessionId?: string,
  stats?: PreviewGenerationStats,
  mixpanelDistinctId?: string,
): Array<{ key: string; value: string }> {
  if (!previewSessionId) {
    return mixpanelDistinctIdShopifyAttributes(mixpanelDistinctId);
  }

  const attributes: Array<{ key: string; value: string }> = [
    { key: "_preview_session_id", value: previewSessionId },
    ...mixpanelDistinctIdShopifyAttributes(mixpanelDistinctId),
  ];

  if (stats) {
    attributes.push({
      key: "_preview_regenerations",
      value: String(stats.regenerations),
    });
  }

  return attributes;
}

export function bookFlowShopifyAttributes(
  bookFlow: "classic" | "colorful",
): Array<{ key: string; value: string }> {
  // `_book_flow` stays hidden for APIs; `type` is the customer-facing checkout label
  // (same pattern as `_style` / `style`).
  return [
    { key: "_book_flow", value: bookFlow },
    { key: "type", value: bookFlow },
  ];
}

export function originalUrlsShopifyAttributes(
  originalUrls?: string[],
): Array<{ key: string; value: string }> {
  if (
    !originalUrls ||
    (originalUrls.length !== 5 && originalUrls.length !== 9)
  ) {
    return [];
  }

  return originalUrls.map((url, index) => ({
    key: `_original_${index + 1}`,
    value: url,
  }));
}

export function generatedColorUrlsShopifyAttributes(
  generatedColorUrls?: string[],
): Array<{ key: string; value: string }> {
  if (
    !generatedColorUrls ||
    (generatedColorUrls.length !== 5 && generatedColorUrls.length !== 9)
  ) {
    return [];
  }

  return generatedColorUrls.map((url, index) => ({
    key: `_color_image_${index + 1}`,
    value: url,
  }));
}

export function primaryImageUrlsShopifyAttributes(
  imageUrls: string[],
): Array<{ key: string; value: string }> {
  return imageUrls.map((url, index) => ({
    key: `_image_${index + 1}`,
    value: url,
  }));
}

export function isValidBookCartImageCount(count: number): boolean {
  return count === 5 || count === 9;
}

export function isValidBookCartStyle(
  style: unknown,
): style is "cartoon" | "pencil" | "watercolor" | "colorful" | "pens" {
  return (
    style === "cartoon" ||
    style === "pencil" ||
    style === "watercolor" ||
    style === "colorful" ||
    style === "pens"
  );
}

export function hasInvalidHttpImageUrls(urls: string[]): boolean {
  return urls.some(
    (url) => !url.startsWith("http://") && !url.startsWith("https://"),
  );
}

/**
 * Which prompt version made each image, for the processing admin. Comma-separated
 * fingerprints in the same order as `_image_N` / `_color_image_N` (empty where unknown),
 * matched by the clean URLs the client sent (before promotion to fulfillment).
 */
export function promptVersionsShopifyAttributes(
  session: Pick<PreviewSession, "slots"> | null,
  imageUrls: string[],
  generatedColorUrls?: string[],
): Array<{ key: string; value: string }> {
  if (!session) return [];

  const versionByUrl = new Map<string, string>();
  for (const slot of session.slots) {
    const candidates = [
      ...slot.candidates,
      ...(slot.colorCandidates ?? []),
      ...(slot.colorPreview ? [slot.colorPreview] : []),
    ];
    for (const candidate of candidates) {
      if (candidate.cleanUrl && candidate.promptVersion) {
        versionByUrl.set(candidate.cleanUrl, candidate.promptVersion);
      }
    }
  }

  const attribute = (key: string, urls?: string[]) => {
    if (!urls) return [];
    const versions = urls.map((url) => versionByUrl.get(url) ?? "");
    const value = versions.join(",");
    if (!versions.some(Boolean) || value.length > SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH) return [];
    return [{ key, value }];
  };

  return [
    ...attribute("_image_prompt_versions", imageUrls),
    ...attribute("_color_image_prompt_versions", generatedColorUrls),
  ];
}
