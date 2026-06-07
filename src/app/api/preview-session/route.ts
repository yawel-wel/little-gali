import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { after, NextRequest, NextResponse } from "next/server";
import { findDisallowedUploadImage } from "@/lib/allowed-image-types";
import { logPreviewFullGenerationRateLimited } from "@/lib/preview-session/log-preview-rate-limit";
import { isPreviewEnabled, requirePreviewSession } from "@/lib/preview-session/auth";
import { isAllowedCloudinaryUrl } from "@/lib/preview-session/cloudinary";
import { isUuid } from "@/lib/preview-session/cloudinary-paths";
import {
  PREVIEW_SESSION_COOKIE,
  previewSessionCookieOptions,
  signPreviewSessionId,
  verifyPreviewSessionCookie,
} from "@/lib/preview-session/cookies";
import { INITIAL_CHANGE_CREDITS } from "@/lib/preview-session/credits";
import { DEFAULT_DISPLAY_ORDER } from "@/lib/preview-session/display-order";
import { getRequestIp, hashClientIp } from "@/lib/preview-session/hash";
import {
  markSessionPipelineFailed,
  runPreviewPipelineFromMultipart,
  runPreviewPipelineFromRemoteUrls,
  type PendingUpload,
} from "@/lib/preview-session/preview-pipeline";
import { assertGenerationRateLimit } from "@/lib/rate-limit/generation-limiter";
import { checkFullGenerationRateLimit } from "@/lib/preview-session/rate-limit";
import {
  applySupportNextPreviewRoundIfRequested,
  inheritSupportGrants,
  tryConsumeSupportFullGenerationBypass,
} from "@/lib/preview-session/support-bypass";
import {
  createPendingSlots,
  loadPreviewSession,
  resolveGenerationStatus,
  savePreviewSession,
  toPublicView,
} from "@/lib/preview-session/store";
import { PREVIEW_RATE_LIMIT_ERROR_CODE } from "@/lib/preview-session/constants";
import type { PreviewSession } from "@/lib/preview-session/types";
import { resolveSessionIdForGenerationLimit } from "@/lib/preview-session/resolve-session-id-for-limit";

export { PREVIEW_RATE_LIMIT_ERROR_CODE } from "@/lib/preview-session/constants";

export const runtime = "nodejs";
export const maxDuration = 300;

function rateLimitedJson(
  error: string,
  sessionId?: string,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    {
      error,
      ...(sessionId ? { sessionId } : {}),
      ...extra,
    },
    { status: 429 },
  );
}

async function assertCanStartFullGeneration(
  request: NextRequest,
  clientSessionId?: string,
): Promise<{ ok: true } | { error: string; status: number }> {
  if (await tryConsumeSupportFullGenerationBypass(request, clientSessionId)) {
    return { ok: true };
  }

  const ipHash = hashClientIp(getRequestIp(request));
  const rate = await checkFullGenerationRateLimit(ipHash);
  if (!rate.allowed) {
    logPreviewFullGenerationRateLimited("api");
    return { error: PREVIEW_RATE_LIMIT_ERROR_CODE, status: 429 };
  }
  return { ok: true };
}

function scheduleMultipartPipeline(
  sessionId: string,
  uploads: PendingUpload[],
): void {
  after(async () => {
    try {
      await runPreviewPipelineFromMultipart(sessionId, uploads);
    } catch (error) {
      console.error("Background preview ingest failed:", sessionId, error);
      await markSessionPipelineFailed(sessionId, error);
    }
  });
}

function scheduleRemotePipeline(sessionId: string, originalUrls: string[]): void {
  after(async () => {
    try {
      await runPreviewPipelineFromRemoteUrls(sessionId, originalUrls);
    } catch (error) {
      console.error("Background preview remote ingest failed:", sessionId, error);
      await markSessionPipelineFailed(sessionId, error);
    }
  });
}

