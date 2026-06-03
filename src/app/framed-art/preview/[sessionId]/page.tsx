"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
// import { X } from "lucide-react"; // fullscreen lightbox (disabled)
import MuiButton from "@mui/material/Button";
import type { StyleType } from "@/components/style-selector";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import { PreviewInitialLoadingScreen } from "@/components/preview-initial-loading-screen";
import { PreviewSlotProhibitedContent } from "@/components/preview-slot-prohibited-content";
import { isFramedArtProhibitedContent } from "@/lib/framed-art/prohibited-content";
import {
  clearFramedArtLoadingImageUrls,
  readFramedArtLoadingImageUrls,
} from "@/lib/framed-art/loading-images-storage";
import type {
  FramedArtSessionPublicView,
  FramedArtStyleCandidate,
} from "@/lib/framed-art/types";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";
// import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy"; // fullscreen lightbox (disabled)
import { cn } from "@/lib/utils";

function getActiveCandidate(
  session: FramedArtSessionPublicView | null,
  style: StyleType | undefined,
): FramedArtStyleCandidate | undefined {
  if (!session || !style) return undefined;
  return [...session.candidates]
    .filter((c) => c.style === style)
    .sort((a, b) => b.version - a.version)[0];
}

function isFramedArtSessionReady(session: FramedArtSessionPublicView): boolean {
  if (!session.selectedStyle || session.generationStatus !== "complete") {
    return false;
  }
  const candidate = getActiveCandidate(session, session.selectedStyle);
  return Boolean(candidate?.previewUrl);
}

