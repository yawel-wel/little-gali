import type { NextRequest } from "next/server";
import { GENERATION_LIMIT_ERROR_CODE } from "@/lib/rate-limit/constants";
import { peekGenerationLimit } from "@/lib/rate-limit/generation-limiter";
import { getRequestIp, hashClientIp } from "./hash";
import { PREVIEW_RATE_LIMIT_ERROR_CODE } from "./constants";
import { peekFullGenerationRateLimit } from "./rate-limit";
import { resolveSessionIdForGenerationLimit } from "./resolve-session-id-for-limit";
import { loadPreviewSession, resolveGenerationStatus } from "./store";

export type PreviewStartCheckResult =
  | { allowed: true }
  | {
      allowed: false;
      error: typeof PREVIEW_RATE_LIMIT_ERROR_CODE | typeof GENERATION_LIMIT_ERROR_CODE;
      sessionId: string;
    };

async function hasSupportFullGenerationBypass(
  clientSessionId?: string,
): Promise<boolean> {
  if (!clientSessionId) {
    return false;
  }
  const session = await loadPreviewSession(clientSessionId);
  if (!session) {
    return false;
  }
  return Boolean(
    session.supportAllowNextPreviewRound ||
      session.supportAllowFullGeneration,
  );
}

async function hasSupportGenerationBypass(sessionId: string): Promise<boolean> {
  const session = await loadPreviewSession(sessionId);
  if (!session) {
    return false;
  }
  if (session.supportAllowNextPreviewRound) {
    return true;
  }
  if ((session.supportGenerationBypassCallsRemaining ?? 0) > 0) {
    return true;
  }
  return Boolean(session.supportAllowGeneration);
}

export async function checkPreviewStartEligibility(
  request: NextRequest,
  requestedSessionId?: string,
): Promise<PreviewStartCheckResult> {
  const sessionIdForLimit = await resolveSessionIdForGenerationLimit(
    requestedSessionId,
  );
  const clientSessionId = requestedSessionId ?? sessionIdForLimit;

  if (!(await hasSupportGenerationBypass(sessionIdForLimit))) {
    const generation = await peekGenerationLimit(sessionIdForLimit);
    if (!generation.allowed) {
      return {
        allowed: false,
        error: GENERATION_LIMIT_ERROR_CODE,
        sessionId: sessionIdForLimit,
      };
    }
  }

  let responseSessionId = sessionIdForLimit;

  if (requestedSessionId) {
    const existing = await loadPreviewSession(requestedSessionId);
    if (existing) {
      const status = resolveGenerationStatus(existing);
      if (status === "running" || status === "complete") {
        // POST would rotate to a new session id; generation limit on a fresh id is ok.
        responseSessionId = requestedSessionId;
      } else {
        responseSessionId = requestedSessionId;
      }
    }
  }

  if (!(await hasSupportFullGenerationBypass(clientSessionId))) {
    const ipHash = hashClientIp(getRequestIp(request));
    const fullGeneration = await peekFullGenerationRateLimit(ipHash);
    if (!fullGeneration.allowed) {
      return {
        allowed: false,
        error: PREVIEW_RATE_LIMIT_ERROR_CODE,
        sessionId: responseSessionId,
      };
    }
  }

  return { allowed: true };
}
