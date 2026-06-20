import { getPersistedLgSessionId } from "@/lib/session-id";

const LG_PREVIEW_SESSION_HISTORY_KEY = "lgPreviewSessionIds";
const MAX_HISTORY = 10;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Remember preview session ids from this browser (for support contact). */
export function recordPreviewSessionId(sessionId: string): void {
  if (typeof window === "undefined" || !isUuid(sessionId)) {
    return;
  }
  try {
    const raw = localStorage.getItem(LG_PREVIEW_SESSION_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const existing = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && isUuid(id))
      : [];
    const next = [sessionId, ...existing.filter((id) => id !== sessionId)].slice(
      0,
      MAX_HISTORY,
    );
    localStorage.setItem(LG_PREVIEW_SESSION_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}

const LG_HIDDEN_RESUME_SESSIONS_KEY = "lgHiddenResumeSessionIds";

/** Session ids the user dismissed from the upload resume cards. */
export function getHiddenResumeSessionIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(LG_HIDDEN_RESUME_SESSIONS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string" && isUuid(id));
  } catch {
    return [];
  }
}

export function hideResumeSessionId(sessionId: string): void {
  if (typeof window === "undefined" || !isUuid(sessionId)) {
    return;
  }
  try {
    const existing = getHiddenResumeSessionIds();
    if (existing.includes(sessionId)) {
      return;
    }
    localStorage.setItem(
      LG_HIDDEN_RESUME_SESSIONS_KEY,
      JSON.stringify([sessionId, ...existing]),
    );
  } catch {
    // ignore quota / private mode
  }
}

/** Distinct session ids known on this device (most recent first). */
export function getKnownPreviewSessionIds(): string[] {
  const ids: string[] = [];
  const current = getPersistedLgSessionId();
  if (current && isUuid(current)) {
    ids.push(current);
  }
  if (typeof window === "undefined") {
    return ids;
  }
  try {
    const raw = localStorage.getItem(LG_PREVIEW_SESSION_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(parsed)) {
      for (const id of parsed) {
        if (typeof id === "string" && isUuid(id) && !ids.includes(id)) {
          ids.push(id);
        }
      }
    }
  } catch {
    // ignore
  }
  return ids;
}
