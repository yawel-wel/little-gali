import { getRedis, previewIdempotencyKey } from "./redis";
import type { PreviewSessionPublicView } from "./types";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60;

export async function readIdempotentResponse(
  sessionId: string,
  idempotencyKey: string,
): Promise<PreviewSessionPublicView | null> {
  const redis = getRedis();
  return redis.get<PreviewSessionPublicView>(
    previewIdempotencyKey(sessionId, idempotencyKey),
  );
}

export async function writeIdempotentResponse(
  sessionId: string,
  idempotencyKey: string,
  response: PreviewSessionPublicView,
): Promise<void> {
  const redis = getRedis();
  await redis.set(previewIdempotencyKey(sessionId, idempotencyKey), response, {
    ex: IDEMPOTENCY_TTL_SECONDS,
  });
}
