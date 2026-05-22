import { kvExpire, kvIncr } from "./kv";
import { previewFullGenerationRateKey } from "./redis";

const FULL_GENERATION_WINDOW_SECONDS = 24 * 60 * 60;
const MAX_FULL_GENERATIONS_PER_WINDOW = 1;

function isPreviewRateLimitDisabled(): boolean {
  return process.env.SKIP_PREVIEW_RATE_LIMIT === "true";
}

export async function checkFullGenerationRateLimit(
  ipHash: string,
): Promise<{ allowed: boolean; remaining: number }> {
  if (isPreviewRateLimitDisabled()) {
    return { allowed: true, remaining: MAX_FULL_GENERATIONS_PER_WINDOW };
  }

  const key = previewFullGenerationRateKey(ipHash);
  const count = await kvIncr(key);
  if (count === 1) {
    await kvExpire(key, FULL_GENERATION_WINDOW_SECONDS);
  }
  if (count > MAX_FULL_GENERATIONS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  return {
    allowed: true,
    remaining: Math.max(0, MAX_FULL_GENERATIONS_PER_WINDOW - count),
  };
}
