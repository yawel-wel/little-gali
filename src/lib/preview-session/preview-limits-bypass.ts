/**
 * Local dev only: set SKIP_PREVIEW_LIMITS=true in .env.local to skip:
 * - per-IP full preview quota
 * - per-session generation quota
 * - change credits (regenerate / replace)
 *
 * SKIP_PREVIEW_RATE_LIMIT is accepted as a legacy alias.
 *
 * Full-generation quota is also skipped automatically on localhost / NODE_ENV=development
 * (see isFullGenerationLimitBypassed).
 */
function isTruthyEnv(value: string | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function isLocalPreviewHost(): boolean {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").toLowerCase();
  return (
    base.includes("localhost") ||
    base.includes("127.0.0.1") ||
    base.includes("[::1]")
  );
}

/** True when running the Next app locally (dev server or localhost base URL). */
export function isLocalPreviewEnvironment(): boolean {
  return process.env.NODE_ENV === "development" || isLocalPreviewHost();
}

export function isPreviewLimitsBypassed(): boolean {
  return (
    isTruthyEnv(process.env.SKIP_PREVIEW_LIMITS) ||
    isTruthyEnv(process.env.SKIP_PREVIEW_RATE_LIMIT)
  );
}

/**
 * Skip the per-IP full-generation quota (upload / new booklet).
 * Env skip still applies; localhost also bypasses so local testing is not blocked.
 */
export function isFullGenerationLimitBypassed(): boolean {
  return isPreviewLimitsBypassed() || isLocalPreviewEnvironment();
}

export function isPreviewLimitsDevResetAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return isTruthyEnv(process.env.PREVIEW_LIMITS_DEV_RESET);
}
