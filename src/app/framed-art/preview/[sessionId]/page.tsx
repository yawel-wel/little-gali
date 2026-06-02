"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import MuiButton from "@mui/material/Button";
import type { StyleType } from "@/components/style-selector";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import { PreviewInitialLoadingScreen } from "@/components/preview-initial-loading-screen";
import type {
  FramedArtSessionPublicView,
  FramedArtStyleCandidate,
} from "@/lib/framed-art/types";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";

function getActiveCandidate(
  session: FramedArtSessionPublicView | null,
  style: StyleType | undefined,
): FramedArtStyleCandidate | undefined {
  if (!session || !style) return undefined;
  return [...session.candidates]
    .filter((c) => c.style === style)
    .sort((a, b) => b.version - a.version)[0];
}

export default function FramedArtPreviewPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { addFramedArtToCart } = useCart();

  const [session, setSession] = useState<FramedArtSessionPublicView | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [keepLoadingVisible, setKeepLoadingVisible] = useState(false);

  const selectedStyle = session?.selectedStyle;
  const activeCandidate = useMemo(
    () => getActiveCandidate(session, selectedStyle),
    [session, selectedStyle],
  );

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/framed-art/session/${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.session) {
      setSession(data.session);
    }
  }, [sessionId]);

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

  const isGenerating =
    !heroUrl ||
    session?.inFlight === true ||
    session?.generationStatus === "running";

  useEffect(() => {
    if (isGenerating) {
      setKeepLoadingVisible(true);
      return;
    }
    if (!keepLoadingVisible) {
      return;
    }
    const timeout = setTimeout(() => setKeepLoadingVisible(false), 400);
    return () => clearTimeout(timeout);
  }, [isGenerating, keepLoadingVisible]);

  const showLoadingScreen = isGenerating || keepLoadingVisible;
  const isLoadingExiting = !isGenerating && keepLoadingVisible;

  const loadingLines = useMemo(
    () => [
      t("framedArt.preview.loadingLine1"),
      t("framedArt.preview.loadingLine2"),
      t("framedArt.preview.loadingLine3"),
      t("framedArt.preview.loadingLine4"),
    ],
    [t],
  );

  const wasLoadingScreenRef = useRef(false);
  useEffect(() => {
    if (showLoadingScreen && !wasLoadingScreenRef.current) {
      setLoadingLineIndex(0);
    }
    wasLoadingScreenRef.current = showLoadingScreen;
  }, [showLoadingScreen]);

  useEffect(() => {
    if (!showLoadingScreen || loadingLines.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setLoadingLineIndex((current) => (current + 1) % loadingLines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loadingLines.length, showLoadingScreen]);

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

  const originalPhotoUrls = session?.originalUrl ? [session.originalUrl] : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F7EE" }}>
      <Header />
      {showLoadingScreen ? (
        <PreviewInitialLoadingScreen
          variant="overlay"
          imageUrls={originalPhotoUrls}
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
      ) : (
        <main
          id="main-content"
          className="container mx-auto max-w-2xl px-4 pb-16 pt-24"
          style={{ paddingTop: "calc(72px + var(--banner-height, 0px) + 2rem)" }}
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
            <p className="mt-3 text-center font-body text-sm text-dark-gray">
              {t("framedArt.preview.styleLabel")}{" "}
              <span className="font-body-bold">{getStyleLabel(selectedStyle)}</span>
            </p>
          )}

          {error && (
            <p className="mt-4 text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <FramedArtFrameMockup
            className="mt-8"
            imageUrl={heroUrl}
            isLoading={!heroUrl}
          />

          <div className="mt-6 flex flex-col items-center gap-3">
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
      )}
      <Footer />
    </div>
  );
}
