import { createHash } from "crypto";

export function hashClientIp(ip: string | null): string {
  const value = ip?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export function getRequestIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    null
  );
}
