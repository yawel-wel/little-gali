import { getFullGenerationRateLimitConfig } from "@/lib/rate-limit/config";
import { kvExpire, kvIncr } from "./kv";
import { previewFullGenerationRateKey } from "./redis";

const fullGenerationRateLimitConfig = getFullGenerationRateLimitConfig();

function isPreviewRateLimitDisabled(): boolean {
  return process.env.SKIP_PREVIEW_RATE_LIMIT === "true";
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
