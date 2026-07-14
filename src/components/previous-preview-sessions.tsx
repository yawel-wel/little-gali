"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Loader2, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  getHiddenResumeSessionIds,
  getKnownPreviewSessionIds,
  hideResumeSessionId,
} from "@/lib/preview-session/preview-session-id-history";
import type {
  PreviewResumeStatus,
  PreviewSessionResumeSummary,
} from "@/lib/preview-session/resume-summary";
import { persistLgSessionId } from "@/lib/session-id";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

function formatRelativeCreatedAt(
  createdAt: string,
  locale: string,
  t: (key: string) => string,
): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale === "he" ? "he" : "en", {
    numeric: "always",
  });

  const minutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let relative: string;
  if (minutes < 1) {
    relative = rtf.format(0, "minute");
  } else if (minutes < 60) {
    relative = rtf.format(-minutes, "minute");
  } else if (hours < 24) {
    relative = rtf.format(-hours, "hour");
  } else if (days < 7) {
    relative = rtf.format(-days, "day");
  } else {
    const weeks = Math.floor(days / 7);
    relative = rtf.format(-weeks, "week");
  }

  return t("upload.previousSessions.createdRelative").replace("{relative}", relative);
}

export function hasCandidateSessionIds(): boolean {
  if (typeof window === "undefined") return false;
  const hiddenIds = new Set(getHiddenResumeSessionIds());
  return getKnownPreviewSessionIds().some((id) => !hiddenIds.has(id));
}

