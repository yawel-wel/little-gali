"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import { ArrowLeft, Loader2, X } from "lucide-react";
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

const THUMBNAIL_TILE_CLASS =
  "h-[62px] w-[62px] shrink-0 overflow-hidden rounded-xl border border-gray-200 sm:h-[70px] sm:w-[70px]";

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

function hasCandidateSessionIds(): boolean {
  const hiddenIds = new Set(getHiddenResumeSessionIds());
  return getKnownPreviewSessionIds().some((id) => !hiddenIds.has(id));
}

export function PreviousPreviewSessions({
  onVisibleChange,
}: {
  onVisibleChange?: (visible: boolean) => void;
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
          return null;
        case "ready_to_order":
          return t("upload.previousSessions.status.readyToOrder");
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
          <div className="space-y-4">
            {sessions.map((session) => {
              const isResuming = resumingId === session.id;
              const status = statusLabel(session.status);
              const createdAtLabel = formatRelativeCreatedAt(
                session.createdAt,
                locale,
                t,
              );
              const hiddenThumbnailCount = Math.max(
                0,
                session.thumbnailCount - session.thumbnailUrls.length,
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
                      {status && (
                        <p className="font-body text-sm text-medium-gray">{status}</p>
                      )}
                      <p
                        className={cn(
                          "font-body text-sm text-dark-gray",
                          status && "mt-1",
                        )}
                      >
                        {createdAtLabel}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex w-full overflow-x-auto overscroll-x-contain py-1",
                        isRtl ? "justify-end" : "justify-start",
                      )}
                      dir="ltr"
                    >
                      <div className="flex flex-nowrap items-center gap-2 px-1">
                        {hiddenThumbnailCount > 0 && (
                          <div
                            className={cn(
                              THUMBNAIL_TILE_CLASS,
                              "flex items-center justify-center bg-[#F3EEE8]",
                            )}
                          >
                            <span className="font-body-bold text-base text-dark-gray/70">
                              +{hiddenThumbnailCount}
                            </span>
                          </div>
                        )}
                        {session.thumbnailUrls.map((url, index) => (
                          <div key={`${session.id}-${index}`} className={THUMBNAIL_TILE_CLASS}>
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
                    </div>

                    <div className="flex flex-col items-stretch justify-center gap-2">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => void handleContinue(session)}
                        disabled={Boolean(resumingId)}
                        className="w-full cursor-pointer shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          px: 2.5,
                          py: 1,
                          boxShadow: "none",
                        }}
                      >
                        {isResuming ? (
                          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {session.status === "in_cart"
                              ? t("upload.previousSessions.goToCart")
                              : t("upload.previousSessions.continue")}
                            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </span>
                        )}
                      </Button>
                      {session.status === "in_cart" && (
                        <Button
                          variant="outlined"
                          onClick={() => void resumePreview(session.id)}
                          disabled={Boolean(resumingId)}
                          className="w-full cursor-pointer"
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            px: 2,
                            py: 0.75,
                          }}
                        >
                          {t("upload.previousSessions.viewPreview")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className={cn("font-body text-sm text-red-700", textAlignClass)}>{error}</p>
          )}

          <p className="text-center font-body text-sm text-medium-gray">
            {t("upload.previousSessions.orUploadNew")}
          </p>
        </>
      )}
    </div>
  );
}
