import { prohibitedContentErrorPublicId } from "./cloudinary-paths";
import { uploadJsonToCloudinaryPublicId } from "./cloudinary";
import { isProhibitedContentErrorMessage } from "./generation-errors";
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
};

function parseFinishReason(error: unknown): string | undefined {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/finishReason=([A-Z_]+)/);
  return match?.[1];
}

export async function logProhibitedContentEvent(
  params: ProhibitedContentLogParams,
): Promise<void> {
  const finishReason = parseFinishReason(params.error) ?? "PROHIBITED_CONTENT";
  const payload = {
    type: "generation_error",
    code: "prohibited_content",
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
  trackSensitiveContentError({
    step:
      productType === "frame" ? "frame_generation" : "booklet_generation",
    product_type: productType,
  });
}

export function maybeLogProhibitedContentEvent(
  params: ProhibitedContentLogParams & { errorCode: string | undefined },
): void {
  if (params.errorCode !== "prohibited_content") {
    return;
  }
  const message = params.error instanceof Error ? params.error.message : "";
  if (!isProhibitedContentErrorMessage(message) && params.errorCode === "prohibited_content") {
    // Classified from message shape elsewhere; still log.
  }
  void logProhibitedContentEvent(params).catch((err) => {
    console.error("[preview] prohibited content log failed", err);
  });
}
