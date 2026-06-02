import type { StyleType } from "@/components/style-selector";
import type { GenerationError } from "@/lib/preview-session/types";

export type FramedArtGenerationStatus =
  | "not_started"
  | "running"
  | "complete"
  | "failed";

export type FramedArtPhase = "uploaded" | "preview" | "cart_added";

export interface FramedArtStyleCandidate {
  id: string;
  style: StyleType;
  sourceUrl: string;
  version: number;
  cleanUrl?: string;
  cleanPublicId?: string;
  previewUrl?: string;
  previewPublicId?: string;
  createdAt: string;
  error?: GenerationError;
}

export interface FramedArtSession {
  id: string;
  phase: FramedArtPhase;
  generationStatus: FramedArtGenerationStatus;
  originalUrl: string;
  originalPublicId?: string;
  candidates: FramedArtStyleCandidate[];
  selectedStyle?: StyleType;
  regenerateUsed: boolean;
  inFlight: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FramedArtSessionPublicView {
  id: string;
  updatedAt: string;
  phase: FramedArtPhase;
  generationStatus: FramedArtGenerationStatus;
  originalUrl: string;
  candidates: FramedArtStyleCandidate[];
  selectedStyle?: StyleType;
  regenerateUsed: boolean;
  inFlight: boolean;
  canRegenerate: boolean;
}
