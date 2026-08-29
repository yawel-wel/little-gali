import { Redis } from "@upstash/redis";

type KvClient = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<void>;
  setNx(
    key: string,
    value: unknown,
    options?: { ex?: number },
  ): Promise<boolean>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number | null>;
};

class MemoryKv implements KvClient {
  private data = new Map<string, { value: string; expiresAt?: number }>();

  private isExpired(key: string): boolean {
    const entry = this.data.get(key);
    if (!entry?.expiresAt) return false;
    if (entry.expiresAt > Date.now()) return false;
    this.data.delete(key);
    return true;
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isExpired(key)) return null;
    const entry = this.data.get(key);
    if (!entry) return null;
    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    this.data.set(key, {
      value: JSON.stringify(value),
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : undefined,
    });
  }

  async setNx(
    key: string,
    value: unknown,
    options?: { ex?: number },
  ): Promise<boolean> {
    if (this.isExpired(key)) {
      this.data.delete(key);
    }
    if (this.data.has(key)) {
      return false;
    }
    this.data.set(key, {
      value: JSON.stringify(value),
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : undefined,
    });
    return true;
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
  }

  async incr(key: string): Promise<number> {
    if (this.isExpired(key)) {
      this.data.delete(key);
    }
    const entry = this.data.get(key);
    const next = entry ? Number.parseInt(entry.value, 10) + 1 : 1;
    this.data.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt,
    });
    return next;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.data.get(key);
    if (!entry) return;
    this.data.set(key, {
      ...entry,
      expiresAt: Date.now() + seconds * 1000,
    });
  }

  async ttl(key: string): Promise<number | null> {
    if (this.isExpired(key)) {
      return null;
    }
    const entry = this.data.get(key);
    if (!entry) {
      return null;
    }
    if (!entry.expiresAt) {
      return -1;
    }
    const remainingMs = entry.expiresAt - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : null;
  }
}

let redisClient: Redis | null = null;
let memoryClient: MemoryKv | null = null;
let forceMemoryStore = process.env.PREVIEW_SESSION_STORE === "memory";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function hasRedisConfig(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function shouldUseMemoryStore(): boolean {
  if (forceMemoryStore) return true;
  if (!hasRedisConfig()) {
    return !isProduction();
  }
  return false;
}

function shouldFallbackToMemory(error: unknown): boolean {
  if (shouldUseMemoryStore()) return true;
  const messages: string[] = [];
  if (error instanceof Error) {
    messages.push(error.message);
    if (error.cause instanceof Error) {
      messages.push(error.cause.message);
    }
  } else {
    messages.push(String(error));
  }
  const combined = messages.join(" ").toLowerCase();
  return (
    combined.includes("enotfound") ||
    combined.includes("fetch failed") ||
    combined.includes("econnrefused") ||
    combined.includes("network")
  );
}

function getRedisClient(): KvClient {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("Upstash Redis is not configured");
    }
    redisClient = new Redis({ url, token });
  }

  const redis = redisClient;
  return {
    get: <T>(key: string) => redis.get<T>(key),
    set: async (key, value, options) => {
      if (options?.ex) {
        await redis.set(key, value, { ex: options.ex });
        return;
      }
      await redis.set(key, value);
    },
    setNx: async (key, value, options) => {
      const result = options?.ex
        ? await redis.set(key, value, { nx: true, ex: options.ex })
        : await redis.set(key, value, { nx: true });
      return result === "OK";
    },
    del: async (key) => {
      await redis.del(key);
    },
    incr: (key) => redis.incr(key),
    expire: async (key, seconds) => {
      await redis.expire(key, seconds);
    },
    ttl: async (key) => {
      const result = await redis.ttl(key);
      if (typeof result !== "number" || result < 0) {
        return null;
      }
      return result;
    },
  };
}

function getMemoryClient(): MemoryKv {
  if (!memoryClient) {
    memoryClient = new MemoryKv();
  }
  return memoryClient;
}

async function withKv<T>(operation: (client: KvClient) => Promise<T>): Promise<T> {
  if (shouldUseMemoryStore()) {
    return operation(getMemoryClient());
  }

  if (isProduction() && !hasRedisConfig()) {
    throw new Error(
      "Upstash Redis is required in production for preview sessions. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  try {
    return await operation(getRedisClient());
  } catch (error) {
    if (isProduction() || !shouldFallbackToMemory(error)) {
      throw error;
    }
    forceMemoryStore = true;
    console.warn(
      "Preview session store: Redis unavailable, using in-memory fallback for this Node process only. Sessions are not shared across instances and are lost on restart.",
    );
    return operation(getMemoryClient());
  }
}

export async function kvGet<T>(key: string): Promise<T | null> {
  return withKv((client) => client.get<T>(key));
}

export async function kvSet(
  key: string,
  value: unknown,
  options?: { ex?: number },
): Promise<void> {
  return withKv((client) => client.set(key, value, options));
}

/** SET key NX — returns true only when this caller created the key. */
export async function kvSetNx(
  key: string,
  value: unknown,
  options?: { ex?: number },
): Promise<boolean> {
  return withKv((client) => client.setNx(key, value, options));
}

export async function kvDel(key: string): Promise<void> {
  return withKv((client) => client.del(key));
}

export async function kvIncr(key: string): Promise<number> {
  return withKv((client) => client.incr(key));
}

export async function kvExpire(key: string, seconds: number): Promise<void> {
  return withKv((client) => client.expire(key, seconds));
}

export async function kvTtl(key: string): Promise<number | null> {
  return withKv((client) => client.ttl(key));
}
