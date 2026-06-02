import type { StyleType } from "@/components/style-selector";
import { DEFAULT_COLOR_STYLE } from "@/lib/preview-session/color-by-style";
import type {
  PreviewCandidate,
  PreviewSessionPublicView,
} from "@/lib/preview-session/types";
import { getCandidateForStyle } from "./store";
import type { FramedArtSession, FramedArtSessionPublicView } from "./types";

function mapCandidate(candidate: FramedArtSession["candidates"][number]): PreviewCandidate {
  return {
    id: candidate.id,
    kind: "color",
    style: candidate.style,
    sourceUrl: candidate.sourceUrl,
    version: candidate.version,
    cleanUrl: candidate.cleanUrl,
    cleanPublicId: candidate.cleanPublicId,
    previewUrl: candidate.previewUrl,
    previewPublicId: candidate.previewPublicId,
    createdAt: candidate.createdAt,
    error: candidate.error,
  };
}

export function framedArtSessionToPreviewView(
  session: FramedArtSession | FramedArtSessionPublicView,
): PreviewSessionPublicView {
  const selectedStyle = session.selectedStyle ?? DEFAULT_COLOR_STYLE;
  const colorPreview = getCandidateForStyle(
    session as FramedArtSession,
    selectedStyle,
  );

  return {
    id: session.id,
    updatedAt: session.updatedAt,
    phase: "style_selected",
    generationStatus: session.generationStatus,
    displayOrder: [0],
    changeCreditsRemaining: 0,
    slots: [
      {
        index: 0,
        originalUrl: session.originalUrl,
        inFlight: false,
        candidates: [],
        colorCandidates: session.candidates.map(mapCandidate),
        colorPreview: colorPreview ? mapCandidate(colorPreview) : undefined,
        colorInFlight: session.inFlight,
      },
    ],
    selectedColorStyle: selectedStyle,
    canRegenerate: "canRegenerate" in session ? session.canRegenerate : !session.regenerateUsed,
    canReplace: false,
    canApproveBw: false,
    canRegenerateColor: "canRegenerate" in session ? session.canRegenerate : !session.regenerateUsed,
    canSelectStyle: session.generationStatus === "complete",
    canAddToCart: session.generationStatus === "complete",
  };
}

export function framedArtLoadingStyles(
  session: FramedArtSessionPublicView,
): Set<StyleType> {
  if (!session.inFlight) return new Set();
  return new Set<StyleType>(["cartoon", "pencil", "watercolor"]);
}
