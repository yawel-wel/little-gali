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

export function originalUrlsShopifyAttributes(
  originalUrls?: string[],
): Array<{ key: string; value: string }> {
  if (!originalUrls || originalUrls.length !== 5) {
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
  if (!generatedColorUrls || generatedColorUrls.length !== 5) {
    return [];
  }

  return generatedColorUrls.map((url, index) => ({
    key: `_color_image_${index + 1}`,
    value: url,
  }));
}

export function hasInvalidHttpImageUrls(urls: string[]): boolean {
  return urls.some(
    (url) => !url.startsWith("http://") && !url.startsWith("https://"),
  );
}
