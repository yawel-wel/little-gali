"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import {
  BLANKET_PATTERNS,
  BLANKET_PATTERN_LABEL_KEYS,
  BLANKET_SWATCH_IMAGES,
  type BlanketPattern,
} from "@/lib/blanket";
import { cn } from "@/lib/utils";

export type PrintPatternPickerProps = {
  pattern: BlanketPattern;
  onPatternChange: (pattern: BlanketPattern) => void;
  disabled?: boolean;
  className?: string;
  /** i18n key for the option label (default: product.birthPackage.printLabel). */
  labelKey?: string;
};

/** Simple הדפס / Print swatch row (gift-set PDP + preview). */
export function PrintPatternPicker({
  pattern,
  onPatternChange,
  disabled = false,
  className,
  labelKey = "product.birthPackage.printLabel",
}: PrintPatternPickerProps) {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";

  return (
    <div className={cn("w-full min-w-0 space-y-2.5", className)}>
      <p className="text-base font-body-bold text-dark-gray">
        {t(labelKey)}:{" "}
        <span className="font-body text-medium-gray">
          {t(BLANKET_PATTERN_LABEL_KEYS[pattern])}
        </span>
      </p>
      <div
        className="flex w-full flex-wrap justify-start gap-3"
        dir={isHe ? "rtl" : "ltr"}
      >
        {BLANKET_PATTERNS.map((p) => {
          const isSelected = pattern === p;
          const label = t(BLANKET_PATTERN_LABEL_KEYS[p]);
          return (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => onPatternChange(p)}
              aria-pressed={isSelected}
              aria-label={t("product.blanket.patternAria").replace(
                "{pattern}",
                label,
              )}
              className={cn(
                "relative size-[calc(2.7rem+14px)] overflow-hidden rounded-md bg-white p-0.5 transition-colors sm:size-[62px]",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isSelected
                  ? "border-2 border-[#2d3748]"
                  : "border border-[#E8DFD4] hover:border-primary-orange/60",
              )}
            >
              <Image
                src={BLANKET_SWATCH_IMAGES[p]}
                alt={label}
                fill
                className="object-contain p-1"
                sizes="62px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
