import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const PREVIEW_SESSION_COOKIE = "preview_session";

function getSigningSecret(): string {
  return (
    process.env.PREVIEW_SESSION_SECRET ||
    process.env.SHOPIFY_WEBHOOK_SECRET ||
    "dev-preview-session-secret"
  );
}

export function signPreviewSessionId(sessionId: string): string {
  const signature = createHmac("sha256", getSigningSecret())
    .update(sessionId)
    .digest("base64url");
  return `${sessionId}.${signature}`;
}

export function verifyPreviewSessionCookie(
  cookieValue: string | undefined,
): string | null {
  if (!cookieValue) return null;
  const lastDot = cookieValue.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const sessionId = cookieValue.slice(0, lastDot);
  const signature = cookieValue.slice(lastDot + 1);
  const expected = signPreviewSessionId(sessionId).slice(lastDot + 1);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }
  } catch {
    return null;
  }
  return sessionId;
}

export async function getPreviewSessionIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  return verifyPreviewSessionCookie(store.get(PREVIEW_SESSION_COOKIE)?.value);
}

export function previewSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 48 * 60 * 60,
  };
}
