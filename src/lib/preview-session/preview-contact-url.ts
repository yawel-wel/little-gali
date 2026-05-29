/** Contact link with up to two preview session ids for support lookup. */
export function buildPreviewRateLimitContactHref(sessionIds: string[]): string {
  const ids = sessionIds.filter((id) => id.trim().length > 0).slice(0, 2);
  if (ids.length === 0) {
    return "/contact";
  }
  const params = new URLSearchParams();
  params.set("previewSessionId", ids[0]!);
  if (ids.length > 1) {
    params.set("secondaryPreviewSessionId", ids[1]!);
  }
  return `/contact?${params.toString()}`;
}

export function formatPreviewLimitResetTime(
  iso: string | null | undefined,
  locale: string,
): string | null {
  if (!iso) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}
