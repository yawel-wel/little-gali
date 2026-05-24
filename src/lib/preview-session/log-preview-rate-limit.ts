import * as Sentry from "@sentry/nextjs";

export function logPreviewFullGenerationRateLimited(
  source: "api" | "upload_client",
  sessionId?: string,
): void {
  if (sessionId) {
    Sentry.setUser({ id: sessionId });
    Sentry.setTag("sessionId", sessionId);
  }
  Sentry.logger.warn("preview.full_generation.rate_limited", { source });
  Sentry.metrics.count("preview_full_generation_rate_limited", 1, {
    attributes: { source },
  });
}
