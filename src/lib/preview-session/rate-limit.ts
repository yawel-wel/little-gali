import { getFullGenerationRateLimitConfig } from "@/lib/rate-limit/config";
import { kvExpire, kvGet, kvIncr } from "./kv";
import { previewFullGenerationRateKey } from "./redis";

const fullGenerationRateLimitConfig = getFullGenerationRateLimitConfig();

function isPreviewRateLimitDisabled(): boolean {
  return process.env.SKIP_PREVIEW_RATE_LIMIT === "true";
}

/** Read-only check; does not increment the per-IP counter. */
export async function peekFullGenerationRateLimit(
  ipHash: string,
): Promise<{ allowed: boolean }> {
  const { limit: maxPerWindow } = fullGenerationRateLimitConfig;

  if (isPreviewRateLimitDisabled()) {
    return { allowed: true };
  }

  const key = previewFullGenerationRateKey(ipHash);
  const raw = await kvGet<number | string>(key);
  const count =
    typeof raw === "number"
      ? raw
      : Number.parseInt(String(raw ?? "0"), 10) || 0;

  return { allowed: count < maxPerWindow };
}

export async function checkFullGenerationRateLimit(
  ipHash: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const { limit: maxPerWindow, windowSeconds } = fullGenerationRateLimitConfig;

  if (isPreviewRateLimitDisabled()) {
    return { allowed: true, remaining: maxPerWindow };
  }

  const key = previewFullGenerationRateKey(ipHash);
  const count = await kvIncr(key);
  if (count === 1) {
    await kvExpire(key, windowSeconds);
  }
  if (count > maxPerWindow) {
    return { allowed: false, remaining: 0 };
  }
  return {
    allowed: true,
    remaining: Math.max(0, maxPerWindow - count),
  };
}

/** Counts as one full preview for the IP window (same as checkFullGenerationRateLimit). */
export async function recordFullGenerationUse(ipHash: string): Promise<void> {
  const { windowSeconds } = fullGenerationRateLimitConfig;

  if (isPreviewRateLimitDisabled()) {
    return;
  }

  const key = previewFullGenerationRateKey(ipHash);
  const count = await kvIncr(key);
  if (count === 1) {
    await kvExpire(key, windowSeconds);
  }
}