async function createNewPreviewSession(
  request: NextRequest,
  sessionId: string,
): Promise<PreviewSession> {
  const ipHash = hashClientIp(getRequestIp(request));
  const now = new Date().toISOString();
  const session: PreviewSession = {
    id: sessionId,
    phase: "bw_review",
    generationStatus: "not_started",
    displayOrder: [...DEFAULT_DISPLAY_ORDER],
    changeCreditsRemaining: INITIAL_CHANGE_CREDITS,
    slots: createPendingSlots(),
    createdAt: now,
    updatedAt: now,
    clientIpHash: ipHash,
  };

  await savePreviewSession(session);

  const cookieStore = await cookies();
  cookieStore.set(
    PREVIEW_SESSION_COOKIE,
    signPreviewSessionId(sessionId),
    previewSessionCookieOptions(),
  );

  return session;
}

/**
 * Starts a brand-new KV session id + cookie. Used when the client sends new
 * images while localStorage `lgSessionId` still references an already-complete
 * preview — otherwise we skip ingestion and keep showing stale outputs.
 */
async function startFreshPreviewSessionForNewUpload(
  request: NextRequest,
): Promise<{ session: PreviewSession }> {
  const session = await createNewPreviewSession(request, randomUUID());
  return { session };
}

async function prepareSessionForPipelineStart(
  request: NextRequest,
  requestedSessionId?: string,
): Promise<
  | { session: PreviewSession; shouldSchedulePipeline: boolean }
  | { error: string; status: number }
> {
  const isNewSession = !requestedSessionId;
  const sessionId = requestedSessionId ?? randomUUID();

  if (isNewSession) {
    const session = await createNewPreviewSession(request, sessionId);
    return { session, shouldSchedulePipeline: true };
  }

  const existing = await loadPreviewSession(sessionId);
  if (!existing) {
    /**
     * If the client sends a sessionId but KV has expired (or was evicted),
     * reusing the same id is dangerous because Cloudinary inputs/outputs are
     * deterministically keyed by sessionId. That can lead to "yesterday's images"
     * showing up for a "new" upload. Always rotate to a fresh session id.
     */
    const session = await createNewPreviewSession(request, randomUUID());
    return { session, shouldSchedulePipeline: true };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    PREVIEW_SESSION_COOKIE,
    signPreviewSessionId(sessionId),
    previewSessionCookieOptions(),
  );

  const status = resolveGenerationStatus(existing);
  if (status === "running" || status === "complete") {
    return { session: existing, shouldSchedulePipeline: false };
  }

  if (status === "failed") {
    existing.slots = createPendingSlots();
    existing.displayOrder = [...DEFAULT_DISPLAY_ORDER];
    existing.initializationError = undefined;
    existing.generationStatus = "not_started";
    await savePreviewSession(existing);
    return { session: existing, shouldSchedulePipeline: true };
  }

  return { session: existing, shouldSchedulePipeline: true };
}

async function markPipelineRunning(session: PreviewSession): Promise<void> {
  session.generationStatus = "running";
  session.initializationError = undefined;
  await savePreviewSession(session);
}

function readRequestedSessionId(value: FormDataEntryValue | string | undefined | null) {
  if (typeof value !== "string" || !value) {
    return undefined;
  }
  if (!isUuid(value)) {
    throw new Error("Invalid session ID");
  }
  return value;
}

async function respondWithSession(session: PreviewSession): Promise<NextResponse> {
  return NextResponse.json({ session: toPublicView(session) });
}

