"use client";

import * as Sentry from "@sentry/nextjs";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { StyleSelector, type StyleType } from "@/components/style-selector";
import { MobileImageEditor } from "@/components/mobile-image-editor";
import { PreviewImageCropModal } from "@/components/preview-image-crop-modal";
import { PreviewBookColorPicker } from "@/components/preview-book-color-picker";
import { PreviewColorStyleStrip } from "@/components/preview-color-style-strip";
import { PreviewPhaseFooter } from "@/components/preview-phase-footer";
import { PreviewSlotAlternateVersions } from "@/components/preview-slot-alternate-versions";
import { PreviewSlotGenerationError } from "@/components/preview-slot-generation-error";
import { PreviewSlotProhibitedContent } from "@/components/preview-slot-prohibited-content";
import { PreviewSlotFadeImage } from "@/components/preview-slot-fade-image";
import { PreviewSlotRegenerateAction } from "@/components/preview-slot-regenerate-action";
import {
  PreviewBookLightbox,
  type PreviewBookLightboxSlide,
} from "@/components/preview-book-lightbox";
import { PreviewInitialLoadingScreen } from "@/components/preview-initial-loading-screen";
import {
  BOOK_SLOT_INDEX,
  DEFAULT_COLOR_STYLE,
  getColorCandidateForStyleFromPublicSlot,
} from "@/lib/preview-session/color-by-style";
import {
  COLORFUL_SLOT_COUNT,
  getSlotCount,
} from "@/lib/preview-session/book-flow";
import {
  displayPosition,
  sortSlotsByDisplayOrder,
} from "@/lib/preview-session/display-order";
import type { BookColor } from "@/lib/book-color";
import { useLanguage } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import {
  isAllowedUploadImageType,
  UPLOAD_IMAGE_ACCEPT,
} from "@/lib/allowed-image-types";
import { compressImage, prepareImageForCrop, cn } from "@/lib/utils";
import { logPreviewColorStyleSelected } from "@/lib/preview-session/generation-log";
import { buildPreviewGenerationStats } from "@/lib/preview-session/generation-stats";
import { INITIAL_CHANGE_CREDITS } from "@/lib/preview-session/credits";
import {
  GenerationRateLimitError,
  getGenerationRateLimitMessage,
  isGenerationRateLimitErrorNode,
  throwIfGenerationRateLimited,
} from "@/lib/preview-session/handle-generation-response";
import {
  getSelectableBwVersionCandidates,
  getSelectableColorVersionCandidates,
} from "@/lib/preview-session/preview-version-selection";
import type { PreviewSessionPublicView } from "@/lib/preview-session/types";
import type { Area } from "react-easy-crop";
import Button from "@mui/material/Button";
import { Expand, Loader2, MoreHorizontal, X } from "lucide-react";
import { track, ANALYTICS_EVENTS, registerPreviewSessionSuperProperties, withAnalyticsHeaders } from "@/lib/analytics";

type PreviewBookSide = "bw" | "color";
type CompareOutputImage = {
  id: string;
  url: string;
  alt: string;
  aspectRatio?: number;
};
type CompareImageModal = {
  originalUrl: string;
  originalAlt: string;
  outputs: CompareOutputImage[];
  activeOutputId: string;
};
type CropTarget = {
  candidateId: string;
  bookSide: PreviewBookSide;
  imageUrl: string;
};
const PREVIEW_LOADING_IMAGES_STORAGE_PREFIX = "little-gali-preview-loading-images";
const COLOR_STRIP_PREFETCH_STORAGE_PREFIX = "lg-color-strip-prefetch";

function colorStripPrefetchStorageKey(sessionId: string): string {
  return `${COLOR_STRIP_PREFETCH_STORAGE_PREFIX}:${sessionId}`;
}

function hasColorStripPrefetchCompleted(sessionId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    sessionStorage.getItem(colorStripPrefetchStorageKey(sessionId)) === "1"
  );
}

