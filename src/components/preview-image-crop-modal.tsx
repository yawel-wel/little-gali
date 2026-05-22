"use client";

import { Loader2 } from "lucide-react";
import { MobileImageEditor, type CropState } from "@/components/mobile-image-editor";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type PreviewImageCropModalProps = {
  imageUrl: string;
  saving: boolean;
  error: string | null;
  onSave: (croppedUrl: string, cropState: CropState) => void;
  onCancel: () => void;
};

export function PreviewImageCropModal({
  imageUrl,
  saving,
  error,
  onSave,
  onCancel,
}: PreviewImageCropModalProps) {
  const { t } = useLanguage();

  if (saving) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 px-4"
        style={{ backgroundColor: "rgba(0,0,0,0.72)" }}
        role="dialog"
        aria-modal="true"
        aria-busy="true"
      >
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <p className="font-body text-white">{t("preview.cropSaving")}</p>
      </div>
    );
  }

  return (
    <>
      <MobileImageEditor
        imageUrl={imageUrl}
        onSave={onSave}
        onCancel={onCancel}
        saveButtonLabel={t("preview.saveCrop")}
        showBottomCancelButton
        cancelButtonLabel={t("preview.cancelCrop")}
        cropInstructionTip={t("preview.cropInstructionTip")}
      />
      {error ? (
        <p
          className={cn(
            "pointer-events-none fixed bottom-6 left-1/2 z-[110] w-[min(90vw,24rem)] -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center font-body text-sm text-red-800 shadow-lg",
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
