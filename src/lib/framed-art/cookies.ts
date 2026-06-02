import {
  PREVIEW_SESSION_COOKIE,
  previewSessionCookieOptions,
  signPreviewSessionId,
  verifyPreviewSessionCookie,
} from "@/lib/preview-session/cookies";
import { cookies } from "next/headers";

export const FRAMED_ART_SESSION_COOKIE = "framed_art_session";

export {
  signPreviewSessionId as signFramedArtSessionId,
  verifyPreviewSessionCookie as verifyFramedArtSessionCookie,
};

export async function getFramedArtSessionIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  return verifyPreviewSessionCookie(
    store.get(FRAMED_ART_SESSION_COOKIE)?.value,
  );
}

export function framedArtSessionCookieOptions() {
  return previewSessionCookieOptions();
}

/** Avoid collision if user switches between book preview and framed art. */
export async function clearBookPreviewSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PREVIEW_SESSION_COOKIE);
}
