import { kvGet, kvSet } from "./kv";
import { previewIdempotencyKey } from "./redis";
import type { PreviewSessionPublicView } from "./types";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60;

export async function readIdempotentResponse(
  sessionId: string,
  idempotencyKey: string,
): Promise<PreviewSessionPublicView | null> {
  return kvGet<PreviewSessionPublicView>(
    previewIdempotencyKey(sessionId, idempotencyKey),
  );
}

export async function writeIdempotentResponse(
  sessionId: string,
  idempotencyKey: string,
  response: PreviewSessionPublicView,
): Promise<void> {
  await kvSet(previewIdempotencyKey(sessionId, idempotencyKey), response, {
    ex: IDEMPOTENCY_TTL_SECONDS,
  });
}