export async function POST(request: NextRequest) {
  if (!isPreviewEnabled()) {
    return NextResponse.json({ error: "Preview is disabled" }, { status: 403 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files = formData.getAll("images") as File[];
      const requestedSessionId = readRequestedSessionId(formData.get("sessionId"));
      const sessionIdForLimit = await resolveSessionIdForGenerationLimit(
        requestedSessionId,
      );
      await applySupportNextPreviewRoundIfRequested(
        requestedSessionId ?? sessionIdForLimit,
      );
      const generationLimit = await assertGenerationRateLimit(sessionIdForLimit);
      if (generationLimit) {
        return generationLimit;
      }

      if (files.length !== 5) {
        return NextResponse.json(
          { error: "Exactly five images are required" },
          { status: 400 },
        );
      }

      if (findDisallowedUploadImage(files)) {
        return NextResponse.json(
          { error: "Only JPG and PNG images are allowed" },
          { status: 400 },
        );
      }

      const prepared = await prepareSessionForPipelineStart(
        request,
        requestedSessionId ?? sessionIdForLimit,
      );
      if ("error" in prepared) {
        return NextResponse.json(
          { error: prepared.error },
          { status: prepared.status },
        );
      }

      let sessionForPipeline = prepared.session;
      let shouldSchedule = prepared.shouldSchedulePipeline;

      if (!shouldSchedule) {
        const genStatus = resolveGenerationStatus(sessionForPipeline);
        if (genStatus === "complete" || genStatus === "running") {
          const priorSession = sessionForPipeline;
          const fresh = await startFreshPreviewSessionForNewUpload(request);
          sessionForPipeline = fresh.session;
          inheritSupportGrants(priorSession, sessionForPipeline);
          await savePreviewSession(sessionForPipeline);
          shouldSchedule = true;
          const freshGenerationLimit = await assertGenerationRateLimit(
            sessionForPipeline.id,
            sessionForPipeline.id,
          );
          if (freshGenerationLimit) {
            return freshGenerationLimit;
          }
        } else {
          return respondWithSession(sessionForPipeline);
        }
      }

      const rateLimit = await assertCanStartFullGeneration(
        request,
        requestedSessionId ?? sessionIdForLimit,
      );
      if ("error" in rateLimit) {
        return rateLimitedJson(rateLimit.error, sessionForPipeline.id);
      }

      const pendingUploads = await Promise.all(
        files.map(async (file) => ({
          buffer: Buffer.from(await file.arrayBuffer()),
          mimeType: file.type || "image/jpeg",
          fileName: file.name || "image.jpg",
        })),
      );

      await markPipelineRunning(sessionForPipeline);
      scheduleMultipartPipeline(sessionForPipeline.id, pendingUploads);
      return respondWithSession(sessionForPipeline);
    }

    const body = (await request.json()) as {
      originalUrls?: string[];
      sessionId?: string;
    };
    const requestedSessionId = readRequestedSessionId(body.sessionId);
    const sessionIdForLimit = await resolveSessionIdForGenerationLimit(
      requestedSessionId,
    );
    await applySupportNextPreviewRoundIfRequested(
      requestedSessionId ?? sessionIdForLimit,
    );
    const generationLimit = await assertGenerationRateLimit(sessionIdForLimit);
    if (generationLimit) {
      return generationLimit;
    }

    const originalUrls = body.originalUrls ?? [];

    if (originalUrls.length !== 5) {
      return NextResponse.json(
        { error: "Exactly five original image URLs are required" },
        { status: 400 },
      );
    }

    if (!originalUrls.every(isAllowedCloudinaryUrl)) {
      return NextResponse.json(
        { error: "All images must be uploaded to Cloudinary first" },
        { status: 400 },
      );
    }

    const prepared = await prepareSessionForPipelineStart(
      request,
      requestedSessionId ?? sessionIdForLimit,
    );
    if ("error" in prepared) {
      return NextResponse.json(
        { error: prepared.error },
        { status: prepared.status },
      );
    }

    let sessionForPipeline = prepared.session;
    let shouldSchedule = prepared.shouldSchedulePipeline;

    if (!shouldSchedule) {
      const genStatus = resolveGenerationStatus(sessionForPipeline);
        if (genStatus === "complete" || genStatus === "running") {
          const priorSession = sessionForPipeline;
          const fresh = await startFreshPreviewSessionForNewUpload(request);
          sessionForPipeline = fresh.session;
          inheritSupportGrants(priorSession, sessionForPipeline);
          await savePreviewSession(sessionForPipeline);
          shouldSchedule = true;
          const freshGenerationLimit = await assertGenerationRateLimit(
            sessionForPipeline.id,
            sessionForPipeline.id,
          );
          if (freshGenerationLimit) {
            return freshGenerationLimit;
          }
        } else {
          return respondWithSession(sessionForPipeline);
        }
      }

    const rateLimit = await assertCanStartFullGeneration(
      request,
      requestedSessionId ?? sessionIdForLimit,
    );
    if ("error" in rateLimit) {
      return rateLimitedJson(rateLimit.error, sessionForPipeline.id);
    }

    await markPipelineRunning(sessionForPipeline);
    scheduleRemotePipeline(sessionForPipeline.id, originalUrls);
    return respondWithSession(sessionForPipeline);
  } catch (error) {
    console.error("Preview session start error:", error);
    if (error instanceof Error && error.message === "Invalid session ID") {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({ session: toPublicView(auth.session) });
}
