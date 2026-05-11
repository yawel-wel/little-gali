import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("Upstash Redis is not configured");
    }
    redisClient = new Redis({ url, token });
  }
  return redisClient;
}

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

export function previewNewSessionRateKey(ipHash: string): string {
  return `preview:rate:new-session:${ipHash}`;
}

export function cartImagesKey(cartId: string, lineId: string): string {
  return `cart:images:${cartId}:${lineId}`;
}
