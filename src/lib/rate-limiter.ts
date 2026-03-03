import { redis } from "./redis";
import crypto from "crypto";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  remaining: number;
  resetAt: Date;
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export const rateLimiter = {
  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const windowSec = Math.ceil(config.windowMs / 1000);
    const redisKey = `rl:${key}`;

    // Increment and get TTL atomically
    const current = await redis.incr(redisKey);

    // Set TTL only on the first request in the window
    if (current === 1) {
      await redis.expire(redisKey, windowSec);
    }

    // Get remaining TTL for resetAt calculation
    const ttl = await redis.ttl(redisKey);
    const resetAt = new Date(Date.now() + (ttl > 0 ? ttl : windowSec) * 1000);

    const allowed = current <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - current);

    return { allowed, current, remaining, resetAt };
  },

  async getCount(key: string): Promise<{ current: number; ttl: number }> {
    const redisKey = `rl:${key}`;
    const [countStr, ttl] = await Promise.all([
      redis.get<number>(redisKey),
      redis.ttl(redisKey),
    ]);
    return { current: countStr ?? 0, ttl: ttl > 0 ? ttl : 0 };
  },
};

export { hashIp };
