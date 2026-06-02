export const PREVIEW_SESSION_TTL_SECONDS = 48 * 60 * 60;

export function previewSessionKey(sessionId: string): string {
  return `preview:session:${sessionId}`;
}

export function previewIdempotencyKey(
  sessionId: string,
  idempotencyKey: string,
): string {
  return `preview:idempotency:${sessionId}:${idempotencyKey}`;
}

export function previewFullGenerationRateKey(ipHash: string): string {
  return `preview:rate:full-generation:${ipHash}`;
}

export function cartImagesKey(cartId: string, lineId: string): string {
  return `cart:images:${cartId}:${lineId}`;
}

export function framedArtSessionKey(sessionId: string): string {
  return `framed-art:session:${sessionId}`;
}

export function framedArtUploadRateKey(ipHash: string): string {
  return `framed-art:rate:upload:${ipHash}`;
}
