import { prohibitedContentErrorPublicId } from "./cloudinary-paths";
import { uploadJsonToCloudinaryPublicId } from "./cloudinary";
import { analyticsContextFromSession } from "@/lib/analytics-context";
import { trackSensitiveContentError } from "@/lib/analytics-server";
import { logPreviewProhibitedContent } from "./generation-log";
import type { PreviewGenerationTrigger } from "./generation-log";
import type { PreviewOutputKind } from "./cloudinary-paths";
import type { StyleType } from "@/components/style-selector";

export type ProhibitedContentLogParams = {
  sessionId: string;
  slotIndex: number;
  side: PreviewOutputKind;
  candidateId: string;
  sourceUrl: string;
  trigger: PreviewGenerationTrigger;
  style?: StyleType;
  error: unknown;
  productType?: "booklet" | "frame";
  errorCode: string;
};

/** Codes for images Gemini refused on content grounds — expected, not bugs. */
export function isContentBlockCode(code: string | undefined): boolean {
  return code === "prohibited_content" || code === "safety";
}

/** e.g. IMAGE_SAFETY, PROHIBITED_CONTENT, IMAGE_PROHIBITED_CONTENT, or a prompt blockReason. */
function parseBlockReason(error: unknown): string | undefined {
  const message = error instanceof Error ? error.message : String(error);
  const match =
    message.match(/finishReason=([A-Z_]+)/) ??
    message.match(/safety blocked: ([A-Z_]+)/);
  return match?.[1];
}

export async function logProhibitedContentEvent(
  params: ProhibitedContentLogParams,
): Promise<void> {
  const finishReason =
    parseBlockReason(params.error) ??
    (params.errorCode === "safety" ? "SAFETY" : "PROHIBITED_CONTENT");
  const payload = {
    type: "generation_error",
    code: params.errorCode,
    finishReason,
    sessionId: params.sessionId,
    slot: params.slotIndex,
    side: params.side,
    style: params.style,
    candidateId: params.candidateId,
    sourceUrl: params.sourceUrl,
    trigger: params.trigger,
    createdAt: new Date().toISOString(),
  };

  const tags = [
    "generation_error",
    "prohibited_content",
    `preview_session_${params.sessionId}`,
  ];

  let cloudinaryErrorPublicId: string | undefined;
  try {
    const assetPath = prohibitedContentErrorPublicId(
      params.sessionId,
      params.side,
      params.slotIndex,
      params.candidateId,
    );
    const upload = await uploadJsonToCloudinaryPublicId(payload, assetPath, tags);
    cloudinaryErrorPublicId = upload.publicId;
  } catch (cloudinaryError) {
    console.error(
      "[preview] prohibited content Cloudinary log failed",
      params.sessionId,
      params.slotIndex,
      cloudinaryError,
    );
  }

  logPreviewProhibitedContent(
    {
      sessionId: params.sessionId,
      slot: params.slotIndex,
      side: params.side,
      candidateId: params.candidateId,
      trigger: params.trigger,
      style: params.style,
      finishReason,
      cloudinaryErrorPublicId,
    },
    {
      sessionId: params.sessionId,
      slot: params.slotIndex,
      trigger: params.trigger,
      side: params.side,
      style: params.style,
      candidateId: params.candidateId,
    },
  );

  const productType = params.productType ?? "booklet";
  trackSensitiveContentError(
    {
      step:
        productType === "frame" ? "frame_generation" : "booklet_generation",
      product_type: productType,
      session_id: params.sessionId,
      slot_index: params.slotIndex,
      reason: finishReason,
    },
    analyticsContextFromSession(
      { id: params.sessionId },
      productType,
    ),
  );
}

export function maybeLogProhibitedContentEvent(
  params: Omit<ProhibitedContentLogParams, "errorCode"> & {
    errorCode: string | undefined;
  },
): void {
  const { errorCode } = params;
  if (!errorCode || !isContentBlockCode(errorCode)) {
    return;
  }
  void logProhibitedContentEvent({ ...params, errorCode }).catch((err) => {
    console.error("[preview] prohibited content log failed", err);
  });
}
