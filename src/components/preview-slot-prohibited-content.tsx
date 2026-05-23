"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewSlotProhibitedContentProps = {
  onUpload: () => void;
  disabled?: boolean;
};

export function PreviewSlotProhibitedContent({
  onUpload,
  disabled = false,
}: PreviewSlotProhibitedContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col items-center justify-center gap-1.5 px-2 py-2 text-center md:gap-3 md:px-4 md:py-0">
      <p className="max-w-full shrink font-body text-[10px] leading-tight text-dark-gray md:text-sm md:leading-relaxed">
        {t("preview.prohibitedContentLine1")}
        <br />
        {t("preview.prohibitedContentLine2")}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onUpload();
        }}
        className={cn(
          "inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border border-accent-burgundy bg-white px-2 py-1 font-body-bold text-[10px] whitespace-nowrap text-accent-burgundy transition-colors",
          "md:gap-1.5 md:rounded-lg md:px-3 md:py-1.5 md:text-xs",
          "hover:bg-[#EFE7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Upload className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" aria-hidden />
        {t("preview.prohibitedContentUpload")}
      </button>
    </div>
  );
}
