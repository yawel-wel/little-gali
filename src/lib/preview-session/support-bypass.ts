import { INITIAL_CHANGE_CREDITS } from "./credits";
import { getRequestIp, hashClientIp } from "./hash";
import { recordFullGenerationUse } from "./rate-limit";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewSession } from "./types";

/**
 * Ops: in Upstash, open `preview:session:{sessionId}` and set:
 * `"supportAllowNextPreviewRound": true`
 *
 * Activates once at the start of POST /api/preview-session (before rate checks).
 * Grants 3 change credits, one full-generation bypass, and 3 technical-limit bypasses.
 * The round flag is cleared on activation; full-generation bypass is consumed when
 * the pipeline actually starts and always records the per-IP quota.
 */
export async function applySupportNextPreviewRoundIfRequested(
  sessionId: string | undefined,
): Promise<void> {
  if (!sessionId) {
    return;
  }
  const session = await loadPreviewSession(sessionId);
  if (!session?.supportAllowNextPreviewRound) {
    return;
  }

  session.supportAllowNextPreviewRound = false;
  session.changeCreditsRemaining = INITIAL_CHANGE_CREDITS;
  session.supportAllowFullGeneration = true;
  session.supportGenerationBypassCallsRemaining = INITIAL_CHANGE_CREDITS;
  await savePreviewSession(session);
}

export function inheritSupportGrants(
  from: PreviewSession,
  to: PreviewSession,
): void {
  const remaining = from.supportGenerationBypassCallsRemaining ?? 0;
  if (remaining > 0) {
    to.supportGenerationBypassCallsRemaining = Math.max(
      to.supportGenerationBypassCallsRemaining ?? 0,
      remaining,
    );
  }
  // Do not copy supportAllowFullGeneration — one bypass per upload attempt only.
}

export async function tryConsumeSupportFullGenerationBypass(
  request: Request,
  clientSessionId: string | undefined,
): Promise<boolean> {
  if (!clientSessionId) {
    return false;
  }
  const session = await loadPreviewSession(clientSessionId);
  if (!session?.supportAllowFullGeneration) {
    return false;
  }
  session.supportAllowFullGeneration = false;
  await savePreviewSession(session);

  const ipHash = hashClientIp(getRequestIp(request));
  await recordFullGenerationUse(ipHash);

  return true;
}

export async function tryConsumeSupportGenerationBypass(
  sessionId: string,
): Promise<boolean> {
  const session = await loadPreviewSession(sessionId);
  if (!session) {
    return false;
  }

  const callsRemaining = session.supportGenerationBypassCallsRemaining ?? 0;
  if (callsRemaining > 0) {
    session.supportGenerationBypassCallsRemaining = callsRemaining - 1;
    await savePreviewSession(session);
    return true;
  }

  if (!session.supportAllowGeneration) {
    return false;
  }
  session.supportAllowGeneration = false;
  await savePreviewSession(session);
  return true;
}
