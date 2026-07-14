import type { PreviewSession, PreviewSessionPublicView } from "./types";

export interface PreviewGenerationStats {
  totalGenerations: number;
  selectedGenerationBySlot: number[];
}

type SessionWithSlots = PreviewSession | PreviewSessionPublicView;

export function buildPreviewGenerationStats(
  session: SessionWithSlots,
): PreviewGenerationStats {
  const selectedGenerationBySlot = session.slots.map((slot) => {
    const index = slot.candidates.findIndex(
      (candidate) => candidate.id === slot.activeCandidateId,
    );
    return index >= 0 ? index + 1 : 0;
  });
  const totalGenerations = session.slots.reduce(
    (sum, slot) => sum + slot.candidates.length,
    0,
  );

  return { totalGenerations, selectedGenerationBySlot };
}

export function formatSelectedGenerationBySlot(
  selectedGenerationBySlot: number[],
): string {
  return selectedGenerationBySlot.join(",");
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
      key: "_preview_gen_total",
      value: String(stats.totalGenerations),
    });
    attributes.push({
      key: "_preview_gen_selected",
      value: formatSelectedGenerationBySlot(stats.selectedGenerationBySlot),
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
): style is "cartoon" | "pencil" | "watercolor" | "colorful" {
  return (
    style === "cartoon" ||
    style === "pencil" ||
    style === "watercolor" ||
    style === "colorful"
  );
}

export function hasInvalidHttpImageUrls(urls: string[]): boolean {
  return urls.some(
    (url) => !url.startsWith("http://") && !url.startsWith("https://"),
  );
}
