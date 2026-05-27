import { INITIAL_CHANGE_CREDITS } from "./credits";
import { loadPreviewSession, savePreviewSession } from "./store";
import type { PreviewSession } from "./types";

/**
 * Ops: in Upstash, open `preview:session:{sessionId}` and set:
 * `"supportAllowNextPreviewRound": true`
 *
 * On the user's next preview-related request for that session id, this grants:
 * - 3 change credits (`changeCreditsRemaining`)
 * - one bypass of the 24h full-preview (per-IP) limit
 * - 3 bypasses of the per-session technical generation rate limit
 *
 * The flag is cleared when applied. Legacy flags `supportAllowFullGeneration` /
 * `supportAllowGeneration` still work for one-off cases.
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
  if (from.supportAllowFullGeneration) {
    to.supportAllowFullGeneration = true;
  }
}

export async function tryConsumeSupportFullGenerationBypass(
  clientSessionId: string | undefined,
): Promise<boolean> {
  await applySupportNextPreviewRoundIfRequested(clientSessionId);
  if (!clientSessionId) {
    return false;
  }
  const session = await loadPreviewSession(clientSessionId);
  if (!session?.supportAllowFullGeneration) {
    return false;
  }
  session.supportAllowFullGeneration = false;
  await savePreviewSession(session);
  return true;
}

export async function tryConsumeSupportGenerationBypass(
  sessionId: string,
): Promise<boolean> {
  await applySupportNextPreviewRoundIfRequested(sessionId);
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