export function PreviousPreviewSessions({
  onVisibleChange,
  orContinueHint,
  compact = false,
}: {
  onVisibleChange?: (visible: boolean) => void;
  /** Override the “or upload below” hint when shown on the chooser. */
  orContinueHint?: string;
  /** Compact horizontal resume rows (chooser screen). */
  compact?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [sessions, setSessions] = useState<PreviewSessionResumeSummary[]>([]);
  const [hiddenSessionIds, setHiddenSessionIds] = useState<string[]>(() =>
    getHiddenResumeSessionIds(),
  );
  const [isLoading, setIsLoading] = useState(hasCandidateSessionIds);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = useCallback(
    (status: PreviewResumeStatus) => {
      switch (status) {
        case "generating":
          return t("upload.previousSessions.status.generating");
        case "review_bw":
          return t("upload.previousSessions.status.reviewBw");
        case "pick_style":
          return t("upload.previousSessions.status.pickStyle");
        case "ready_to_order":
          return t("upload.previousSessions.status.pickStyle");
        case "in_cart":
          return t("upload.previousSessions.status.inCart");
      }
    },
    [t],
  );

  useEffect(() => {
    onVisibleChange?.(isLoading || sessions.length > 0);
  }, [isLoading, onVisibleChange, sessions.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      const hiddenIds = new Set(getHiddenResumeSessionIds());
      const sessionIds = getKnownPreviewSessionIds().filter(
        (id) => !hiddenIds.has(id),
      );

      if (sessionIds.length === 0) {
        if (!cancelled) {
          setSessions([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/preview-session/resume-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionIds }),
        });
        const data = (await response.json()) as {
          sessions?: PreviewSessionResumeSummary[];
        };
        if (!cancelled) {
          const loaded = Array.isArray(data.sessions) ? data.sessions : [];
          setSessions(loaded.filter((session) => !hiddenIds.has(session.id)));
        }
      } catch {
        if (!cancelled) {
          setSessions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, [hiddenSessionIds]);

  const handleHideSession = (sessionId: string) => {
    hideResumeSessionId(sessionId);
    setHiddenSessionIds((current) =>
      current.includes(sessionId) ? current : [...current, sessionId],
    );
    setSessions((current) => current.filter((session) => session.id !== sessionId));
  };

  const resumePreview = async (sessionId: string) => {
    setResumingId(sessionId);
    setError(null);

    try {
      const response = await fetch(`/api/preview-session/${sessionId}/resume`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("resume_failed");
      }

      persistLgSessionId(sessionId);
      router.push(`/preview/${sessionId}`);
    } catch {
      setError(t("upload.previousSessions.resumeError"));
    } finally {
      setResumingId(null);
    }
  };

  const handleContinue = async (session: PreviewSessionResumeSummary) => {
    if (session.status === "in_cart") {
      router.push("/cart");
      return;
    }

    await resumePreview(session.id);
  };

  const isRtl = locale === "he";
  const textAlignClass = isRtl ? "text-right" : "text-left";

  if (!isLoading && sessions.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3" dir={isRtl ? "rtl" : "ltr"}>
        <p className="flex items-center justify-start gap-2 font-body-bold text-sm text-dark-gray">
          <Clock3 className="h-4 w-4 text-accent-burgundy" aria-hidden />
          {t("upload.previousSessions.sectionTitle")}
        </p>

        {isLoading ? (
          <div className="flex justify-start py-3">
            <Loader2 className="h-5 w-5 animate-spin text-medium-gray" />
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-2 sm:max-w-md">
            {sessions.map((session) => {
              const isResuming = resumingId === session.id;
              const status = statusLabel(session.status);
              const createdAtLabel = formatRelativeCreatedAt(
                session.createdAt,
                locale,
                t,
              );
              const thumb = session.thumbnailUrls[0];
              const flowLabel =
                session.bookFlow === "colorful"
                  ? t("upload.previousSessions.badge.colorful")
                  : t("upload.previousSessions.badge.classic");
              const meta = [status, createdAtLabel].filter(Boolean).join(" · ");

              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => void handleContinue(session)}
                    disabled={Boolean(resumingId)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-start disabled:opacity-60"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-[#F3EEE8]">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className={cn(
                            SENTRY_REPLAY_BLOCK_USER_IMAGE,
                            "h-full w-full object-cover",
                          )}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body-bold text-sm text-dark-gray">
                        {flowLabel}
                      </p>
                      <p className="truncate font-body text-xs text-medium-gray">
                        {meta}
                      </p>
                    </div>
                    {isResuming ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-burgundy" />
                    ) : (
                      <ArrowLeft
                        className="h-4 w-4 shrink-0 text-accent-burgundy"
                        aria-hidden
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHideSession(session.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-medium-gray transition-colors hover:bg-gray-100 hover:text-dark-gray"
                    aria-label={t("upload.previousSessions.dismissSession")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {error ? (
          <p className={cn("font-body text-sm text-red-700", textAlignClass)}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      <p className="text-center font-body-bold text-sm text-dark-gray">
        {t("upload.previousSessions.sectionTitle")}
      </p>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sessions.map((session) => {
              const isResuming = resumingId === session.id;
              const status = statusLabel(session.status);
              const createdAtLabel = formatRelativeCreatedAt(
                session.createdAt,
                locale,
                t,
              );

              return (
                <div
                  key={session.id}
                  className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
                >
                  <button
                    type="button"
                    onClick={() => handleHideSession(session.id)}
                    className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-medium-gray transition-colors hover:bg-gray-100 hover:text-dark-gray"
                    aria-label={t("upload.previousSessions.dismissSession")}
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="space-y-3">
                    <div className={cn("pe-8", textAlignClass)}>
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 font-body-bold text-[11px]",
                          session.bookFlow === "colorful"
                            ? "bg-[#F6D8DD] text-accent-burgundy"
                            : "bg-[#EAE6E1] text-dark-gray",
                        )}
                      >
                        {session.bookFlow === "colorful"
                          ? t("upload.previousSessions.badge.colorful")
                          : t("upload.previousSessions.badge.classic")}
                      </span>
                      {status && (
                        <p className="mt-2 font-body text-sm text-medium-gray">
                          {status}
                        </p>
                      )}
                      <p
                        className={cn(
                          "font-body text-sm text-dark-gray",
                          status ? "mt-1" : "mt-2",
                        )}
                      >
                        {createdAtLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.thumbnailUrls.map((url, index) => (
                        <div
                          key={`${session.id}-${index}`}
                          className="h-[62px] w-[62px] overflow-hidden rounded-xl border border-gray-200"
                        >
                          <img
                            src={url}
                            alt=""
                            className={cn(
                              SENTRY_REPLAY_BLOCK_USER_IMAGE,
                              "h-full w-full object-cover",
                            )}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleContinue(session)}
                      disabled={Boolean(resumingId)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-orange px-3 py-2.5 font-body-bold text-sm text-white disabled:opacity-50"
                    >
                      {isResuming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {session.status === "in_cart"
                            ? t("upload.previousSessions.goToCart")
                            : t("upload.previousSessions.continue")}
                          <ArrowLeft className="h-4 w-4" aria-hidden />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className={cn("font-body text-sm text-red-700", textAlignClass)}>
              {error}
            </p>
          )}

          {orContinueHint ? (
            <p className="text-center font-body text-sm text-medium-gray">
              {orContinueHint}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
