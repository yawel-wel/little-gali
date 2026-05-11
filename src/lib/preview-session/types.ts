import type { StyleType } from "@/components/style-selector";

export type PreviewPhase =
  | "bw_review"
  | "bw_approved"
  | "style_selected"
  | "cart_added";

export type GenerationErrorCode = "safety" | "timeout" | "generic";

export interface GenerationError {
  code: GenerationErrorCode;
  message: string;
}

export interface PreviewCandidate {
  id: string;
  kind: "bw";
  sourceUrl: string;
  cleanUrl?: string;
  previewUrl?: string;
  createdAt: string;
  error?: GenerationError;
}

export interface PreviewSlot {
  originalUrl: string;
  candidates: PreviewCandidate[];
  activeCandidateId?: string;
  inFlight: boolean;
  pendingIdempotencyKey?: string;
}

export interface PreviewSession {
  id: string;
  phase: PreviewPhase;
  changeCreditsRemaining: number;
  slots: PreviewSlot[];
  selectedColorStyle?: StyleType;
  createdAt: string;
  updatedAt: string;
  clientIpHash?: string;
}

export interface PreviewSessionPublicView {
  id: string;
  phase: PreviewPhase;
  changeCreditsRemaining: number;
  slots: Array<{
    index: number;
    originalUrl: string;
    activeCandidateId?: string;
    inFlight: boolean;
    candidates: PreviewCandidate[];
  }>;
  selectedColorStyle?: StyleType;
  canRegenerate: boolean;
  canReplace: boolean;
  canApproveBw: boolean;
  canSelectStyle: boolean;
  canAddToCart: boolean;
}

export interface BookImagePayload {
  originalUrls: string[];
  generatedBwUrls: string[];
  previewSessionId: string;
  style: StyleType;
}
