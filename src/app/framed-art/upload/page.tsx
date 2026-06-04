"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { FramedArtStylePicker } from "@/components/framed-art-style-picker";
import { MobileImageEditor, type CropState } from "@/components/mobile-image-editor";
import { PreviewInitialLoadingScreen } from "@/components/preview-initial-loading-screen";
import { PreviewSlotProhibitedContent } from "@/components/preview-slot-prohibited-content";
import { isFramedArtProhibitedContent } from "@/lib/framed-art/prohibited-content";
import { saveFramedArtLoadingImageUrls } from "@/lib/framed-art/loading-images-storage";
import type { FramedArtSessionPublicView } from "@/lib/framed-art/types";
import type { StyleType } from "@/components/style-selector";
import { parseFramedArtStyleParam } from "@/lib/framed-art/parse-style-param";
import { useLanguage } from "@/lib/LanguageContext";
import { Loader2, Upload } from "lucide-react";

function FramedArtUploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleFromUrl = parseFramedArtStyleParam(searchParams.get("style"));
  const [selectedStyle, setSelectedStyle] = useState<StyleType | null>(styleFromUrl);
  const [uploadsRemaining, setUploadsRemaining] = useState<number | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [submitLoadingAvatar, setSubmitLoadingAvatar] = useState<string | null>(null);
  const [showSubmitLoading, setShowSubmitLoading] = useState(false);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [prohibitedBlocked, setProhibitedBlocked] = useState(false);

  useEffect(() => {
    setSelectedStyle(styleFromUrl);
  }, [styleFromUrl]);

  useEffect(() => {
    void fetch("/api/framed-art/limits")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.remaining === "number") {
          setUploadsRemaining(data.remaining);
        }
      })
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    if (!showSubmitLoading || loadingLines.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setLoadingLineIndex((current) => (current + 1) % loadingLines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loadingLines.length, showSubmitLoading]);

  const handleSelectStyle = (style: StyleType) => {
    setSelectedStyle(style);
    setError(null);
    router.replace(`/framed-art/upload?style=${style}`, { scroll: false });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedStyle) {
      setError(t("framedArt.upload.selectStyleFirst"));
      return;
    }
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
      setError(t("framedArt.upload.invalidType"));
      return;
    }
    setError(null);
    setProhibitedBlocked(false);
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage);
    }
    setPendingImage(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChangeImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSaveCrop = useCallback(
    async (croppedUrl: string, _cropState: CropState) => {
      if (!selectedStyle) return;
      if (uploadsRemaining !== null && uploadsRemaining <= 0) {
        setError(t("framedArt.upload.limitReached"));
        return;
      }

      setSubmitLoadingAvatar(croppedUrl);
      setShowSubmitLoading(true);
      setError(null);
      setProhibitedBlocked(false);

      try {
        const blob = await fetch(croppedUrl).then((r) => r.blob());
        const formData = new FormData();
        formData.append("images", blob, "framed-upload.jpg");

        const uploadRes = await fetch("/api/upload-images", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.imageUrls?.[0]) {
          throw new Error(uploadData.error || "Upload failed");
        }

        const sessionRes = await fetch("/api/framed-art/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            originalUrl: uploadData.imageUrls[0],
            style: selectedStyle,
          }),
        });
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) {
          if (sessionData.error === "framed_upload_limit") {
            setUploadsRemaining(0);
            throw new Error(t("framedArt.upload.limitReached"));
          }
          throw new Error(sessionData.error || "Failed to start session");
        }

        if (typeof sessionData.uploadsRemaining === "number") {
          setUploadsRemaining(sessionData.uploadsRemaining);
        }

        const sessionId = sessionData.session.id as string;
        const generateRes = await fetch(
          `/api/framed-art/session/${sessionId}/generate`,
          { method: "POST", credentials: "include" },
        );
        const generateData = await generateRes.json();
        if (typeof generateData.uploadsRemaining === "number") {
          setUploadsRemaining(generateData.uploadsRemaining);
        }

        const failedSession = generateData.session as
          | FramedArtSessionPublicView
          | undefined;
        if (
          failedSession &&
          isFramedArtProhibitedContent(failedSession)
        ) {
          setShowSubmitLoading(false);
          setSubmitLoadingAvatar(null);
          if (pendingImage) {
            URL.revokeObjectURL(pendingImage);
          }
          setPendingImage(null);
          setProhibitedBlocked(true);
          return;
        }

        const generationFailed =
          !generateRes.ok ||
          generateData.session?.generationStatus === "failed";

        if (generationFailed) {
          if (failedSession && !isFramedArtProhibitedContent(failedSession)) {
            saveFramedArtLoadingImageUrls(sessionId, [uploadData.imageUrls[0]]);
            router.push(`/framed-art/preview/${sessionId}`);
            return;
          }
          console.error("Framed art generate failed:", generateData);
          throw new Error(t("framedArt.upload.errorGeneric"));
        }

        saveFramedArtLoadingImageUrls(sessionId, [uploadData.imageUrls[0]]);
        router.push(`/framed-art/preview/${sessionId}`);
      } catch (err) {
        setShowSubmitLoading(false);
        setSubmitLoadingAvatar(null);
        setError(err instanceof Error ? err.message : t("framedArt.upload.errorGeneric"));
      }
    },
    [pendingImage, router, selectedStyle, t, uploadsRemaining],
  );

  const uploadDisabled =
    !selectedStyle || (uploadsRemaining !== null && uploadsRemaining <= 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F7EE" }}>
      <Header />
      {showSubmitLoading ? (
        <PreviewInitialLoadingScreen
          variant="overlay"
          imageUrls={submitLoadingAvatar ? [submitLoadingAvatar] : []}
          isExiting={false}
          isComplete={false}
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
        <>
      <main
        id="main-content"
        className="container mx-auto px-4 pb-16 pt-24"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px) + 2rem)" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <Title highlightText={t("framedArt.upload.titleHighlight")} size="lg">
            {t("framedArt.upload.title")}
          </Title>
          <p className="mt-3 font-body text-medium-gray">
            {t("framedArt.upload.uploadSubtitle")}
          </p>

          {uploadsRemaining !== null && (
            <p className="mt-4 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-body text-dark-gray shadow-sm">
              {t("framedArt.upload.remainingBadge").replace(
                "{count}",
                String(uploadsRemaining),
              )}
            </p>
          )}

          <FramedArtStylePicker
            selectedStyle={selectedStyle}
            onSelectStyle={handleSelectStyle}
            disabled={showSubmitLoading}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />

          {prohibitedBlocked ? (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm">
              <PreviewSlotProhibitedContent
                onUpload={() => {
                  setProhibitedBlocked(false);
                  setError(null);
                  fileInputRef.current?.click();
                }}
                disabled={uploadDisabled}
              />
            </div>
          ) : !pendingImage ? (
            <div className="mt-8">
              <div className="text-center">
                <div
                  role="button"
                  tabIndex={uploadDisabled ? -1 : 0}
                  aria-label={t("framedArt.upload.selectPhoto")}
                  aria-disabled={uploadDisabled}
                  className={`mx-auto flex h-40 w-40 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-all duration-200 md:h-48 md:w-48 ${
                    uploadDisabled
                      ? "pointer-events-none opacity-40"
                      : "cursor-pointer hover:border-primary-orange"
                  }`}
                  onClick={() => {
                    if (!uploadDisabled) fileInputRef.current?.click();
                  }}
                  onKeyDown={(e) => {
                    if (uploadDisabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <Upload
                    className="h-10 w-10 md:h-12 md:w-12"
                    style={{ color: "#693430" }}
                  />
                </div>
                <p className="mt-2 font-body text-sm text-dark-gray">
                  {t("upload.photoNote")}
                </p>
              </div>
            </div>
          ) : (
            !showSubmitLoading && (
              <MobileImageEditor
                imageUrl={pendingImage}
                aspectRatio={1}
                compactSaveButtonOnDesktop
                saveButtonLabel={t("framedArt.upload.createPreview")}
                onSave={handleSaveCrop}
                onCancel={() => {
                  URL.revokeObjectURL(pendingImage);
                  setPendingImage(null);
                }}
                onChangeImage={handleChangeImage}
              />
            )
          )}

          {error && (
            <p className="mt-4 text-sm font-body text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
      <Footer />
        </>
      )}
    </div>
  );
}

export default function FramedArtUploadPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: "#F9F7EE" }}
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary-orange" />
        </div>
      }
    >
      <FramedArtUploadPageContent />
    </Suspense>
  );
}