export default function FramedArtPreviewPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { addFramedArtToCart } = useCart();

  const [session, setSession] = useState<FramedArtSessionPublicView | null>(null);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [keepLoadingVisible, setKeepLoadingVisible] = useState(false);
  const [skipInitialLoader, setSkipInitialLoader] = useState(false);
  // const [lightboxOpen, setLightboxOpen] = useState(false); // fullscreen lightbox (disabled)
  const [localLoadingPhotoUrls] = useState(() =>
    readFramedArtLoadingImageUrls(sessionId),
  );
  const initialFetchDoneRef = useRef(false);

  const selectedStyle = session?.selectedStyle;
  const activeCandidate = useMemo(
    () => getActiveCandidate(session, selectedStyle),
    [session, selectedStyle],
  );

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/framed-art/session/${sessionId}`, {
      credentials: "include",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 403) {
        setSessionLoadError(t("preview.sessionUnauthorized"));
      } else if (res.status === 404) {
        setSessionLoadError(t("preview.sessionNotFound"));
      } else {
        setSessionLoadError(
          data.error || t("framedArt.preview.errorGeneric"),
        );
      }
      return;
    }
    setSessionLoadError(null);
    const data = await res.json();
    if (data.session) {
      const nextSession = data.session as FramedArtSessionPublicView;
      setSession(nextSession);
      if (!initialFetchDoneRef.current) {
        initialFetchDoneRef.current = true;
        if (isFramedArtSessionReady(nextSession)) {
          setSkipInitialLoader(true);
          setKeepLoadingVisible(false);
        }
      }
    }
  }, [sessionId, t]);

  useEffect(() => {
    void fetchSession();
    const interval = setInterval(() => {
      void fetchSession();
    }, 2500);
    return () => clearInterval(interval);
  }, [fetchSession]);

  const getStyleLabel = (style: StyleType) => {
    if (style === "cartoon") return t("cart.style.cartoon");
    if (style === "pencil") return t("cart.style.pencil");
    return t("cart.style.watercolor");
  };

  const heroUrl = activeCandidate?.previewUrl;
  // const lightboxImageUrl =
  //   activeCandidate?.cleanUrl ?? activeCandidate?.previewUrl ?? null;

  // useEffect(() => {
  //   if (!lightboxOpen) return;
  //   const onKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Escape") setLightboxOpen(false);
  //   };
  //   document.body.style.overflow = "hidden";
  //   window.addEventListener("keydown", onKeyDown);
  //   return () => {
  //     document.body.style.overflow = "";
  //     window.removeEventListener("keydown", onKeyDown);
  //   };
  // }, [lightboxOpen]);

  const isGenerating =
    session?.generationStatus !== "failed" &&
    (!heroUrl ||
      session?.inFlight === true ||
      session?.generationStatus === "running");

  const generationFailed =
    session?.generationStatus === "failed" && !heroUrl;

  const prohibitedBlocked = useMemo(
    () => (session ? isFramedArtProhibitedContent(session) : false),
    [session],
  );

  const generationErrorMessage = useMemo(() => {
    if (!generationFailed || !session?.selectedStyle) return null;
    const candidate = getActiveCandidate(session, session.selectedStyle);
    return candidate?.error?.message ?? null;
  }, [generationFailed, session]);

  useEffect(() => {
    if (skipInitialLoader) {
      return;
    }
    if (isGenerating) {
      setKeepLoadingVisible(true);
      return;
    }
    if (!keepLoadingVisible) {
      return;
    }
    const timeout = setTimeout(() => setKeepLoadingVisible(false), 400);
    return () => clearTimeout(timeout);
  }, [isGenerating, keepLoadingVisible, skipInitialLoader]);

  const hideOverlayForReadySession =
    skipInitialLoader &&
    Boolean(session) &&
    !session?.inFlight &&
    session?.generationStatus === "complete";

  const showLoadingOverlay =
    !sessionLoadError &&
    !generationFailed &&
    !hideOverlayForReadySession &&
    (isGenerating || keepLoadingVisible);
  const isLoadingExiting =
    !isGenerating && keepLoadingVisible && !hideOverlayForReadySession;

  const loadingPhotoUrls =
    session?.originalUrl != null
      ? [session.originalUrl]
      : localLoadingPhotoUrls;

  useEffect(() => {
    if (showLoadingOverlay || localLoadingPhotoUrls.length === 0) {
      return;
    }
    clearFramedArtLoadingImageUrls(sessionId);
  }, [localLoadingPhotoUrls.length, sessionId, showLoadingOverlay]);

  const showReadyMain = Boolean(session) && !sessionLoadError && !generationFailed;

  const loadingLines = useMemo(
    () => [
      t("framedArt.preview.loadingLine1"),
      t("framedArt.preview.loadingLine2"),
      t("framedArt.preview.loadingLine3"),
      t("framedArt.preview.loadingLine4"),
      t("framedArt.preview.loadingLine5"),
      t("framedArt.preview.loadingLine6"),
      t("framedArt.preview.loadingLine7"),
      t("framedArt.preview.loadingLine8"),
    ],
    [t],
  );

  const wasLoadingScreenRef = useRef(false);
  useEffect(() => {
    if (showLoadingOverlay && !wasLoadingScreenRef.current) {
      setLoadingLineIndex(0);
    }
    wasLoadingScreenRef.current = showLoadingOverlay;
  }, [showLoadingOverlay]);

  useEffect(() => {
    if (!showLoadingOverlay || loadingLines.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setLoadingLineIndex((current) => (current + 1) % loadingLines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loadingLines.length, showLoadingOverlay]);

  const handleRegenerate = async () => {
    if (!session?.canRegenerate) return;
    setIsRegenerating(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/framed-art/session/${sessionId}/regenerate`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regenerate failed");
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("framedArt.preview.errorGeneric"));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedStyle) return;
    setError(null);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("adding_to_cart", "1");
      }
    } catch {}

    const addPromise = addFramedArtToCart(sessionId, selectedStyle);
    router.push("/cart");
    addPromise.catch((err) => {
      console.error("Add framed art to cart failed:", err);
    });
  };

  const uploadAgainHref = selectedStyle
    ? `/framed-art/upload?style=${selectedStyle}`
    : "/framed-art/upload";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F7EE" }}>
      <Header />
      {showLoadingOverlay && (
        <PreviewInitialLoadingScreen
          variant="overlay"
          imageUrls={loadingPhotoUrls}
          isExiting={isLoadingExiting}
          isComplete={!isGenerating}
          loadingLine={
            loadingLines[loadingLineIndex % loadingLines.length] ??
            loadingLines[0]
          }
          slowText={t("preview.loadingSlow")}
          standardText={t("preview.loadingDuration")}
          title={t("framedArt.preview.loadingTitle")}
          locale={locale}
        />
      )}
      {sessionLoadError ? (
        <main
          id="main-content"
          className="container mx-auto max-w-2xl px-4 pb-16 pt-24 text-center"
          style={{ paddingTop: "calc(72px + var(--banner-height, 0px) + 2rem)" }}
        >
          <p className="font-body text-dark-gray" role="alert">
            {sessionLoadError}
          </p>
          <Link
            href="/framed-art/upload"
            className="mt-4 inline-block font-body-bold text-primary-orange"
          >
            {t("framedArt.preview.uploadDifferentPhoto")}
          </Link>
        </main>
      ) : generationFailed ? (
        <main
          id="main-content"
          className="container mx-auto max-w-2xl px-4 pb-16 pt-24 text-center"
          style={{ paddingTop: "calc(72px + var(--banner-height, 0px) + 2rem)" }}
        >
          {prohibitedBlocked ? (
            <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm">
              <PreviewSlotProhibitedContent
                onUpload={() => router.push(uploadAgainHref)}
              />
            </div>
          ) : (
            <>
              <p className="font-body text-dark-gray" role="alert">
                {generationErrorMessage ?? t("framedArt.preview.errorGeneric")}
              </p>
              <Link
                href={uploadAgainHref}
                className="mt-4 inline-block font-body-bold text-primary-orange"
              >
                {t("framedArt.preview.uploadDifferentPhoto")}
              </Link>
            </>
          )}
        </main>
      ) : showReadyMain ? (
        <main
          id="main-content"
          className={cn(
            "container mx-auto max-w-2xl px-4 pb-16 pt-24",
            showLoadingOverlay &&
              !isLoadingExiting &&
              "pointer-events-none invisible",
          )}
          style={{ paddingTop: "calc(72px + var(--banner-height, 0px) + 2rem)" }}
          aria-hidden={showLoadingOverlay && !isLoadingExiting}
        >
          <Title
            highlightText={t("framedArt.preview.readyTitleHighlight")}
            size="lg"
            roundedUnderline
            className="text-center"
          >
            {t("framedArt.preview.readyTitle")}
          </Title>

          {selectedStyle && (
            <p className="mt-2 text-center font-body text-sm text-dark-gray">
              {t("framedArt.preview.styleLabel")}{" "}
              <span className="font-body-bold">{getStyleLabel(selectedStyle)}</span>
            </p>
          )}

          {error && (
            <p className="mt-3 text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Fullscreen lightbox on image click — disabled for now
          <FramedArtFrameMockup
            ...
            onImageClick={
              lightboxImageUrl ? () => setLightboxOpen(true) : undefined
            }
            imageClickLabel={t("accessibility.expandImage")}
          />
          */}
          <FramedArtFrameMockup
            className="mt-3"
            imageUrl={heroUrl}
            isLoading={!heroUrl}
          />

          <div className="mt-3 flex flex-col items-center gap-3">
            <button
              type="button"
              disabled={!session?.canRegenerate || isRegenerating || session?.inFlight}
              onClick={() => void handleRegenerate()}
              className="inline-flex cursor-pointer items-center gap-2 font-body text-sm text-primary-orange disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
              />
              {t("framedArt.preview.regenerate")}
            </button>

            <MuiButton
              variant="contained"
              color="primary"
              disabled={!heroUrl || session?.inFlight || !selectedStyle}
              onClick={handleAddToCart}
              sx={{ px: 5, py: 1.5, fontFamily: "var(--font-assistant)", fontWeight: 700 }}
            >
              {t("framedArt.preview.addToCart")}
            </MuiButton>

            <Link
              href={uploadAgainHref}
              className="font-body text-sm text-medium-gray"
            >
              {t("framedArt.preview.uploadDifferentPhoto")}
            </Link>
          </div>
        </main>
      ) : null}
      {/* Fullscreen lightbox — disabled for now
      {lightboxOpen && lightboxImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("preview.closeLightbox")}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            aria-label={t("accessibility.close")}
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
          <img
            src={lightboxImageUrl}
            alt=""
            className={cn(
              "max-h-[min(90vh,900px)] max-w-[min(92vw,900px)] object-contain",
              SENTRY_REPLAY_BLOCK_USER_IMAGE,
            )}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      */}
      <Footer />
    </div>
  );
}
