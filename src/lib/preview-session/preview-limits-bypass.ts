/**
 * Local dev only: set SKIP_PREVIEW_LIMITS=true in .env.local to skip:
 * - per-IP full preview quota
 * - per-session generation quota
 * - change credits (regenerate / replace)
 *
 * SKIP_PREVIEW_RATE_LIMIT is accepted as a legacy alias.
 */
function isTruthyEnv(value: string | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function isPreviewLimitsBypassed(): boolean {
  return (
    isTruthyEnv(process.env.SKIP_PREVIEW_LIMITS) ||
    isTruthyEnv(process.env.SKIP_PREVIEW_RATE_LIMIT)
  );
}

export function isPreviewLimitsDevResetAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return isTruthyEnv(process.env.PREVIEW_LIMITS_DEV_RESET);
}