function markColorStripPrefetchCompleted(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(colorStripPrefetchStorageKey(sessionId), "1");
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sessionUpdatedAtMs(session: PreviewSessionPublicView): number {
  const ms = Date.parse(session.updatedAt);
  return Number.isNaN(ms) ? 0 : ms;
}

/** Skip polled GET snapshots older than the last mutation we applied (KV read-after-write lag). */
function isStalePolledSession(
  incoming: PreviewSessionPublicView,
  lastAppliedMs: number,
): boolean {
  if (lastAppliedMs <= 0) {
    return false;
  }
  const incomingMs = sessionUpdatedAtMs(incoming);
  return incomingMs > 0 && incomingMs < lastAppliedMs;
}

function clearFailedPreviewUrlsForSlot(
  urls: Set<string>,
  slot: PreviewSessionPublicView["slots"][number] | undefined,
): Set<string> {
  if (!slot) {
    return urls;
  }
  const next = new Set(urls);
  for (const candidate of slot.candidates) {
    if (candidate.previewUrl) {
      next.delete(candidate.previewUrl);
    }
  }
  for (const candidate of slot.colorCandidates ?? []) {
    if (candidate.previewUrl) {
      next.delete(candidate.previewUrl);
    }
  }
  return next;
}

function getColorVersionsForStyle(
  slot: PreviewSessionPublicView["slots"][number],
  style: StyleType,
): PreviewSessionPublicView["slots"][number]["candidates"] {
  return (slot.colorCandidates ?? []).filter(
    (candidate) =>
      candidate.kind === "color" && (candidate.style ?? "pencil") === style,
  );
}

function allSlotsHaveColorForStylePublic(
  session: PreviewSessionPublicView,
  style: StyleType,
): boolean {
  return session.slots.every((slot) =>
    slotHasColorPreviewForStylePublic(slot, style),
  );
}

function slotHasColorForStylePublic(
  slot: PreviewSessionPublicView["slots"][number],
  style: StyleType,
): boolean {
  const candidate = getColorCandidateForStyleFromPublicSlot(slot, style);
  return Boolean(candidate?.previewUrl || candidate?.error);
}

function slotHasColorPreviewForStylePublic(
  slot: PreviewSessionPublicView["slots"][number],
  style: StyleType,
): boolean {
  return Boolean(
    getColorCandidateForStyleFromPublicSlot(slot, style)?.previewUrl,
  );
}

function frozenStripThumbnailsReady(
  session: PreviewSessionPublicView | null,
): boolean {
  const frozen = session?.frozenStyleStripThumbnails;
  return Boolean(
    frozen?.pencil?.previewUrl && frozen?.watercolor?.previewUrl,
  );
}

function slotBwHasProhibitedContent(
  slot: PreviewSessionPublicView["slots"][number],
): boolean {
  const active = slot.candidates.find(
    (candidate) => candidate.id === slot.activeCandidateId,
  );
  return active?.error?.code === "prohibited_content";
}

function canReplacePreviewSlot(
  session: PreviewSessionPublicView | null,
  slotIndex: number,
  colorStyle?: StyleType,
): boolean {
  if (!session) {
    return false;
  }
  const slot = session.slots.find((item) => item.index === slotIndex);
  if (!slot) {
    return false;
  }
  if (slotBwHasProhibitedContent(slot)) {
    return true;
  }
  if (colorStyle) {
    const activeColor = getColorCandidateForStyleFromPublicSlot(slot, colorStyle);
    if (activeColor?.error?.code === "prohibited_content") {
      return true;
    }
  }
  return session.canReplace;
}

function stripThumbnailsReady(
  session: PreviewSessionPublicView | null,
  bookSlot: PreviewSessionPublicView["slots"][number] | undefined,
): boolean {
  if (frozenStripThumbnailsReady(session)) {
    return true;
  }
  if (!bookSlot) {
    return true;
  }
  return (
    slotHasColorPreviewForStylePublic(bookSlot, "pencil") &&
    slotHasColorPreviewForStylePublic(bookSlot, "watercolor")
  );
}

function isPreviewColorPhase(session: PreviewSessionPublicView): boolean {
  return (
    session.phase === "bw_approved" ||
    session.phase === "style_selected" ||
    session.phase === "cart_added"
  );
}

function isColorfulPreviewSession(
  session: PreviewSessionPublicView | null | undefined,
): boolean {
  return session?.bookFlow === "colorful";
}

/** Map legacy `colorful` style (and anything else unexpected) to a real preview style. */
function resolvePreviewColorStyle(
  style: StyleType | undefined | null,
): StyleType {
  if (style === "pencil" || style === "cartoon" || style === "watercolor") {
    return style;
  }
  return DEFAULT_COLOR_STYLE;
}

function translateOrFallback(
  t: (key: string) => string,
  key: string,
  fallbackKey: string,
): string {
  const value = t(key);
  return value === key ? t(fallbackKey) : value;
}

function slotHasUsableColorPreview(
  slot: PreviewSessionPublicView["slots"][number],
  style: StyleType,
): boolean {
  const resolvedStyle = resolvePreviewColorStyle(style);
  const candidate =
    getColorCandidateForStyleFromPublicSlot(slot, resolvedStyle) ??
    slot.colorPreview;
  return Boolean(candidate?.previewUrl || candidate?.error);
}

function sessionHasUsableBwPreview(
  session: PreviewSessionPublicView,
): boolean {
  return session.slots.every((slot) =>
    slot.candidates.some((candidate) => candidate.previewUrl || candidate.error),
  );
}

function shouldRecoverFromInitializationError(
  session: PreviewSessionPublicView,
): boolean {
  if (!isPreviewColorPhase(session)) {
    return false;
  }
  if (isColorfulPreviewSession(session)) {
    const style = resolvePreviewColorStyle(session.selectedColorStyle);
    return session.slots.every((slot) =>
      slotHasUsableColorPreview(slot, style),
    );
  }
  return sessionHasUsableBwPreview(session);
}

function PreviewSlotLightboxActivator({
  lightboxEnabled,
  onOpenLightbox,
  className,
  style,
  children,
}: {
  /** When false, renders a div so nested controls (e.g. upload) stay clickable. */
  lightboxEnabled: boolean;
  onOpenLightbox: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (!lightboxEnabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenLightbox}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

export default function PreviewPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { addToCart } = useCart();
  const [localInitialPhotoUrls] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = sessionStorage.getItem(
        `${PREVIEW_LOADING_IMAGES_STORAGE_PREFIX}:${sessionId}`,
      );
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((url): url is string => typeof url === "string" && !!url)
        : [];
    } catch {
      return [];
    }
  });
  const [session, setSession] = useState<PreviewSessionPublicView | null>(null);
  const [bookSide, setBookSide] = useState<PreviewBookSide>("bw");
  const [displayedBookSide, setDisplayedBookSide] =
    useState<PreviewBookSide>("bw");
  const [isTabCardsVisible, setIsTabCardsVisible] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(DEFAULT_COLOR_STYLE);
  const [activeColorStyle, setActiveColorStyle] = useState<StyleType>(DEFAULT_COLOR_STYLE);
  const [selectedBookColor, setSelectedBookColor] =
    useState<BookColor | null>(null);
  const [bookColorError, setBookColorError] = useState(false);
  const [styleStripLoading, setStyleStripLoading] = useState<Set<StyleType>>(
    () => new Set(),
  );
  const [isColorStripPrefetching, setIsColorStripPrefetching] = useState(false);
  const [slotsPendingColorRegen, setSlotsPendingColorRegen] = useState<Set<number>>(
    () => new Set(),
  );
  const stripThumbPrefetchRunningRef = useRef(false);
  const pendingColorRegenProcessingRef = useRef(false);
  const mutationInProgressRef = useRef(false);
  const [error, setError] = useState<ReactNode | null>(null);

  const setGenerationError = useCallback(
    (err: unknown, fallback = t("preview.sessionError")) => {
      if (err instanceof GenerationRateLimitError) {
        track(ANALYTICS_EVENTS.BOOKLET_LIMIT_REACHED, {
          limit_type: "generation_rate_limit",
        });
        setError(getGenerationRateLimitMessage(t));
        return;
      }
      setError(err instanceof Error ? err.message : fallback);
    },
    [t],
  );
  const bwPreviewTrackedRef = useRef(false);
  const colorPreviewTrackedRef = useRef(false);
  const changesExhaustedTrackedRef = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [failureDetail, setFailureDetail] = useState("");
  const [failureStatus, setFailureStatus] = useState<number | undefined>();
  const failureReportedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busySlotIndexes, setBusySlotIndexes] = useState<Set<number>>(
    () => new Set(),
  );
  const [failedPreviewUrls, setFailedPreviewUrls] = useState<Set<string>>(
    () => new Set(),
  );
  const [bookLightboxOpen, setBookLightboxOpen] = useState(false);
  const [bookLightboxIndex, setBookLightboxIndex] = useState(0);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [keepInitialLoadingVisible, setKeepInitialLoadingVisible] =
    useState(false);
  const [keepColorLoadingVisible, setKeepColorLoadingVisible] =
    useState(false);
  const [openSlotActionsIndex, setOpenSlotActionsIndex] = useState<number | null>(
    null,
  );
  const [showActionsPulse, setShowActionsPulse] = useState(false);
  const [compareImageModal, setCompareImageModal] =
    useState<CompareImageModal | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceSlotRef = useRef<number | null>(null);
  const replaceSourceUrlRef = useRef<string | null>(null);
  const [replaceCropImageUrl, setReplaceCropImageUrl] = useState<string | null>(
    null,
  );
  const [replaceSmartCropLoading, setReplaceSmartCropLoading] = useState(false);
  const [replaceSmartCropArea, setReplaceSmartCropArea] = useState<
    Area | undefined
  >(undefined);
  const [replaceEditorFaceBoxes, setReplaceEditorFaceBoxes] = useState<Area[]>(
    [],
  );
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [cropSaving, setCropSaving] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAppliedUpdatedAtRef = useRef(0);

  const applySession = useCallback((next: PreviewSessionPublicView) => {
    const ms = sessionUpdatedAtMs(next);
    if (ms > 0) {
      lastAppliedUpdatedAtRef.current = Math.max(
        lastAppliedUpdatedAtRef.current,
        ms,
      );
    }
    setSession(next);
  }, []);

  const bwLoadingLines = useMemo(
    () => [
      t("preview.bwLoadingLine1"),
      t("preview.bwLoadingLine2"),
      t("preview.bwLoadingLine3"),
      t("preview.bwLoadingLine4"),
      t("preview.bwLoadingLine5"),
    ],
    [t],
  );

  const colorLoadingLines = useMemo(
    () => [
      t("preview.colorLoadingLine1"),
      t("preview.colorLoadingLine2"),
      t("preview.colorLoadingLine3"),
      t("preview.colorLoadingLine4"),
      t("preview.colorLoadingLine5"),
    ],
    [t],
  );

  const colorfulLoadingLines = useMemo(() => {
    const lines = [
      translateOrFallback(
        t,
        "preview.colorfulLoadingLine1",
        "preview.colorLoadingLine1",
      ),
      translateOrFallback(
        t,
        "preview.colorfulLoadingLine2",
        "preview.colorLoadingLine2",
      ),
      translateOrFallback(
        t,
        "preview.colorfulLoadingLine3",
        "preview.colorLoadingLine3",
      ),
      translateOrFallback(
        t,
        "preview.colorfulLoadingLine4",
        "preview.colorLoadingLine4",
      ),
    ];
    return lines;
  }, [t]);

  const isColorfulFlow =
    isColorfulPreviewSession(session) ||
    (!session && localInitialPhotoUrls.length === COLORFUL_SLOT_COUNT);
  const displayColorStyle = resolvePreviewColorStyle(activeColorStyle);

  const markLoadFailure = useCallback(
    (detail: string, status?: number) => {
      setLoadFailed(true);
      setFailureDetail(detail);
      setFailureStatus(status);
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    const response = await fetch(
      `/api/preview-session/${sessionId}`,
      withAnalyticsHeaders(),
    );
    if (!response.ok) {
      if (response.status === 403) {
        throw Object.assign(new Error(t("preview.sessionUnauthorized")), {
          status: response.status,
        });
      }
      if (response.status === 404) {
        throw Object.assign(new Error(t("preview.sessionNotFound")), {
          status: response.status,
        });
      }
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw Object.assign(
        new Error(data?.error || t("preview.sessionError")),
        { status: response.status },
      );
    }
    const data = (await response.json()) as { session: PreviewSessionPublicView };
    if (data.session.initializationError) {
      applySession(data.session);
      if (shouldRecoverFromInitializationError(data.session)) {
        Sentry.logger.error("preview.load.initialization_error_partial", {
          sessionId,
          detail: data.session.initializationError,
          phase: data.session.phase,
          generationStatus: data.session.generationStatus,
        });
        setLoadFailed(false);
        setFailureDetail("");
        setFailureStatus(undefined);
        return data.session;
      }
      Sentry.logger.error("preview.load.initialization_error", {
        sessionId,
        detail: data.session.initializationError,
        phase: data.session.phase,
        generationStatus: data.session.generationStatus,
      });
      markLoadFailure(data.session.initializationError);
      return data.session;
    }
    if (isStalePolledSession(data.session, lastAppliedUpdatedAtRef.current)) {
      return data.session;
    }
    if (mutationInProgressRef.current) {
      return data.session;
    }
    setLoadFailed(false);
    setFailureDetail("");
    setFailureStatus(undefined);
    applySession(data.session);
    return data.session;
  }, [applySession, markLoadFailure, sessionId, t]);

  useEffect(() => {
    registerPreviewSessionSuperProperties(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (
      session?.changeCreditsRemaining !== 0 ||
      changesExhaustedTrackedRef.current
    ) {
      return;
    }
    changesExhaustedTrackedRef.current = true;
    track(ANALYTICS_EVENTS.BOOKLET_CHANGES_EXHAUSTED, {
      changes_used: INITIAL_CHANGE_CREDITS,
    });
  }, [session?.changeCreditsRemaining]);

  useEffect(() => {
    if (!session?.selectedColorStyle) {
      return;
    }
    const resolved = resolvePreviewColorStyle(session.selectedColorStyle);
    setSelectedStyle(resolved);
    setActiveColorStyle(resolved);
  }, [session?.selectedColorStyle]);

  useEffect(() => {
    if (!session || !isColorfulPreviewSession(session)) {
      return;
    }
    setBookSide("color");
    setDisplayedBookSide("color");
    const resolved = resolvePreviewColorStyle(session.selectedColorStyle);
    setActiveColorStyle(resolved);
    setSelectedStyle(resolved);
  }, [session?.bookFlow, session?.selectedColorStyle]);

  useEffect(() => {
    refreshSession().catch((err: Error & { status?: number }) => {
      Sentry.setUser({ id: sessionId });
      Sentry.setTag("sessionId", sessionId);
      Sentry.captureException(err, {
        tags: { sessionId, event: "preview_load_failed" },
        extra: { sessionId },
      });
      Sentry.metrics.count("preview_load_failed", 1, {
        attributes: { sessionId },
      });
      markLoadFailure(err.message, err.status);
    });
  }, [markLoadFailure, refreshSession, sessionId]);

  useEffect(() => {
    if (!loadFailed || failureReportedRef.current) return;
    failureReportedRef.current = true;

    void fetch(
      "/api/preview-session/report-failure",
      withAnalyticsHeaders({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          detail: failureDetail,
          status: failureStatus,
        }),
      }),
    ).catch((reportError) => {
      console.error("Failed to report preview failure:", reportError);
    });
  }, [failureDetail, failureStatus, loadFailed, sessionId]);

  useEffect(() => {
    const pulseSeenKey = "little-gali-preview-actions-pulse-seen";
    if (localStorage.getItem(pulseSeenKey)) {
      return;
    }

    localStorage.setItem(pulseSeenKey, "1");
    setShowActionsPulse(true);
    const timeout = setTimeout(() => setShowActionsPulse(false), 2800);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (openSlotActionsIndex === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-preview-actions-menu]")
      ) {
        return;
      }

      setOpenSlotActionsIndex(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openSlotActionsIndex]);

  useEffect(() => {
    const shouldPoll =
      session?.generationStatus === "running" ||
      session?.slots.some((slot) => slot.inFlight || slot.colorInFlight);
    if (!shouldPoll) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    if (!pollRef.current) {
      pollRef.current = setInterval(() => {
        if (pendingColorRegenProcessingRef.current) {
          return;
        }
        refreshSession().catch(() => undefined);
      }, 2500);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [session, refreshSession]);

  const isInitialLoading =
    !loadFailed &&
    (!session ||
      session.slots.some((slot) => {
        if (isColorfulPreviewSession(session)) {
          return !slotHasUsableColorPreview(
            slot,
            resolvePreviewColorStyle(session.selectedColorStyle),
          );
        }
        return !slot.candidates.some(
          (candidate) => candidate.previewUrl || candidate.error,
        );
      }));

  useEffect(() => {
    if (isInitialLoading) {
      setKeepInitialLoadingVisible(true);
      return;
    }

    if (!keepInitialLoadingVisible) {
      return;
    }

    const timeout = setTimeout(() => setKeepInitialLoadingVisible(false), 400);
    return () => clearTimeout(timeout);
  }, [isInitialLoading, keepInitialLoadingVisible]);

  const showInitialLoadingScreen =
    isInitialLoading || keepInitialLoadingVisible;
  const isInitialLoadingExiting =
    !isInitialLoading && keepInitialLoadingVisible;

  const isActiveStyleStripLoading = styleStripLoading.has(
    resolvePreviewColorStyle(activeColorStyle),
  );

  const isColorGenerating =
    !loadFailed &&
    session !== null &&
    (session.phase === "bw_approved" || session.phase === "style_selected") &&
    (session.generationStatus === "running" || isActiveStyleStripLoading);

  useEffect(() => {
    if (isColorGenerating) {
      setKeepColorLoadingVisible(true);
      return;
    }
    if (!keepColorLoadingVisible) {
      return;
    }
    const timeout = setTimeout(() => {
      setKeepColorLoadingVisible(false);
      setBookSide("color");
      setDisplayedBookSide("color");
    }, 400);
    return () => clearTimeout(timeout);
  }, [isColorGenerating, keepColorLoadingVisible]);

  const showColorLoadingScreen =
    !showInitialLoadingScreen && (isColorGenerating || keepColorLoadingVisible);
  const isColorLoadingExiting = !isColorGenerating && keepColorLoadingVisible;

  const isLoadingScreenActive =
    showInitialLoadingScreen || showColorLoadingScreen;
  const activeLoadingLines = showColorLoadingScreen
    ? isColorfulFlow
      ? colorfulLoadingLines
      : colorLoadingLines
    : isColorfulFlow
      ? colorfulLoadingLines
      : bwLoadingLines;
  const activeLoadingLineCount = activeLoadingLines.length;

  const wasInitialLoadingScreenRef = useRef(false);
  const wasColorLoadingScreenRef = useRef(false);

  useEffect(() => {
    if (showInitialLoadingScreen && !wasInitialLoadingScreenRef.current) {
      setLoadingLineIndex(0);
    }
    wasInitialLoadingScreenRef.current = showInitialLoadingScreen;
  }, [showInitialLoadingScreen]);

  useEffect(() => {
    if (showColorLoadingScreen && !wasColorLoadingScreenRef.current) {
      setLoadingLineIndex(0);
    }
    wasColorLoadingScreenRef.current = showColorLoadingScreen;
  }, [showColorLoadingScreen]);

  useEffect(() => {
    if (!isLoadingScreenActive || activeLoadingLineCount === 0) {
      return;
    }
    const interval = setInterval(() => {
      setLoadingLineIndex((current) => (current + 1) % activeLoadingLineCount);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeLoadingLineCount, isLoadingScreenActive]);

  const isColorPhase =
    session !== null &&
    (session.phase === "bw_approved" ||
      session.phase === "style_selected" ||
      session.phase === "cart_added");

  const canAddToCart = Boolean(
    session &&
      session.phase !== "cart_added" &&
      !session.slots.some((slot) => slot.colorInFlight) &&
      (isColorfulFlow
        ? allSlotsHaveColorForStylePublic(session, displayColorStyle)
        : session.canAddToCart),
  );

  useEffect(() => {
    if (!showInitialLoadingScreen && session && !bwPreviewTrackedRef.current) {
      bwPreviewTrackedRef.current = true;
      track(ANALYTICS_EVENTS.BOOKLET_BW_PREVIEW_VIEWED);
    }
  }, [showInitialLoadingScreen, session]);

  useEffect(() => {
    if (
      displayedBookSide === "color" &&
      session &&
      isColorPhase &&
      !colorPreviewTrackedRef.current
    ) {
      colorPreviewTrackedRef.current = true;
      track(ANALYTICS_EVENTS.BOOKLET_COLOR_PREVIEW_VIEWED);
    }
  }, [displayedBookSide, isColorPhase, session]);

  const sessionInitialPhotoUrls =
    session?.slots
      ? sortSlotsByDisplayOrder(session.slots, session.displayOrder)
          .map((slot) => slot.originalUrl)
          .filter((url): url is string => Boolean(url))
          .slice(0, getSlotCount(session.bookFlow))
      : [];
  const initialLoadingPhotoUrls =
    sessionInitialPhotoUrls.length > 0
      ? sessionInitialPhotoUrls
      : localInitialPhotoUrls.slice(0, COLORFUL_SLOT_COUNT);

  const orderedIllustrationSlots = session?.slots
    ? sortSlotsByDisplayOrder(session.slots, session.displayOrder)
    : [];
  const illustrationSlotRows = isColorfulFlow
    ? [
        orderedIllustrationSlots.slice(0, 5),
        orderedIllustrationSlots.slice(5),
      ].filter((row) => row.length > 0)
    : [orderedIllustrationSlots];

  useEffect(() => {
    if (showInitialLoadingScreen || localInitialPhotoUrls.length === 0) {
      return;
    }

    sessionStorage.removeItem(
      `${PREVIEW_LOADING_IMAGES_STORAGE_PREFIX}:${sessionId}`,
    );
  }, [localInitialPhotoUrls.length, sessionId, showInitialLoadingScreen]);

  const bookSlotForColor = session?.slots.find(
    (slot) => slot.index === BOOK_SLOT_INDEX,
  );
  const stripThumbnailsAreReady = stripThumbnailsReady(session, bookSlotForColor);

  const isAwaitingStripAssetsOnColorSide = (side: PreviewBookSide) =>
    side === "color" &&
    !isColorfulFlow &&
    Boolean(session) &&
    !stripThumbnailsAreReady &&
    (isColorStripPrefetching || Boolean(bookSlotForColor?.colorInFlight));

  const isInitialColorPipelineRunning =
    session?.generationStatus === "running";

  const isDisplayedColorSideLoading =
    displayedBookSide === "color" &&
    Boolean(session) &&
    (isInitialColorPipelineRunning || isAwaitingStripAssetsOnColorSide("color"));

  const styleStripLoadingSet = useMemo(() => {
    const loading = new Set(styleStripLoading);
    if (!session) {
      return loading;
    }
    const bookSlot = session.slots.find((slot) => slot.index === BOOK_SLOT_INDEX);
    if (
      bookSlot &&
      !slotHasColorPreviewForStylePublic(bookSlot, DEFAULT_COLOR_STYLE) &&
      (session.generationStatus === "running" || bookSlot.colorInFlight)
    ) {
      loading.add(DEFAULT_COLOR_STYLE);
    }
    return loading;
  }, [session, styleStripLoading]);

  const bookLightboxSlides = useMemo<PreviewBookLightboxSlide[]>(() => {
    if (!session) {
      return [];
    }

    return sortSlotsByDisplayOrder(session.slots, session.displayOrder).flatMap(
      (slot) => {
        const active = slot.candidates.find(
          (candidate) => candidate.id === slot.activeCandidateId,
        );
        const colorCandidate =
          displayedBookSide === "color"
            ? getColorCandidateForStyleFromPublicSlot(slot, displayColorStyle)
            : undefined;
        const imageUrl =
          displayedBookSide === "bw"
            ? active?.previewUrl
            : colorCandidate?.previewUrl;
        const page = displayPosition(slot.index, session.displayOrder);

        if (!imageUrl) {
          return [];
        }

        return [
          {
            pageNumber: page,
            imageUrl,
            alt:
              displayedBookSide === "bw"
                ? `${t("preview.tabBw")} ${page}`
                : `${t("preview.tabColor")} ${page}`,
          },
        ];
      },
    );
  }, [displayColorStyle, displayedBookSide, session, t]);

  useEffect(() => {
    setBookLightboxOpen(false);
  }, [bookSide]);

  useEffect(() => {
    return () => {
      if (tabFadeTimeoutRef.current) {
        clearTimeout(tabFadeTimeoutRef.current);
      }
    };
  }, []);


  const fetchColorStylePreview = useCallback(
    async (style: StyleType, slotIndexes: number[]) => {
      const response = await fetch(
        `/api/preview-session/${sessionId}/generate-color`,
        withAnalyticsHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style, slotIndexes }),
        }),
      );
      const data = (await response.json()) as {
        session?: PreviewSessionPublicView;
        error?: string;
      };
      if (!response.ok) {
        throwIfGenerationRateLimited(response, data);
        throw new Error(data.error || t("preview.sessionError"));
      }
      applySession(data.session as PreviewSessionPublicView);
      return data.session as PreviewSessionPublicView;
    },
    [applySession, sessionId, t],
  );

  const fetchSlotAllStylesColor = useCallback(
    async (slotIndex: number) => {
      const response = await fetch(
        `/api/preview-session/${sessionId}/generate-color`,
        withAnalyticsHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotIndexes: [slotIndex],
            allStylesForSlot: true,
          }),
        }),
      );
      const data = (await response.json()) as {
        session?: PreviewSessionPublicView;
        error?: string;
      };
      if (!response.ok) {
        throwIfGenerationRateLimited(response, data);
        throw new Error(data.error || t("preview.sessionError"));
      }
      applySession(data.session as PreviewSessionPublicView);
      setSlotsPendingColorRegen((current) => {
        const next = new Set(current);
        next.delete(slotIndex);
        return next;
      });
      return data.session as PreviewSessionPublicView;
    },
    [applySession, sessionId, t],
  );

  const processPendingColorRegenSlots = useCallback(
    async (targetSession: PreviewSessionPublicView) => {
      const pending = targetSession.pendingColorRegenSlotIndexes ?? [];
      if (pending.length === 0 || pendingColorRegenProcessingRef.current) {
        return;
      }

      pendingColorRegenProcessingRef.current = true;
      setSlotsPendingColorRegen((current) => {
        const next = new Set(current);
        for (const slotIndex of pending) {
          next.add(slotIndex);
        }
        return next;
      });
      setError(null);

      try {
        for (const slotIndex of pending) {
          await fetchSlotAllStylesColor(slotIndex);
        }
      } catch (err) {
        setGenerationError(err);
      } finally {
        pendingColorRegenProcessingRef.current = false;
      }
    },
    [fetchSlotAllStylesColor, setGenerationError],
  );

  useEffect(() => {
    if (bookSide === "color" && session) {
      void processPendingColorRegenSlots(session);
    }
  }, [bookSide, session, processPendingColorRegenSlots]);

  useEffect(() => {
    if (stripThumbnailsAreReady) {
      setIsColorStripPrefetching(false);
    }
  }, [stripThumbnailsAreReady]);

  const prefetchStripThumbnailsIfNeeded = useCallback(async () => {
    if (!session) {
      return;
    }

    if (frozenStripThumbnailsReady(session)) {
      markColorStripPrefetchCompleted(sessionId);
      return;
    }

    const bookSlot = session.slots.find((slot) => slot.index === BOOK_SLOT_INDEX);
    if (!bookSlot) {
      return;
    }

    if (stripThumbnailsReady(session, bookSlot)) {
      markColorStripPrefetchCompleted(sessionId);
      return;
    }

    if (
      hasColorStripPrefetchCompleted(sessionId) ||
      stripThumbPrefetchRunningRef.current
    ) {
      return;
    }

    const stylesToPrefetch = (["pencil"] as const).filter(
      (style) => !slotHasColorPreviewForStylePublic(bookSlot, style),
    );

    if (stylesToPrefetch.length === 0) {
      markColorStripPrefetchCompleted(sessionId);
      return;
    }

    setIsColorStripPrefetching(true);
    stripThumbPrefetchRunningRef.current = true;
    try {
      await Promise.all(
        stylesToPrefetch.map((style) =>
          fetchColorStylePreview(style, [BOOK_SLOT_INDEX]).catch(() => undefined),
        ),
      );
    } finally {
      stripThumbPrefetchRunningRef.current = false;
      setIsColorStripPrefetching(false);
      markColorStripPrefetchCompleted(sessionId);
    }
  }, [fetchColorStylePreview, session, sessionId]);

  const handleSelectColorStyle = useCallback(
    (style: StyleType) => {
      if (!session || style === activeColorStyle) {
        return;
      }

      const previousStyle = activeColorStyle;
      const allSlotsCached = allSlotsHaveColorForStylePublic(session, style);
      logPreviewColorStyleSelected({
        sessionId,
        style,
        previousStyle,
        allSlotsCached,
      });
      track(ANALYTICS_EVENTS.BOOKLET_STYLE_SELECTED, { style_name: style });

      setSelectedStyle(style);
      setActiveColorStyle(style);
      setError(null);

      if (!allSlotsCached) {
        const missingSlotIndexes = session.slots
          .map((slot) => slot.index)
          .filter((slotIndex) => {
            const slot = session.slots.find((item) => item.index === slotIndex);
            if (!slot) return true;
            return !getColorCandidateForStyleFromPublicSlot(slot, style)
              ?.previewUrl;
          });

        setStyleStripLoading((current) => {
          const next = new Set(current);
          next.add(style);
          return next;
        });
        fetchColorStylePreview(
          style,
          missingSlotIndexes.length > 0
            ? missingSlotIndexes
            : session.slots.map((slot) => slot.index),
        )
          .catch((err) => setGenerationError(err))
          .finally(() => {
            setStyleStripLoading((current) => {
              const next = new Set(current);
              next.delete(style);
              return next;
            });
          });
      }
    },
    [activeColorStyle, fetchColorStylePreview, session, sessionId, setGenerationError],
  );

  const getColorStyleLabel = useCallback(
    (style: StyleType) => {
      if (style === "pencil") {
        return t("styleSelector.pencil");
      }
      if (style === "cartoon") {
        return t("styleSelector.cartoon");
      }
      return t("styleSelector.watercolor");
    },
    [t],
  );

  const getPreviewColorTabStyleLabel = getColorStyleLabel;

  useEffect(() => {
    if (bookLightboxOpen && bookLightboxSlides.length === 0) {
      setBookLightboxOpen(false);
    }
  }, [bookLightboxOpen, bookLightboxSlides.length]);

  const handleContinueWithoutPreview = () => {
    router.push("/upload?withoutPreview=1");
  };

  const markSlotBusy = (slotIndex: number) => {
    setBusySlotIndexes((current) => new Set(current).add(slotIndex));
  };

  const clearSlotBusy = (slotIndex: number) => {
    setBusySlotIndexes((current) => {
      const next = new Set(current);
      next.delete(slotIndex);
      return next;
    });
  };

  const runBwRegenerate = async (slotIndex: number, freeRetry: boolean) => {
    if (!freeRetry && !session?.canRegenerate) return;
    if (!freeRetry) {
      track(ANALYTICS_EVENTS.BOOKLET_REGENERATED);
    }
    markSlotBusy(slotIndex);
    mutationInProgressRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/preview-session/${sessionId}/regenerate`,
        withAnalyticsHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotIndex,
            idempotencyKey: createIdempotencyKey(),
            ...(freeRetry ? { freeRetry: true } : {}),
          }),
        }),
      );
      const data = (await response.json()) as {
        session?: PreviewSessionPublicView;
        error?: string;
      };
      if (!response.ok) {
        throwIfGenerationRateLimited(response, data);
        throw new Error(data.error || t("preview.sessionError"));
      }
      const updatedSession = data.session as PreviewSessionPublicView;
      applySession(updatedSession);
      setFailedPreviewUrls((current) =>
        clearFailedPreviewUrlsForSlot(
          current,
          updatedSession.slots.find((item) => item.index === slotIndex),
        ),
      );
    } catch (err) {
      setGenerationError(err);
    } finally {
      clearSlotBusy(slotIndex);
      mutationInProgressRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = (slotIndex: number) => {
    void runBwRegenerate(slotIndex, false);
  };

  const handleRetryBwSlot = (slotIndex: number) => {
    void runBwRegenerate(slotIndex, true);
  };

  const runColorRegenerate = async (slotIndex: number, freeRetry: boolean) => {
    if (!session) return;
    if (!freeRetry && !session.canRegenerateColor) return;
    if (!freeRetry) {
      track(ANALYTICS_EVENTS.BOOKLET_REGENERATED);
    }
    markSlotBusy(slotIndex);
    mutationInProgressRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/preview-session/${sessionId}/regenerate-color`,
        withAnalyticsHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotIndex,
            style: activeColorStyle,
            ...(freeRetry ? { freeRetry: true } : {}),
          }),
        }),
      );
      const data = (await response.json()) as {
        session?: PreviewSessionPublicView;
        error?: string;
      };
      if (!response.ok) {
        throwIfGenerationRateLimited(response, data);
        throw new Error(data.error || t("preview.sessionError"));
      }
      const updatedSession = data.session as PreviewSessionPublicView;
      applySession(updatedSession);
      setFailedPreviewUrls((current) =>
        clearFailedPreviewUrlsForSlot(
          current,
          updatedSession.slots.find((item) => item.index === slotIndex),
        ),
      );
      setSlotsPendingColorRegen((current) => {
        const next = new Set(current);
        next.delete(slotIndex);
        return next;
      });
    } catch (err) {
      setGenerationError(err);
    } finally {
      clearSlotBusy(slotIndex);
      mutationInProgressRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRegenerateColor = (slotIndex: number) => {
    void runColorRegenerate(slotIndex, false);
  };

  const handleRetryColorSlot = (slotIndex: number) => {
    void runColorRegenerate(slotIndex, true);
  };

  const clearReplaceCropState = useCallback(() => {
    if (replaceSourceUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(replaceSourceUrlRef.current);
    }
    replaceSourceUrlRef.current = null;
    setReplaceCropImageUrl(null);
    setReplaceSmartCropLoading(false);
    setReplaceSmartCropArea(undefined);
    setReplaceEditorFaceBoxes([]);
    replaceSlotRef.current = null;
  }, []);

  const dismissReplaceCropEditor = useCallback(() => {
    if (replaceSourceUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(replaceSourceUrlRef.current);
    }
    replaceSourceUrlRef.current = null;
    setReplaceCropImageUrl(null);
    setReplaceSmartCropLoading(false);
    setReplaceSmartCropArea(undefined);
    setReplaceEditorFaceBoxes([]);
  }, []);

  useLayoutEffect(() => {
    if (!replaceCropImageUrl) {
      setReplaceSmartCropLoading(false);
      setReplaceSmartCropArea(undefined);
      return;
    }
    setReplaceSmartCropLoading(true);
    setReplaceSmartCropArea(undefined);
  }, [replaceCropImageUrl]);

  useEffect(() => {
    if (!replaceCropImageUrl) {
      setReplaceEditorFaceBoxes([]);
      return;
    }

    const ac = new AbortController();
    setReplaceEditorFaceBoxes([]);

    (async () => {
      try {
        const blob = await fetch(replaceCropImageUrl).then((response) =>
          response.blob(),
        );
        const formData = new FormData();
        formData.append("image", blob, "photo.jpg");
        const response = await fetch("/api/suggest-crop", {
          method: "POST",
          body: formData,
          signal: ac.signal,
        });
        const data = await response.json();
        if (ac.signal.aborted) return;
        setReplaceEditorFaceBoxes(
          Array.isArray(data.faceBoxes) ? data.faceBoxes : [],
        );
        const pixels = data.croppedAreaPixels as Area | undefined;
        const hasValidSuggestion =
          !data.fallback && pixels && pixels.width > 0 && pixels.height > 0;
        setReplaceSmartCropArea(hasValidSuggestion ? pixels : undefined);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        if (!ac.signal.aborted) {
          setReplaceEditorFaceBoxes([]);
          setReplaceSmartCropArea(undefined);
        }
      } finally {
        if (!ac.signal.aborted) {
          setReplaceSmartCropLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [replaceCropImageUrl]);

  const handleReplaceClick = (slotIndex: number) => {
    replaceSlotRef.current = slotIndex;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const slotIndex = replaceSlotRef.current;
    event.target.value = "";
    if (
      !file ||
      slotIndex === null ||
      !canReplacePreviewSlot(session, slotIndex, activeColorStyle)
    ) {
      return;
    }

    if (!isAllowedUploadImageType(file)) {
      setError(t("upload.invalidType"));
      replaceSlotRef.current = null;
      return;
    }

    setError(null);
    try {
      const prepared = await prepareImageForCrop(file);
      const objectUrl = URL.createObjectURL(prepared);
      if (replaceSourceUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(replaceSourceUrlRef.current);
      }
      replaceSourceUrlRef.current = objectUrl;
      setReplaceCropImageUrl(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("upload.serverError"));
      replaceSlotRef.current = null;
    }
  };

  const handleReplaceCropCancel = () => {
    clearReplaceCropState();
  };

  const handleReplaceCropSave = async (croppedUrl: string) => {
    const slotIndex = replaceSlotRef.current;
    if (
      slotIndex === null ||
      !canReplacePreviewSlot(session, slotIndex, activeColorStyle)
    ) {
      if (croppedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(croppedUrl);
      }
      clearReplaceCropState();
      return;
    }

    dismissReplaceCropEditor();
    markSlotBusy(slotIndex);
    mutationInProgressRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const compressed = await compressImage(croppedUrl);
      if (croppedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(croppedUrl);
      }
      const formData = new FormData();
      formData.append("slotIndex", String(slotIndex));
      formData.append("idempotencyKey", createIdempotencyKey());
      formData.append("image", compressed);
      const response = await fetch(
        `/api/preview-session/${sessionId}/replace`,
        withAnalyticsHeaders({
          method: "POST",
          body: formData,
        }),
      );
      const data = (await response.json()) as {
        session?: PreviewSessionPublicView;
        error?: string;
      };
      if (!response.ok) {
        throwIfGenerationRateLimited(response, data);
        throw new Error(data.error || t("preview.sessionError"));
      }
      const updatedSession = data.session as PreviewSessionPublicView;
      applySession(updatedSession);
      if (bookSide === "bw") {
        track(ANALYTICS_EVENTS.BOOKLET_IMAGE_REPLACED);
      }
      setFailedPreviewUrls((current) => {
        const next = new Set(current);
        const previousSlot = session?.slots.find((item) => item.index === slotIndex);
        if (previousSlot) {
          for (const candidate of previousSlot.candidates) {
            if (candidate.previewUrl) {
              next.delete(candidate.previewUrl);
            }
          }
          for (const candidate of previousSlot.colorCandidates ?? []) {
            if (candidate.previewUrl) {
              next.delete(candidate.previewUrl);
            }
          }
        }
        return next;
      });
    } catch (err) {
      setGenerationError(err);
    } finally {
      clearSlotBusy(slotIndex);
      mutationInProgressRef.current = false;
      setIsSubmitting(false);
      replaceSlotRef.current = null;
    }
  };

  const openCropForCandidate = useCallback(
    (candidateId: string, bookSide: PreviewBookSide, imageUrl: string) => {
      setOpenSlotActionsIndex(null);
      setCropError(null);
      setCropTarget({ candidateId, bookSide, imageUrl });
    },
    [],
  );

  const closeCropModal = useCallback(() => {
    if (cropSaving) {
      return;
    }
    setCropTarget(null);
    setCropError(null);
  }, [cropSaving]);

  const handleCropSave = useCallback(
    async (croppedUrl: string) => {
      if (!cropTarget) {
        return;
      }

      setCropSaving(true);
      setCropError(null);
      try {
        const compressed = await compressImage(croppedUrl);
        if (croppedUrl.startsWith("blob:")) {
          URL.revokeObjectURL(croppedUrl);
        }

        const formData = new FormData();
        formData.append("candidateId", cropTarget.candidateId);
        formData.append("bookSide", cropTarget.bookSide);
        formData.append("image", compressed);
        formData.append("idempotencyKey", createIdempotencyKey());

        const response = await fetch(
          `/api/preview-session/${sessionId}/crop`,
          withAnalyticsHeaders({
            method: "POST",
            body: formData,
          }),
        );
        const data = await response.json();
        if (!response.ok) {
          setCropError(t("preview.cropError"));
          return;
        }

        applySession(data.session);
        setCropTarget(null);
        setCropError(null);
      } catch {
        setCropError(t("preview.cropError"));
      } finally {
        setCropSaving(false);
      }
    },
    [applySession, cropTarget, sessionId, t],
  );

  const handleSelectCandidate = async (
    slotIndex: number,
    candidateId: string,
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/preview-session/${sessionId}/select`,
        withAnalyticsHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotIndex, candidateId }),
        }),
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("preview.sessionError"));
      }
      applySession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveBw = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/preview-session/${sessionId}/approve-bw`,
        withAnalyticsHeaders({ method: "POST" }),
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("preview.sessionError"));
      }
      applySession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToCart = async () => {
    if (!session) return;
    if (!selectedBookColor) {
      setBookColorError(true);
      return;
    }
    setBookColorError(false);
    setIsSubmitting(true);
    setError(null);
    try {
      const styleResponse = await fetch(
        `/api/preview-session/${sessionId}/style`,
        withAnalyticsHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style: activeColorStyle }),
        }),
      );
      const styleData = await styleResponse.json();
      if (!styleResponse.ok) {
        throw new Error(styleData.error || t("preview.sessionError"));
      }

      const latest = styleData.session as PreviewSessionPublicView;
      const colorful = isColorfulPreviewSession(latest);
      const orderedSlots = sortSlotsByDisplayOrder(
        latest.slots,
        latest.displayOrder,
      );
      const originalUrls = orderedSlots.map((slot) => slot.originalUrl);
      const cartStyle = colorful
        ? resolvePreviewColorStyle(activeColorStyle) === "pencil"
          ? "pencil"
          : "watercolor"
        : resolvePreviewColorStyle(activeColorStyle);
      const generatedColorUrls = orderedSlots.map((slot) => {
        const active = getColorCandidateForStyleFromPublicSlot(
          slot,
          cartStyle,
        );
        if (!active?.cleanUrl) {
          throw new Error(t("preview.sessionError"));
        }
        return active.cleanUrl;
      });
      const generatedBwUrls = colorful
        ? []
        : orderedSlots.map((slot) => {
            const active = slot.candidates.find(
              (candidate) => candidate.id === slot.activeCandidateId,
            );
            if (!active?.cleanUrl) {
              throw new Error(t("preview.sessionError"));
            }
            return active.cleanUrl;
          });
      const cartImageUrls = colorful ? generatedColorUrls : generatedBwUrls;

      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("adding_to_cart", "1");
        }
      } catch {}

      track(ANALYTICS_EVENTS.BOOKLET_ADDED_TO_CART, {
        changes_used: INITIAL_CHANGE_CREDITS - latest.changeCreditsRemaining,
      });

      const addPromise = addToCart(
        cartImageUrls,
        1,
        undefined,
        undefined,
        cartStyle,
        selectedBookColor,
        {
          originalUrls,
          ...(colorful ? {} : { generatedBwUrls }),
          generatedColorUrls,
          previewSessionId: sessionId,
          generationStats: buildPreviewGenerationStats(latest),
          bookFlow: colorful ? "colorful" : "classic",
        },
      );

      router.push("/cart");

      addPromise.catch((e) => {
        console.error("Add to cart failed:", e);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("preview.sessionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectBookSide = (nextSide: PreviewBookSide) => {
    if (nextSide === bookSide) {
      return;
    }

    if (tabFadeTimeoutRef.current) {
      clearTimeout(tabFadeTimeoutRef.current);
      tabFadeTimeoutRef.current = null;
    }

    setBookSide(nextSide);
    setOpenSlotActionsIndex(null);
    setBookLightboxOpen(false);

    if (nextSide === "color" && session) {
      void prefetchStripThumbnailsIfNeeded();
      void processPendingColorRegenSlots(session);
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayedBookSide(nextSide);
      setIsTabCardsVisible(true);
      return;
    }

    setIsTabCardsVisible(false);
    tabFadeTimeoutRef.current = setTimeout(() => {
      setDisplayedBookSide(nextSide);
      setIsTabCardsVisible(true);
      tabFadeTimeoutRef.current = null;
    }, 200);
  };

  const activeCompareModalOutput =
    compareImageModal?.outputs.find(
      (output) => output.id === compareImageModal.activeOutputId,
    ) ?? compareImageModal?.outputs[0];
  const compareModalAspectRatio =
    activeCompareModalOutput?.aspectRatio ?? 72 / 84;

  return (
    <div className="min-h-screen overflow-x-hidden bg-warm-light">
      <Header />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        {showInitialLoadingScreen ? (
          <PreviewInitialLoadingScreen
            imageUrls={initialLoadingPhotoUrls}
            isExiting={isInitialLoadingExiting}
            isComplete={!isInitialLoading}
            loadingLine={
              (isColorfulFlow ? colorfulLoadingLines : bwLoadingLines)[
                loadingLineIndex %
                  (isColorfulFlow ? colorfulLoadingLines : bwLoadingLines)
                    .length
              ] ??
              (isColorfulFlow ? colorfulLoadingLines[0] : bwLoadingLines[0])
            }
            slowText={t("preview.loadingSlow")}
            standardText={t("preview.loadingDuration")}
            title={
              isColorfulFlow
                ? translateOrFallback(
                    t,
                    "preview.colorfulLoadingTitle",
                    "preview.colorLoadingTitle",
                  )
                : t("preview.bwLoadingTitle")
            }
            locale={locale}
          />
        ) : showColorLoadingScreen ? (
          <PreviewInitialLoadingScreen
            imageUrls={initialLoadingPhotoUrls}
            isExiting={isColorLoadingExiting}
            isComplete={!isColorGenerating}
            loadingLine={
              (isColorfulFlow ? colorfulLoadingLines : colorLoadingLines)[
                loadingLineIndex %
                  (isColorfulFlow ? colorfulLoadingLines : colorLoadingLines)
                    .length
              ] ??
              (isColorfulFlow
                ? colorfulLoadingLines[0]
                : colorLoadingLines[0])
            }
            slowText={t("preview.loadingSlow")}
            standardText={t("preview.loadingDuration")}
            title={
              isColorfulFlow
                ? translateOrFallback(
                    t,
                    "preview.colorfulLoadingTitle",
                    "preview.colorLoadingTitle",
                  )
                : t("preview.colorLoadingTitle")
            }
            locale={locale}
          />
        ) : (
          <section className="bg-warm-light pt-5 pb-0 max-md:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-14">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <Title
                highlightText={
                  isColorPhase
                    ? t("preview.colorPhaseTitleHighlight")
                    : t("preview.bwPhaseTitle")
                }
                size="xl"
                roundedUnderline
                className="text-center text-2xl font-bold md:text-4xl mb-6"
              >
                {isColorPhase
                  ? t("preview.colorPhaseTitle")
                  : t("preview.bwPhaseTitle")}
              </Title>

            {error && !loadFailed && (
              <div
                className={cn(
                  "mt-6 rounded-lg border p-4 text-center font-body text-dark-gray",
                  isGenerationRateLimitErrorNode(error)
                    ? "border-gray-200 bg-[#F9F7EE]"
                    : "border-red-200 bg-red-50 font-body-bold text-red-700",
                )}
              >
                {error}
              </div>
            )}

            {loadFailed ? (
              <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-full max-w-xl whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 font-body-bold text-red-700">
                  {t("preview.loadFailed")}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleContinueWithoutPreview}
                    sx={{ color: "primary.dark" }}
                  >
                    {t("preview.continueWithoutPreview")}
                  </Button>
                </div>
              </div>
            ) : session ? (
              <div>
                {isColorPhase ? (
                  <p className="mx-auto max-w-xl text-center font-body text-base leading-relaxed text-dark-gray">
                    {t("preview.colorPhaseDescription")
                      .split("\n")
                      .map((line, index) => (
                        <span
                          key={index}
                          className={cn("block", index > 0 && "mt-1")}
                        >
                          {line}
                        </span>
                      ))}
                  </p>
                ) : (
                  <p className="mx-auto max-w-xl text-center font-body text-base leading-relaxed text-dark-gray">
                    {t("preview.bwPhaseDescription")
                      .split("\n")
                      .map((line, index) => (
                        <span
                          key={index}
                          className={cn("block", index > 0 && "mt-1")}
                        >
                          {line}
                        </span>
                      ))}
                  </p>
                )}
                <div className="mt-4 flex justify-center md:mt-5">
                  {session.changeCreditsRemaining > 0 ? (
                    <span className="inline-flex rounded-full border border-gray-200 bg-white/45 px-3.5 py-1 font-body text-sm font-normal text-dark-gray/70 md:py-1.5 md:text-xs">
                      {t("preview.changesRemainingBadge").replace(
                        "{count}",
                        String(session.changeCreditsRemaining),
                      )}
                    </span>
                  ) : (
                    <div
                      className="my-2 w-fit max-w-xl rounded-2xl border border-[#DCD3CC] bg-[#F2EEEA] px-3 py-3"
                      dir="rtl"
                    >
                      <div className="flex items-center gap-4">
                        <i
                          className="ti ti-refresh-off shrink-0 text-xs text-accent-burgundy md:text-[14px]"
                          aria-hidden="true"
                        />
                        <div
                          className="space-y-0 text-right font-body text-xs leading-relaxed md:text-[14px]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <p className="text-right">
                            {t("preview.changesExhaustedLine1")}
                          </p>
                          <p className="text-right">
                            {t("preview.changesExhaustedLine2Before")}
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/contact?previewSessionId=${sessionId}`,
                                )
                              }
                              className="cursor-pointer border-0 bg-transparent p-0 font-body text-xs text-accent-burgundy underline decoration-accent-burgundy/50 underline-offset-2 transition-opacity hover:opacity-75 md:text-[14px]"
                            >
                              {t("preview.changesExhaustedContactLink")}
                            </button>
                            {t("preview.changesExhaustedLine2After")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "mx-auto w-full max-w-5xl",
                    session.changeCreditsRemaining > 0
                      ? "mt-2 md:mt-3"
                      : "mt-3 md:mt-6",
                  )}
                >
                  {isColorPhase && !isColorfulFlow && (
                  <div
                    className="flex justify-center gap-8 border-b border-gray-200 pt-1 sm:gap-10 md:mt-2"
                    role="tablist"
                    aria-label={t("preview.colorPhaseTitle")}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={bookSide === "bw"}
                      onClick={() => handleSelectBookSide("bw")}
                      className={cn(
                        "relative -mb-px cursor-pointer px-1 pb-3 pt-1 font-body-bold text-sm transition-colors lg:hover:text-accent-burgundy",
                        bookSide === "bw"
                          ? "border-b-[3px] border-accent-burgundy text-dark-gray"
                          : "border-b-[3px] border-transparent text-dark-gray/70 hover:text-dark-gray",
                      )}
                    >
                      {t("preview.tabBw")}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={bookSide === "color"}
                      onClick={() => handleSelectBookSide("color")}
                      className={cn(
                        "relative -mb-px cursor-pointer px-1 pb-3 pt-1 font-body-bold text-sm transition-colors lg:hover:text-accent-burgundy",
                        bookSide === "color"
                          ? "border-b-[3px] border-accent-burgundy text-dark-gray"
                          : "border-b-[3px] border-transparent text-dark-gray/70 hover:text-dark-gray",
                      )}
                    >
                      {t("preview.tabColor")}
                    </button>
                  </div>
                  )}

                  <div
                    className={cn(
                      "px-4 pb-2 pt-6 opacity-100 transition-opacity duration-200 ease-linear motion-reduce:transition-none md:px-6 md:py-6",
                      !isTabCardsVisible && "pointer-events-none opacity-0",
                    )}
                  >
                    {isDisplayedColorSideLoading ? (
                      <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary-orange" />
                        <p className="font-body-bold text-lg text-dark-gray">
                          {t("preview.colorLoadingTitle")}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3 flex justify-end" dir="ltr">
                          <button
                            type="button"
                            onClick={() => {
                              setBookLightboxIndex(0);
                              setBookLightboxOpen(true);
                            }}
                            disabled={bookLightboxSlides.length === 0}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#5b534d]/92 px-3.5 py-1.5 font-body text-xs text-white shadow-sm transition-colors hover:bg-[#443d38] disabled:cursor-not-allowed disabled:opacity-45 md:text-sm",
                            )}
                          >
                            <Expand className="h-4 w-4" strokeWidth={2.25} />
                            <span>{t("preview.zoom")}</span>
                          </button>
                        </div>
                        <div className="relative">
                        <div
                          className={cn(
                            isColorfulFlow
                              ? "flex flex-col items-center gap-3 overflow-x-auto pb-2"
                              : "overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0",
                          )}
                        >
                          {illustrationSlotRows.map((rowSlots, rowIndex) => (
                          <div
                            key={rowIndex}
                            className={cn(
                              "flex items-start gap-3 md:gap-3.5",
                              isColorfulFlow
                                ? "flex-nowrap justify-center"
                                : "w-max lg:mx-auto lg:justify-center lg:gap-3",
                            )}
                          >
                      {rowSlots.map((slot) => {
                        const pageNum = displayPosition(
                          slot.index,
                          session.displayOrder,
                        );
                        const active = slot.candidates.find(
                          (candidate) => candidate.id === slot.activeCandidateId,
                        );
                        const isSlotBusy =
                          slot.inFlight || busySlotIndexes.has(slot.index);
                        const activeColorCandidate =
                          getColorCandidateForStyleFromPublicSlot(
                            slot,
                            displayColorStyle,
                          ) ??
                          (displayedBookSide === "color"
                            ? slot.colorPreview
                            : undefined);
                        const colorVersions = getColorVersionsForStyle(
                          slot,
                          displayColorStyle,
                        );
                        const isSlotPendingColorRegen =
                          (session.pendingColorRegenSlotIndexes?.includes(
                            slot.index,
                          ) ??
                            false) || slotsPendingColorRegen.has(slot.index);
                        const isColorSlotBusy =
                          slot.colorInFlight ||
                          (isSlotPendingColorRegen &&
                            !activeColorCandidate?.previewUrl) ||
                          (displayedBookSide === "color" &&
                            busySlotIndexes.has(slot.index));
                        const isVisibleSideBusy =
                          displayedBookSide === "bw"
                            ? isSlotBusy
                            : isColorSlotBusy;
                        const showColorBwInterim =
                          displayedBookSide === "color" &&
                          isSlotPendingColorRegen &&
                          !activeColorCandidate?.previewUrl &&
                          Boolean(active?.previewUrl);
                        const currentPreviewUrl =
                          displayedBookSide === "bw"
                            ? active?.previewUrl
                            : showColorBwInterim
                              ? active?.previewUrl
                              : activeColorCandidate?.previewUrl;
                        const previewUrlFailed = Boolean(
                          currentPreviewUrl &&
                            failedPreviewUrls.has(currentPreviewUrl),
                        );
                        const lightboxIndex = bookLightboxSlides.findIndex(
                          (slide) => slide.pageNumber === pageNum,
                        );
                        const openSlotLightbox = () => {
                          if (!currentPreviewUrl || lightboxIndex < 0) {
                            return;
                          }
                          setBookLightboxIndex(lightboxIndex);
                          setBookLightboxOpen(true);
                        };
                        const compareOutputs =
                          displayedBookSide === "bw"
                            ? slot.candidates.flatMap(
                                (candidate): CompareOutputImage[] =>
                                  candidate.previewUrl
                                    ? [
                                        {
                                          id: candidate.id,
                                          url: candidate.previewUrl,
                                          alt: `${t("preview.generatedImage")} ${pageNum}`,
                                        },
                                      ]
                                    : [],
                              )
                            : colorVersions.flatMap(
                                (candidate): CompareOutputImage[] =>
                                  candidate.previewUrl
                                    ? [
                                        {
                                          id: candidate.id,
                                          url: candidate.previewUrl,
                                          alt: `${t("preview.generatedImage")} ${pageNum}`,
                                        },
                                      ]
                                    : [],
                              );
                        const activeCompareOutput =
                          displayedBookSide === "bw"
                            ? (compareOutputs.find(
                                (output) => output.id === slot.activeCandidateId,
                              ) ?? compareOutputs[0])
                            : (compareOutputs.find(
                                (output) => output.id === activeColorCandidate?.id,
                              ) ?? compareOutputs[0]);
                        const openCompareModal = () => {
                          if (!activeCompareOutput) {
                            return;
                          }

                          setCompareImageModal({
                            originalUrl: slot.originalUrl,
                            originalAlt: `${t("preview.originalPhoto")} ${pageNum}`,
                            outputs: compareOutputs,
                            activeOutputId: activeCompareOutput.id,
                          });
                        };
                        const cropCandidateId =
                          displayedBookSide === "bw"
                            ? active?.id
                            : activeColorCandidate?.id;
                        const canCropImage =
                          Boolean(currentPreviewUrl && cropCandidateId) &&
                          !isVisibleSideBusy &&
                          !isSubmitting &&
                          !cropSaving;
                        const openCropModal = () => {
                          if (!cropCandidateId || !currentPreviewUrl) {
                            return;
                          }
                          openCropForCandidate(
                            cropCandidateId,
                            displayedBookSide,
                            currentPreviewUrl,
                          );
                        };
                        const versionCandidates =
                          displayedBookSide === "bw"
                            ? getSelectableBwVersionCandidates(slot)
                            : isColorPhase
                              ? getSelectableColorVersionCandidates(
                                  slot,
                                  displayColorStyle,
                                )
                              : [];
                        const activeVersionCandidateId =
                          displayedBookSide === "bw"
                            ? slot.activeCandidateId
                            : activeColorCandidate?.id;
                        const canRegenerateSlot =
                          displayedBookSide === "bw"
                            ? session.canRegenerate
                            : session.canRegenerateColor;
                        const showRegenerateAction =
                          Boolean(currentPreviewUrl && !previewUrlFailed) &&
                          !isVisibleSideBusy;
                        return (
                          <div
                            key={slot.index}
                            className="w-[9rem] flex-shrink-0 snap-center sm:w-[10.5rem] lg:w-[11rem]"
                          >
                          <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#E5DDD4]">
                            <div
                              className="relative flex w-full shrink-0 flex-col gap-1.5 bg-[#EAE6E1]"
                              style={{ aspectRatio: "72 / 84" }}
                            >
                              {currentPreviewUrl && !previewUrlFailed ? (
                                <div
                                  className="flex shrink-0 justify-end pe-1 pt-1 md:pe-2"
                                  data-preview-actions-menu
                                  dir="ltr"
                                >
                                  <div className="relative pointer-events-auto">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenSlotActionsIndex((current) =>
                                        current === slot.index ? null : slot.index,
                                      )
                                    }
                                    className={cn(
                                      "group flex cursor-pointer items-center justify-center",
                                      showActionsPulse && "preview-more-pulse",
                                    )}
                                    aria-label={t("preview.imageActions")}
                                    aria-expanded={openSlotActionsIndex === slot.index}
                                  >
                                    <span className="relative flex h-4 min-w-[22px] items-center justify-center overflow-hidden rounded-full bg-white px-1.5 py-0 text-[#693430]/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                                      <span className="absolute inset-0 bg-[#693430] opacity-0 transition-opacity duration-150 ease-in group-hover:opacity-10 group-active:opacity-10" />
                                      <MoreHorizontal
                                        className="relative h-3 w-3"
                                        strokeWidth={2.4}
                                      />
                                    </span>
                                  </button>
                                  {openSlotActionsIndex === slot.index && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-50 flex items-end bg-black/20 p-3 sm:hidden"
                                        onClick={() => setOpenSlotActionsIndex(null)}
                                      >
                                        <div
                                          className="w-full rounded-xl border border-gray-200 bg-[#F9F7EE] p-2 shadow-xl"
                                          onClick={(event) => event.stopPropagation()}
                                        >
                                          <div className="flex flex-col gap-0">
                                            <button
                                              type="button"
                                              disabled={
                                                (displayedBookSide === "bw" ? !session.canRegenerate : !session.canRegenerateColor) ||
                                                isVisibleSideBusy ||
                                                isSubmitting
                                              }
                                              onClick={() => {
                                                setOpenSlotActionsIndex(null);
                                                if (displayedBookSide === "bw") {
                                                  void handleRegenerate(slot.index);
                                                  return;
                                                }
                                                void handleRegenerateColor(slot.index);
                                              }}
                                              className="block w-full cursor-pointer rounded-lg px-3 py-2 text-end font-body-bold text-sm text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                            >
                                              {t("preview.regenerate")}
                                            </button>
                                            <button
                                              type="button"
                                              disabled={
                                                !canReplacePreviewSlot(
                                                  session,
                                                  slot.index,
                                                ) ||
                                                isSlotBusy ||
                                                isSubmitting
                                              }
                                              onClick={() => {
                                                setOpenSlotActionsIndex(null);
                                                handleReplaceClick(slot.index);
                                              }}
                                              className="block w-full cursor-pointer rounded-lg px-3 py-2 text-end font-body-bold text-sm text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                            >
                                              {t("preview.replaceImage")}
                                            </button>
                                            <button
                                              type="button"
                                              disabled={!activeCompareOutput}
                                              onClick={() => {
                                                setOpenSlotActionsIndex(null);
                                                openCompareModal();
                                              }}
                                              className="block w-full cursor-pointer rounded-lg px-3 py-2 text-end font-body-bold text-sm text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                            >
                                              {t("preview.originalImage")}
                                            </button>
                                            <button
                                              type="button"
                                              disabled={!canCropImage}
                                              onClick={() => {
                                                openCropModal();
                                              }}
                                              className="block w-full cursor-pointer rounded-lg px-3 py-2 text-end font-body-bold text-sm text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                            >
                                              {t("preview.cropImage")}
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="absolute right-0 top-full z-40 mt-1.5 hidden w-36 rounded-xl border border-gray-200 bg-[#F9F7EE] p-1 shadow-xl sm:block">
                                        <button
                                          type="button"
                                          disabled={
                                            (displayedBookSide === "bw" ? !session.canRegenerate : !session.canRegenerateColor) ||
                                            isVisibleSideBusy ||
                                            isSubmitting
                                          }
                                          onClick={() => {
                                            setOpenSlotActionsIndex(null);
                                            if (displayedBookSide === "bw") {
                                              void handleRegenerate(slot.index);
                                              return;
                                            }
                                            void handleRegenerateColor(slot.index);
                                          }}
                                          className="block w-full cursor-pointer rounded-lg px-2 py-1 text-end font-body-bold text-xs text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                          {t("preview.regenerate")}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={
                                            !canReplacePreviewSlot(
                                              session,
                                              slot.index,
                                            ) ||
                                            isSlotBusy ||
                                            isSubmitting
                                          }
                                          onClick={() => {
                                            setOpenSlotActionsIndex(null);
                                            handleReplaceClick(slot.index);
                                          }}
                                          className="block w-full cursor-pointer rounded-lg px-2 py-1 text-end font-body-bold text-xs text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                          {t("preview.replaceImage")}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={!activeCompareOutput}
                                          onClick={() => {
                                            setOpenSlotActionsIndex(null);
                                            openCompareModal();
                                          }}
                                          className="block w-full cursor-pointer rounded-lg px-2 py-1 text-end font-body-bold text-xs text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                          {t("preview.originalImage")}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={!canCropImage}
                                          onClick={() => {
                                            setOpenSlotActionsIndex(null);
                                            openCropModal();
                                          }}
                                          className="block w-full cursor-pointer rounded-lg px-2 py-1 text-end font-body-bold text-xs text-dark-gray transition-colors hover:bg-[#EFE7DF] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                          {t("preview.cropImage")}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                  </div>
                                </div>
                              ) : null}
                              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-0 pb-2 md:px-0.5">
                                <PreviewSlotLightboxActivator
                                  lightboxEnabled={Boolean(currentPreviewUrl)}
                                  onOpenLightbox={openSlotLightbox}
                                  className={cn(
                                    "relative block h-full w-auto max-w-[80%] overflow-hidden rounded-sm",
                                    currentPreviewUrl
                                      ? "cursor-pointer transition-opacity lg:hover:opacity-90"
                                      : "cursor-default",
                                  )}
                                  style={{ aspectRatio: "72 / 84" }}
                                >
                                {displayedBookSide === "bw" ? (
                                  isSlotBusy ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-2">
                                      <Loader2 className="h-8 w-8 animate-spin text-primary-orange" />
                                      <p className="font-body text-sm text-dark-gray">
                                        {t("preview.slotBusy")}
                                      </p>
                                    </div>
                                  ) : active?.previewUrl && !previewUrlFailed ? (
                                    <PreviewSlotFadeImage
                                      key={`${slot.index}-${slot.activeCandidateId}`}
                                      src={active.previewUrl}
                                      alt={`${t("preview.title")} ${pageNum}`}
                                      onLoadError={(url) => {
                                        setFailedPreviewUrls((current) => {
                                          const next = new Set(current);
                                          next.add(url);
                                          return next;
                                        });
                                      }}
                                    />
                                  ) : active?.error?.code === "prohibited_content" ? (
                                    <PreviewSlotProhibitedContent
                                      disabled={
                                        isVisibleSideBusy || isSubmitting
                                      }
                                      onUpload={() =>
                                        handleReplaceClick(slot.index)
                                      }
                                    />
                                  ) : active?.error ? (
                                    <PreviewSlotGenerationError
                                      message={
                                        active.error.message ||
                                        t("preview.sessionError")
                                      }
                                      disabled={
                                        isVisibleSideBusy || isSubmitting
                                      }
                                      onRetry={() =>
                                        handleRetryBwSlot(slot.index)
                                      }
                                    />
                                  ) : previewUrlFailed ? (
                                    <PreviewSlotGenerationError
                                      message={t("preview.imageLoadFailed")}
                                      showContactFallback={!session.canRegenerate}
                                      disabled={
                                        isVisibleSideBusy || isSubmitting
                                      }
                                      onRetry={
                                        session.canRegenerate
                                          ? () => handleRegenerate(slot.index)
                                          : undefined
                                      }
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-dark-gray">
                                      {t("preview.sessionError")}
                                    </div>
                                  )
                                ) : isColorSlotBusy ? (
                                  <div className="flex h-full flex-col items-center justify-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary-orange" />
                                    <p className="font-body text-sm text-dark-gray">
                                      {t("preview.slotBusy")}
                                    </p>
                                  </div>
                                ) : showColorBwInterim && active?.previewUrl ? (
                                  <PreviewSlotFadeImage
                                    key={`${slot.index}-bw-interim-${slot.activeCandidateId}`}
                                    src={active.previewUrl}
                                    alt={`${t("preview.tabBw")} ${pageNum}`}
                                  />
                                ) : activeColorCandidate?.previewUrl &&
                                  !previewUrlFailed ? (
                                  <PreviewSlotFadeImage
                                    key={`${slot.index}-color-${activeColorCandidate.id}`}
                                    src={activeColorCandidate.previewUrl}
                                    alt={`${t("preview.tabColor")} ${pageNum}`}
                                    onLoadError={(url) => {
                                      setFailedPreviewUrls((current) => {
                                        const next = new Set(current);
                                        next.add(url);
                                        return next;
                                      });
                                    }}
                                  />
                                ) : activeColorCandidate?.error?.code ===
                                  "prohibited_content" ? (
                                  <PreviewSlotProhibitedContent
                                    disabled={isVisibleSideBusy || isSubmitting}
                                    onUpload={() => handleReplaceClick(slot.index)}
                                  />
                                ) : activeColorCandidate?.error ? (
                                  <PreviewSlotGenerationError
                                    message={
                                      activeColorCandidate.error.message ||
                                      t("preview.sessionError")
                                    }
                                    disabled={
                                      isVisibleSideBusy || isSubmitting
                                    }
                                    onRetry={() =>
                                      handleRetryColorSlot(slot.index)
                                    }
                                  />
                                ) : previewUrlFailed ? (
                                  <PreviewSlotGenerationError
                                    message={t("preview.imageLoadFailed")}
                                    showContactFallback={
                                      !session.canRegenerateColor
                                    }
                                    disabled={
                                      isVisibleSideBusy || isSubmitting
                                    }
                                    onRetry={
                                      session.canRegenerateColor
                                        ? () =>
                                            handleRegenerateColor(slot.index)
                                        : undefined
                                    }
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center px-4 text-center font-body text-sm text-dark-gray">
                                    {t("preview.sessionError")}
                                  </div>
                                )}
                              </PreviewSlotLightboxActivator>
                              {showRegenerateAction ? (
                                <PreviewSlotRegenerateAction
                                  className="mt-2"
                                  disabled={
                                    !canRegenerateSlot || isSubmitting
                                  }
                                  onClick={() => {
                                    if (displayedBookSide === "bw") {
                                      void handleRegenerate(slot.index);
                                      return;
                                    }
                                    void handleRegenerateColor(slot.index);
                                  }}
                                />
                              ) : null}
                              </div>
                            </div>
                            {versionCandidates.length > 1 ? (
                              <PreviewSlotAlternateVersions
                                versions={versionCandidates}
                                activeCandidateId={activeVersionCandidateId}
                                title={t("preview.allVersions")}
                                disabled={
                                  isVisibleSideBusy || isSubmitting
                                }
                                onSelect={(candidateId) => {
                                  void handleSelectCandidate(
                                    slot.index,
                                    candidateId,
                                  );
                                }}
                              />
                            ) : null}
                          </div>
                          </div>
                        );
                      })}
                          </div>
                          ))}
                        </div>
                      </div>
                        {session && isColorPhase ? (
                          <div className="flex flex-col items-center">
                            {displayedBookSide === "color" ? (
                              <PreviewColorStyleStrip
                                session={session}
                                frozenThumbnails={session.frozenStyleStripThumbnails}
                                activeStyle={displayColorStyle}
                                loadingStyles={styleStripLoadingSet}
                                onSelectStyle={(style) => {
                                  void handleSelectColorStyle(style);
                                }}
                                getStyleLabel={getColorStyleLabel}
                                title={t("preview.colorStyleStrip.title")}
                                disabled={isSubmitting}
                              />
                            ) : null}
                            <PreviewBookColorPicker
                              selectedColor={selectedBookColor}
                              onSelectColor={(color) => {
                                setSelectedBookColor(color);
                                setBookColorError(false);
                              }}
                              disabled={isSubmitting}
                              errorMessage={
                                bookColorError
                                  ? t("preview.bookColor.required")
                                  : undefined
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    )}

                  </div>
                </div>

                <PreviewPhaseFooter.MobileContact
                  contactBefore={t("preview.bwApproveBelowBefore")}
                  contactLinkLabel={t("preview.contactButton")}
                  onContactClick={() =>
                    router.push(`/contact?previewSessionId=${sessionId}`)
                  }
                />

                {isColorPhase ? (
                  <>
                    <PreviewPhaseFooter
                      variant="fixedMobile"
                      headline={t("preview.colorCartAbove")}
                      buttonLabel={t("preview.addToCart")}
                      submittingLabel={t("preview.addingToCart")}
                      buttonDisabled={!canAddToCart}
                      isSubmitting={isSubmitting}
                      onButtonClick={handleContinueToCart}
                      contactBefore={t("preview.bwApproveBelowBefore")}
                      contactLinkLabel={t("preview.contactButton")}
                      onContactClick={() =>
                        router.push(`/contact?previewSessionId=${sessionId}`)
                      }
                    />
                    <PreviewPhaseFooter
                      variant="inline"
                      headline={t("preview.colorCartAbove")}
                      buttonLabel={t("preview.addToCart")}
                      submittingLabel={t("preview.addingToCart")}
                      buttonDisabled={!canAddToCart}
                      isSubmitting={isSubmitting}
                      onButtonClick={handleContinueToCart}
                      contactBefore={t("preview.bwApproveBelowBefore")}
                      contactLinkLabel={t("preview.contactButton")}
                      onContactClick={() =>
                        router.push(`/contact?previewSessionId=${sessionId}`)
                      }
                    />
                  </>
                ) : (
                  <>
                    <PreviewPhaseFooter
                      variant="fixedMobile"
                      headline={t("preview.bwApproveAbove")}
                      buttonLabel={t("preview.approveBwButton")}
                      buttonDisabled={!session.canApproveBw}
                      isSubmitting={isSubmitting}
                      onButtonClick={handleApproveBw}
                      contactBefore={t("preview.bwApproveBelowBefore")}
                      contactLinkLabel={t("preview.contactButton")}
                      onContactClick={() =>
                        router.push(`/contact?previewSessionId=${sessionId}`)
                      }
                    />
                    <PreviewPhaseFooter
                      variant="inline"
                      headline={t("preview.bwApproveAbove")}
                      buttonLabel={t("preview.approveBwButton")}
                      buttonDisabled={!session.canApproveBw}
                      isSubmitting={isSubmitting}
                      onButtonClick={handleApproveBw}
                      contactBefore={t("preview.bwApproveBelowBefore")}
                      contactLinkLabel={t("preview.contactButton")}
                      onContactClick={() =>
                        router.push(`/contact?previewSessionId=${sessionId}`)
                      }
                    />
                  </>
                )}
              </div>
            ) : null}

            <input
              ref={replaceInputRef}
              type="file"
              accept={UPLOAD_IMAGE_ACCEPT}
              className="hidden"
              onChange={handleReplaceFile}
            />
          </div>
        </section>
        )}
      </main>
      {cropTarget && (
        <PreviewImageCropModal
          imageUrl={cropTarget.imageUrl}
          saving={cropSaving}
          error={cropError}
          onSave={(croppedUrl) => {
            void handleCropSave(croppedUrl);
          }}
          onCancel={closeCropModal}
        />
      )}
      {replaceCropImageUrl && (
        <MobileImageEditor
          key={`replace-crop-${replaceCropImageUrl}-${replaceSmartCropLoading ? "loading" : replaceSmartCropArea ? `${replaceSmartCropArea.x}-${replaceSmartCropArea.y}-${replaceSmartCropArea.width}-${replaceSmartCropArea.height}` : "fallback"}`}
          imageUrl={replaceCropImageUrl}
          isSmartCropLoading={replaceSmartCropLoading}
          initialSmartCropPixels={replaceSmartCropArea}
          referenceFaceBoxes={replaceEditorFaceBoxes}
          onSave={(croppedUrl) => {
            void handleReplaceCropSave(croppedUrl);
          }}
          onCancel={handleReplaceCropCancel}
        />
      )}
      {compareImageModal && activeCompareModalOutput && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("preview.originalImage")}
          onClick={() => setCompareImageModal(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[#F9F7EE] p-4 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCompareImageModal(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label={t("preview.closeLightbox")}
            >
              <X className="h-5 w-5" strokeWidth={2.25} />
            </button>

            <div className="grid gap-4 pt-9 sm:grid-cols-2 sm:pt-7">
              <div>
                <p className="mb-2 text-center font-body-bold text-sm text-dark-gray">
                  {t("preview.originalPhoto")}
                </p>
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-[#ebe6dc]"
                  style={{ aspectRatio: compareModalAspectRatio }}
                >
                  <img
                    src={compareImageModal.originalUrl}
                    alt={compareImageModal.originalAlt}
                    className={cn(
                      SENTRY_REPLAY_BLOCK_USER_IMAGE,
                      "absolute inset-0 h-full w-full object-cover",
                    )}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-center font-body-bold text-sm text-dark-gray">
                  {t("preview.generatedImage")}
                </p>
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-[#ebe6dc]"
                  style={{ aspectRatio: compareModalAspectRatio }}
                >
                  <img
                    src={activeCompareModalOutput.url}
                    alt={activeCompareModalOutput.alt}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } =
                        event.currentTarget;
                      if (!naturalWidth || !naturalHeight) {
                        return;
                      }

                      const aspectRatio = naturalWidth / naturalHeight;
                      setCompareImageModal((current) =>
                        current
                          ? {
                              ...current,
                              outputs: current.outputs.map((output) =>
                                output.id === activeCompareModalOutput.id
                                  ? { ...output, aspectRatio }
                                  : output,
                              ),
                            }
                          : current,
                      );
                    }}
                    className={cn(
                      SENTRY_REPLAY_BLOCK_USER_IMAGE,
                      "absolute inset-0 h-full w-full object-contain",
                    )}
                  />
                </div>
              </div>
            </div>

            {compareImageModal.outputs.length > 1 && (
              <div className="mt-4 overflow-x-auto hide-scrollbar">
                <div className="flex justify-center gap-2 pb-1">
                  {compareImageModal.outputs.map((output) => {
                    const isActive =
                      output.id === compareImageModal.activeOutputId;

                    return (
                      <button
                        key={output.id}
                        type="button"
                        onClick={() =>
                          setCompareImageModal((current) =>
                            current
                              ? { ...current, activeOutputId: output.id }
                              : current,
                          )
                        }
                        className={cn(
                          "h-16 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-white transition-opacity hover:opacity-90",
                          isActive
                            ? "border-primary-orange"
                            : "border-transparent",
                        )}
                      >
                        <img
                          src={output.url}
                          alt=""
                          className={cn(
                            SENTRY_REPLAY_BLOCK_USER_IMAGE,
                            "h-full w-full object-cover",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <PreviewBookLightbox
        open={bookLightboxOpen}
        slides={bookLightboxSlides}
        initialIndex={bookLightboxIndex}
        onClose={() => setBookLightboxOpen(false)}
        closeLabel={t("preview.closeLightbox")}
        previousLabel={t("preview.lightboxPrevious")}
        nextLabel={t("preview.lightboxNext")}
      />
      {!showInitialLoadingScreen && !showColorLoadingScreen && (
        <div className="max-md:hidden">
          <Footer />
        </div>
      )}
    </div>
  );
}
