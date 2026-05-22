const LG_SESSION_ID_KEY = "lgSessionId";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getOrCreateLgSessionId(): string {
  const existing = localStorage.getItem(LG_SESSION_ID_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = createSessionId();
  localStorage.setItem(LG_SESSION_ID_KEY, sessionId);
  return sessionId;
}

/** Keep in sync with preview session id returned from the server after POST /api/preview-session */
export function persistLgSessionId(id: string): void {
  try {
    localStorage.setItem(LG_SESSION_ID_KEY, id);
  } catch {
    // ignore quota / private mode
  }
}
