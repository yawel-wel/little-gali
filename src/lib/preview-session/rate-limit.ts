import { getRedis, previewNewSessionRateKey } from "./redis";

const NEW_SESSION_WINDOW_SECONDS = 24 * 60 * 60;
const MAX_NEW_SESSIONS_PER_WINDOW = 5;

export async function checkNewSessionRateLimit(
  ipHash: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const key = previewNewSessionRateKey(ipHash);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, NEW_SESSION_WINDOW_SECONDS);
  }
  if (count > MAX_NEW_SESSIONS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  return {
    allowed: true,
    remaining: Math.max(0, MAX_NEW_SESSIONS_PER_WINDOW - count),
  };
}
