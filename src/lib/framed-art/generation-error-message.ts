import { getCandidateForStyle } from "./store";
import type { FramedArtSession } from "./types";

export function getFramedArtGenerationErrorMessage(
  session: FramedArtSession,
): string | null {
  const style = session.selectedStyle;
  if (!style) {
    return null;
  }
  const candidate = getCandidateForStyle(session, style);
  return candidate?.error?.message ?? null;
}
