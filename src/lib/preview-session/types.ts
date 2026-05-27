import type { StyleType } from "@/components/style-selector";

export type PreviewPhase =
  | "bw_review"
  | "bw_approved"
  | "style_selected"
  | "cart_added";

export type PreviewGenerationStatus =
  | "not_started"
  | "running"
  | "complete"
  | "failed";

export type GenerationErrorCode =
  | "safety"
  | "timeout"
  | "generic"
  | "prohibited_content";

export interface GenerationError {
  code: GenerationErrorCode;
  message: string;
}

export interface PreviewCandidate {
  id: string;
  kind: "bw" | "color";
  style?: StyleType;
  sourceUrl: string;
  version?: number;
  cleanUrl?: string;
  cleanPublicId?: string;
  previewUrl?: string;
  previewPublicId?: string;
  /** Incremented on each crop when stored at a revision-specific public id. */
  cropRevision?: number;
  createdAt: string;
  error?: GenerationError;
}

export interface PreviewSlot {
  originalUrl: string;
  originalPublicId?: string;
  inputVersion?: number;
  nextBwVersion?: number;
  nextColorVersion?: number;
  candidates: PreviewCandidate[];
  activeCandidateId?: string;
  inFlight: boolean;
  pendingIdempotencyKey?: string;
  colorCandidates?: PreviewCandidate[];
  colorPreview?: PreviewCandidate;
  colorInFlight?: boolean;
}

export type FrozenStyleStripThumbnail = {
  previewUrl: string;
  candidateId?: string;
};

export interface PreviewSession {
  id: string;
  phase: PreviewPhase;
  generationStatus: PreviewGenerationStatus;
  /** Book page order on preview/cart; slot indices refer to fixed Cloudinary/upload slots. */
  displayOrder?: number[];
  changeCreditsRemaining: number;
  slots: PreviewSlot[];
  selectedColorStyle?: StyleType;
  /** Slots awaiting all-styles color regen when user opens the color tab. */
  pendingColorRegenSlotIndexes?: number[];
  /** Slot-0 style strip thumbs frozen after initial pipeline (unchanged on slot-0 replace). */
  frozenStyleStripThumbnails?: Partial<
    Record<StyleType, FrozenStyleStripThumbnail>
  >;
  initializationError?: string;
  createdAt: string;
  updatedAt: string;
  clientIpHash?: string;
  /**
   * Ops: set to true in KV for one full support reset (credits + rate limits).
   * See support-bypass.ts.
   */
  supportAllowNextPreviewRound?: boolean;
  /** Set automatically when support round is applied; ops need not set manually. */
  supportGenerationBypassCallsRemaining?: number;
  /** Legacy one-off: bypass 24h full preview limit on next upload. */
  supportAllowFullGeneration?: boolean;
  /** Legacy one-off: bypass technical generation limit on next API call. */
  supportAllowGeneration?: boolean;
}

export interface PreviewSessionPublicView {
  id: string;
  updatedAt: string;
  phase: PreviewPhase;
  generationStatus: PreviewGenerationStatus;
  displayOrder: number[];
  changeCreditsRemaining: number;
  slots: Array<{
    index: number;
    originalUrl: string;
    activeCandidateId?: string;
    inFlight: boolean;
    candidates: PreviewCandidate[];
    colorCandidates?: PreviewCandidate[];
    colorPreview?: PreviewCandidate;
    colorInFlight: boolean;
  }>;
  selectedColorStyle?: StyleType;
  pendingColorRegenSlotIndexes?: number[];
  frozenStyleStripThumbnails?: Partial<
    Record<StyleType, FrozenStyleStripThumbnail>
  >;
  initializationError?: string;
  canRegenerate: boolean;
  canReplace: boolean;
  canApproveBw: boolean;
  canRegenerateColor: boolean;
  canSelectStyle: boolean;
  canAddToCart: boolean;
}

export interface BookImagePayload {
  originalUrls: string[];
  generatedBwUrls: string[];
  previewSessionId: string;
  style: StyleType;
}
