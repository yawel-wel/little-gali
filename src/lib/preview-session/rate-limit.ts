import { getFullGenerationRateLimitConfig } from "@/lib/rate-limit/config";
import { kvDel, kvExpire, kvGet, kvIncr, kvTtl } from "./kv";
import { isFullGenerationLimitBypassed } from "./preview-limits-bypass";
import { previewFullGenerationRateKey } from "./redis";

const fullGenerationRateLimitConfig = getFullGenerationRateLimitConfig();

/** Read-only check; does not increment the per-IP counter. */
export async function peekFullGenerationRateLimit(
  ipHash: string,
): Promise<{ allowed: boolean }> {
  const { limit: maxPerWindow } = fullGenerationRateLimitConfig;

  if (isFullGenerationLimitBypassed()) {
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

  if (isFullGenerationLimitBypassed()) {
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

  if (isFullGenerationLimitBypassed()) {
    return;
  }

  const key = previewFullGenerationRateKey(ipHash);
  const count = await kvIncr(key);
  if (count === 1) {
    await kvExpire(key, windowSeconds);
  }
}

function resetAtFromTtlSeconds(ttlSeconds: number | null): string | null {
  if (ttlSeconds === null || ttlSeconds <= 0) {
    return null;
  }
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

/** Read-only snapshot of the per-IP full-generation counter and window expiry. */
export async function peekFullGenerationRateLimitState(ipHash: string): Promise<{
  count: number;
  resetAt: string | null;
}> {
  if (isFullGenerationLimitBypassed()) {
    return { count: 0, resetAt: null };
  }

  const key = previewFullGenerationRateKey(ipHash);
  const raw = await kvGet<number | string>(key);
  const count =
    typeof raw === "number"
      ? raw
      : Number.parseInt(String(raw ?? "0"), 10) || 0;
  const ttlSeconds = await kvTtl(key);

  return {
    count,
    resetAt: resetAtFromTtlSeconds(ttlSeconds),
  };
}

export async function resetFullGenerationRateLimit(ipHash: string): Promise<void> {
  if (isFullGenerationLimitBypassed()) {
    return;
  }
  await kvDel(previewFullGenerationRateKey(ipHash));
}
