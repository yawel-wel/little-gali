import { getCandidateForStyle } from "./store";
import type { FramedArtSession, FramedArtSessionPublicView } from "./types";

export function isFramedArtProhibitedContent(
  session: Pick<FramedArtSession, "candidates" | "selectedStyle">,
): boolean {
  const style = session.selectedStyle;
  if (!style) return false;
  const candidate = getCandidateForStyle(
    session as FramedArtSession,
    style,
  );
  return candidate?.error?.code === "prohibited_content";
}
