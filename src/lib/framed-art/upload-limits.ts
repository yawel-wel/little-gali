import { kvExpire, kvGet, kvIncr } from "@/lib/preview-session/kv";
import { isPreviewLimitsBypassed } from "@/lib/preview-session/preview-limits-bypass";
import { framedArtUploadRateKey } from "@/lib/preview-session/redis";

export const FRAMED_ART_UPLOAD_LIMIT = 10;
export const FRAMED_ART_UPLOAD_WINDOW_SECONDS = 12 * 60 * 60;

function parseLimit(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getFramedUploadLimitConfig(): {
  limit: number;
  windowSeconds: number;
} {
  return {
    limit: parseLimit(
      process.env.FRAMED_ART_UPLOAD_RATE_LIMIT,
      FRAMED_ART_UPLOAD_LIMIT,
    ),
    windowSeconds: parseLimit(
      process.env.FRAMED_ART_UPLOAD_WINDOW_SECONDS,
      FRAMED_ART_UPLOAD_WINDOW_SECONDS,
    ),
  };
}

export async function peekFramedUploadLimit(ipHash: string): Promise<{
  remaining: number;
  limit: number;
  allowed: boolean;
}> {
  const { limit, windowSeconds } = getFramedUploadLimitConfig();

  if (isPreviewLimitsBypassed()) {
    return { remaining: limit, limit, allowed: true };
  }

  const key = framedArtUploadRateKey(ipHash);
  const raw = await kvGet<number | string>(key);
  const used =
    typeof raw === "number"
      ? raw
      : Number.parseInt(String(raw ?? "0"), 10) || 0;
  const remaining = Math.max(0, limit - used);
  return {
    remaining,
    limit,
    allowed: remaining > 0,
  };
}

/** Consume one upload slot when starting a new framed-art session. */
export async function consumeFramedUploadSlot(ipHash: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const { limit, windowSeconds } = getFramedUploadLimitConfig();

  if (isPreviewLimitsBypassed()) {
    return { allowed: true, remaining: limit, limit };
  }

  const key = framedArtUploadRateKey(ipHash);
  const count = await kvIncr(key);
  if (count === 1) {
    await kvExpire(key, windowSeconds);
  }

  if (count > limit) {
    return { allowed: false, remaining: 0, limit };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - count),
    limit,
  };
}
