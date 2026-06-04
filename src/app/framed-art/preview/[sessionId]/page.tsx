"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ImageIcon, RefreshCw } from "lucide-react";
import {
  MobileImageEditor,
  type CropState,
} from "@/components/mobile-image-editor";
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
import {
  framedArtCropEditorImageUrl,
  framedArtCropExportImageUrl,
  framedArtMockupImageUrl,
} from "@/lib/framed-art/display-urls";
import type {
  FramedArtSessionPublicView,
  FramedArtStyleCandidate,
} from "@/lib/framed-art/types";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";
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
  const [isRetryingGeneration, setIsRetryingGeneration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [keepLoadingVisible, setKeepLoadingVisible] = useState(false);
  const [skipInitialLoader, setSkipInitialLoader] = useState(false);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [isSavingCrop, setIsSavingCrop] = useState(false);
  const [cropSaveError, setCropSaveError] = useState<string | null>(null);
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

  const heroUrl = framedArtMockupImageUrl(activeCandidate);
  const cropEditorImageUrl = framedArtCropEditorImageUrl(activeCandidate);
  const cropExportImageUrl = framedArtCropExportImageUrl(activeCandidate);

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

  const showGenerationError = generationFailed && !isRetryingGeneration;

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
    !showGenerationError &&
    !hideOverlayForReadySession &&
    (isRetryingGeneration || isGenerating || keepLoadingVisible);
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

  const showReadyMain =
    Boolean(session) && !sessionLoadError && !showGenerationError;

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

  const handleSaveIllustrationCrop = useCallback(
    async (_croppedUrl: string, cropState: CropState) => {
      if (!cropState.croppedAreaPixels || !selectedStyle || isSavingCrop) {
        return;
      }
      setIsSavingCrop(true);
      setCropSaveError(null);
      setError(null);
      try {
        const res = await fetch(
          `/api/framed-art/session/${sessionId}/save-crop`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              croppedAreaPixels: cropState.croppedAreaPixels,
              crop: cropState.crop,
              zoom: cropState.zoom,
              style: selectedStyle,
            }),
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save crop");
        }
        if (data.session) {
          setSession(data.session);
        }
        setCropEditorOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("framedArt.preview.errorGeneric");
        setCropSaveError(message);
        setError(message);
      } finally {
        setIsSavingCrop(false);
      }
    },
    [isSavingCrop, selectedStyle, sessionId, t],
  );

  const handleRetryGeneration = useCallback(async () => {
    setIsRetryingGeneration(true);
    setKeepLoadingVisible(true);
    setSkipInitialLoader(false);
    setError(null);
    try {
      const res = await fetch(
        `/api/framed-art/session/${sessionId}/generate`,
        { method: "POST", credentials: "include" },
      );
      const data = (await res.json()) as {
        session?: FramedArtSessionPublicView;
        error?: string;
      };
      if (data.session) {
        setSession(data.session);
        if (isFramedArtSessionReady(data.session)) {
          setSkipInitialLoader(true);
          setKeepLoadingVisible(false);
        }
      }
    } catch (err) {
      console.error("Framed art generation retry failed:", err);
    } finally {
      setIsRetryingGeneration(false);
    }
  }, [sessionId]);

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
      ) : showGenerationError ? (
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
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <p className="font-body text-dark-gray" role="alert">
                {t("framedArt.preview.errorGeneric")}
              </p>
              <button
                type="button"
                disabled={isRetryingGeneration}
                onClick={() => void handleRetryGeneration()}
                className="w-full max-w-[280px] cursor-pointer rounded-full bg-[#CB8E75] px-8 py-3 font-body-bold text-base text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("preview.slotRetryAgain")}
              </button>
              <Link
                href={uploadAgainHref}
                className="font-body text-sm text-medium-gray transition-opacity hover:opacity-80"
              >
                {t("framedArt.preview.uploadDifferentPhoto")}
              </Link>
            </div>
          )}
        </main>
      ) : showReadyMain ? (
        <main
          id="main-content"
          className={cn(
            "container mx-auto max-w-2xl px-4 pb-0 pt-24",
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

          {error && !cropEditorOpen && (
            <p className="mt-3 text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {heroUrl && (
            <p
              data-framed-art-crop-hint
              className="m-0 text-center font-body leading-snug text-medium-gray"
              style={{ marginTop: 16, marginBottom: 12, fontSize: 16 }}
            >
              {t("framedArt.preview.cropTapHint")}
            </p>
          )}

          <FramedArtFrameMockup
            className={heroUrl ? "mt-0" : "mt-3"}
            imageUrl={heroUrl}
            isLoading={!heroUrl}
            onImageClick={
              cropEditorImageUrl &&
              cropExportImageUrl &&
              !session?.inFlight &&
              !isSavingCrop
                ? () => {
                    setCropSaveError(null);
                    setCropEditorOpen(true);
                  }
                : undefined
            }
            imageClickLabel={t("accessibility.expandImage")}
          />

          <div
            className="mt-6 flex w-full flex-col items-center"
            style={{ gap: 16 }}
          >
            <button
              type="button"
              disabled={
                !heroUrl ||
                session?.inFlight ||
                !selectedStyle ||
                isSavingCrop ||
                cropEditorOpen
              }
              onClick={handleAddToCart}
              className="w-full max-w-[280px] cursor-pointer rounded-full bg-[#CB8E75] px-8 py-3 font-body-bold text-base text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("framedArt.preview.addToCart")}
            </button>

            <div
              className="flex items-center justify-center"
              style={{ gap: 20, color: "#8B8178" }}
            >
              <button
                type="button"
                disabled={
                  !session?.canRegenerate ||
                  isRegenerating ||
                  session?.inFlight ||
                  isSavingCrop
                }
                onClick={() => void handleRegenerate()}
                className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-body text-sm transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ color: "#8B8178" }}
              >
                <span>{t("framedArt.preview.regenerate")}</span>
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${isRegenerating ? "animate-spin" : ""}`}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>

              <span
                className="h-3.5 w-px shrink-0 bg-[#8B8178]/40"
                aria-hidden
              />

              <Link
                href={uploadAgainHref}
                className="inline-flex items-center gap-1.5 font-body text-sm transition-opacity hover:opacity-80"
                style={{ color: "#8B8178" }}
              >
                <span>{t("framedArt.preview.uploadDifferentPhoto")}</span>
                <ImageIcon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              </Link>
            </div>

            <p
              className="m-0 text-center font-body"
              style={{
                paddingBottom: 16,
                fontSize: 14,
                color: "#8B8178",
              }}
            >
              {t("framedArt.preview.specialRequestBefore")}
              <Link
                href={`/contact?previewSessionId=${sessionId}`}
                className="font-body underline decoration-[#8B8178]/50 underline-offset-2 transition-opacity hover:opacity-80"
                style={{ fontSize: 14, color: "#8B8178" }}
              >
                {t("framedArt.preview.specialRequestLink")}
              </Link>
            </p>
          </div>
        </main>
      ) : null}
      {cropEditorOpen &&
        cropEditorImageUrl &&
        cropExportImageUrl &&
        !session?.inFlight && (
          <MobileImageEditor
            key={`${cropEditorImageUrl}-${activeCandidate?.version ?? 0}`}
            imageUrl={cropEditorImageUrl}
            cropExportUrl={cropExportImageUrl}
            aspectRatio={1}
            initialCrop={activeCandidate?.cropState?.crop}
            initialZoom={activeCandidate?.cropState?.zoom}
            initialSmartCropPixels={activeCandidate?.cropState?.croppedAreaPixels}
            saveButtonLabel={t("framedArt.preview.cropSave")}
            compactSaveButtonOnDesktop
            deferCropExport
            isSaving={isSavingCrop}
            saveError={cropSaveError}
            onSave={(url, state) => {
              if (url.startsWith("blob:")) {
                URL.revokeObjectURL(url);
              }
              void handleSaveIllustrationCrop(url, state);
            }}
            onCancel={() => {
              if (!isSavingCrop) {
                setCropEditorOpen(false);
              }
            }}
          />
        )}
      <Footer />
    </div>
  );
}
