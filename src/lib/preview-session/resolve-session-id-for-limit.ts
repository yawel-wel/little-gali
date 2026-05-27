import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  PREVIEW_SESSION_COOKIE,
  verifyPreviewSessionCookie,
} from "./cookies";

export async function resolveSessionIdForGenerationLimit(
  requestedSessionId?: string,
): Promise<string> {
  if (requestedSessionId) {
    return requestedSessionId;
  }
  const cookieStore = await cookies();
  const fromCookie = verifyPreviewSessionCookie(
    cookieStore.get(PREVIEW_SESSION_COOKIE)?.value,
  );
  if (fromCookie) {
    return fromCookie;
  }
  return randomUUID();
}
