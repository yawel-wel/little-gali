import type { PreviewLimitsSnapshot } from "./full-generation-limits";
import { formatPreviewLimitResetTime } from "./preview-contact-url";

type TranslateFn = (key: string) => string;

function applyPlaceholders(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function formatPreviewRateLimitMessage(
  t: TranslateFn,
  limits: Pick<
    PreviewLimitsSnapshot,
    "windowHours" | "fullGenerationLimit"
  >,
): string {
  return applyPlaceholders(t("upload.previewRateLimit"), {
    limit: limits.fullGenerationLimit,
    windowHours: limits.windowHours,
  });
}

export function formatLastFullGenerationWarning(
  t: TranslateFn,
  limits: Pick<PreviewLimitsSnapshot, "windowHours" | "resetAt">,
  locale: string,
): string {
  const resetTime = formatPreviewLimitResetTime(limits.resetAt, locale);
  if (resetTime) {
    return applyPlaceholders(t("upload.previewLastGenerationWarningWithReset"), {
      windowHours: limits.windowHours,
      resetTime,
    });
  }
  return applyPlaceholders(t("upload.previewLastGenerationWarning"), {
    windowHours: limits.windowHours,
  });
}
