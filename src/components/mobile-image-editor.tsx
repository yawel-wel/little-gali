"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Loader2, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { anyFaceClippedByCrop } from "@/lib/smartCropGeometry";
import { getCroppedBlob, type CropState } from "@/lib/image-crop";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

export type { CropState };

type MobileImageEditorProps = {
  imageUrl: string;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  isSmartCropLoading?: boolean;
  initialSmartCropPixels?: Area;
  referenceFaceBoxes?: Area[];
  onSave: (croppedUrl: string, cropState: CropState) => void;
  onCancel: () => void;
  onChangeImage?: () => void;
  currentIndex?: number;
  totalImages?: number;
  saveButtonLabel?: string;
  showBottomCancelButton?: boolean;
  cancelButtonLabel?: string;
  cropInstructionTip?: string;
};

export function MobileImageEditor({
  imageUrl,
  initialCrop,
  initialZoom,
  isSmartCropLoading,
  initialSmartCropPixels,
  referenceFaceBoxes,
  onSave,
  onCancel,
  onChangeImage,
  currentIndex,
  totalImages,
  saveButtonLabel,
  showBottomCancelButton = false,
  cancelButtonLabel,
  cropInstructionTip,
}: MobileImageEditorProps) {
  const { t, locale } = useLanguage();
  const [crop, setCrop] = useState(initialCrop ?? { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom ?? 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [awaitingSecondDoneAfterFaceWarning, setAwaitingSecondDoneAfterFaceWarning] =
    useState(false);
  const [faceClipWarning, setFaceClipWarning] = useState(false);

  const aspect = 72 / 84;

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const onCropAreaChange = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const clearFaceClipWarning = useCallback(() => {
    setFaceClipWarning(false);
    setAwaitingSecondDoneAfterFaceWarning(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    const faces = referenceFaceBoxes ?? [];
    const clipped =
      faces.length > 0 && anyFaceClippedByCrop(faces, croppedAreaPixels);

    if (clipped && !awaitingSecondDoneAfterFaceWarning) {
      setFaceClipWarning(true);
      setAwaitingSecondDoneAfterFaceWarning(true);
      return;
    }

    setFaceClipWarning(false);
    setAwaitingSecondDoneAfterFaceWarning(false);
    const blob = await getCroppedBlob(imageUrl, croppedAreaPixels);
    if (blob) onSave(URL.createObjectURL(blob), { crop, zoom });
  }, [
    imageUrl,
    croppedAreaPixels,
    onSave,
    crop,
    zoom,
    referenceFaceBoxes,
    awaitingSecondDoneAfterFaceWarning,
  ]);

  useEffect(() => {
    clearFaceClipWarning();
    setCroppedAreaPixels(null);
  }, [imageUrl, clearFaceClipWarning]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const cropFrame = (
    <div
      className={cn(
        "relative w-[85vw] md:w-[380px] flex-shrink-0 overflow-hidden rounded-lg bg-[#ebe6dc]",
        SENTRY_REPLAY_BLOCK_USER_IMAGE,
      )}
      style={{ aspectRatio: "72 / 84" }}
    >
      {isSmartCropLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
          <Loader2
            className="w-10 h-10 animate-spin text-primary-orange"
            aria-hidden
          />
          <p
            className="font-body text-center text-sm sm:text-base text-dark-gray"
            style={{ color: "#374151" }}
          >
            {t("upload.analyzingPhoto")}
          </p>
        </div>
      ) : (
        <Cropper
          key={
            initialSmartCropPixels
              ? `${imageUrl}-${initialSmartCropPixels.x}-${initialSmartCropPixels.y}-${initialSmartCropPixels.width}-${initialSmartCropPixels.height}`
              : imageUrl
          }
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          onCropAreaChange={onCropAreaChange}
          onInteractionStart={() => {
            setIsInteracting(true);
            clearFaceClipWarning();
          }}
          onInteractionEnd={() => setIsInteracting(false)}
          {...(initialSmartCropPixels
            ? { initialCroppedAreaPixels: initialSmartCropPixels }
            : {})}
          style={{
            cropAreaStyle: {
              border: "3px solid rgba(255,255,255,0.85)",
              color: isInteracting
                ? "rgba(249, 247, 238, 0.82)"
                : "#ebe6dc",
              transition: "color 0.2s ease",
            },
          }}
        />
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-4 pt-14 pb-8"
      style={{ backgroundColor: "#F9F7EE" }}
    >
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label={locale === "he" ? "ביטול חיתוך" : "Cancel cropping"}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center w-full max-w-lg gap-8">
        <div className="flex flex-col items-center gap-4 w-full">
          {currentIndex !== undefined && totalImages !== undefined && (
            <span className="font-body-bold text-dark-gray text-lg">
              {currentIndex + 1}/{totalImages}
            </span>
          )}
          {cropFrame}
        </div>

        <div
          className={`flex flex-col items-center gap-4 transition-opacity duration-200 ${
            isSmartCropLoading
              ? "opacity-0 pointer-events-none select-none"
              : ""
          } ${isInteracting ? "md:opacity-0 md:pointer-events-none" : ""}`}
          aria-hidden={isSmartCropLoading || undefined}
        >
          <div className="flex flex-col items-center gap-1.5 px-6 max-w-md">
            <p
              className="font-body text-center text-base"
              style={{ color: "#374151" }}
            >
              {t("upload.cropInstruction")}
            </p>
            <p className="font-body text-center text-xs sm:text-[0.8125rem] text-gray-500 leading-snug">
              {cropInstructionTip ?? t("upload.cropInstructionTip")}
            </p>
            {faceClipWarning && (
              <div className="flex flex-col gap-1.5 max-w-md">
                <p
                  className="font-body text-center text-sm rounded-lg px-3 py-2 bg-amber-50 text-amber-900 border border-amber-200/80"
                  role="status"
                >
                  {t("upload.cropFaceClipWarning")}
                </p>
                {awaitingSecondDoneAfterFaceWarning && (
                  <p className="font-body text-center text-xs text-gray-600">
                    {t("upload.cropFaceClipTapDoneAgain")}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 items-center">
            <button
              onClick={handleSave}
              className="bg-primary-orange text-white font-body-bold rounded-xl px-10 py-3 text-lg cursor-pointer lg:hover:opacity-85 transition-opacity"
            >
              {saveButtonLabel ?? t("upload.cropDone")}
            </button>
            {showBottomCancelButton && (
              <button
                type="button"
                onClick={onCancel}
                className="font-body-bold text-dark-gray text-base bg-transparent border-0 cursor-pointer py-1 px-1 hover:opacity-70 transition-opacity"
              >
                {cancelButtonLabel ?? (locale === "he" ? "ביטול" : "Cancel")}
              </button>
            )}
            {onChangeImage && (
              <button
                type="button"
                onClick={onChangeImage}
                className="font-body-bold text-dark-gray text-base bg-transparent border-0 cursor-pointer py-1 px-1 hover:opacity-70 transition-opacity"
              >
                {t("upload.changeImage")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
