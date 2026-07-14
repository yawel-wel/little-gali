"use client";

import type { StyleType } from "@/components/style-selector";
import { COLOR_STYLES } from "@/lib/preview-session/color-by-style";
import { useLanguage } from "@/lib/LanguageContext";

const STYLE_EXAMPLES: Record<
  StyleType,
  { src: string; fallback?: string; labelKey: string; descriptionKey: string }
> = {
  pencil: {
    src: "/style-example-pencil.png",
    fallback: "/style-example-pencil2.png",
    labelKey: "styleSelector.pencil",
    descriptionKey: "styleSelector.pencilDescription",
  },
  cartoon: {
    src: "/style-example-cartoon.png",
    labelKey: "styleSelector.cartoon",
    descriptionKey: "styleSelector.cartoonDescription",
  },
  watercolor: {
    src: "/style-example-watercolor.png",
    labelKey: "styleSelector.watercolor",
    descriptionKey: "styleSelector.watercolorDescription",
  },
  colorful: {
    src: "/style-example-cartoon.png",
    labelKey: "styleSelector.cartoon",
    descriptionKey: "styleSelector.cartoonDescription",
  },
};

type FramedArtStylePickerProps = {
  selectedStyle: StyleType | null;
  onSelectStyle: (style: StyleType) => void;
  disabled?: boolean;
};

export function FramedArtStylePicker({
  selectedStyle,
  onSelectStyle,
  disabled = false,
}: FramedArtStylePickerProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
      {COLOR_STYLES.map((style) => {
        const example = STYLE_EXAMPLES[style];
        const isSelected = selectedStyle === style;
        return (
          <button
            key={style}
            type="button"
            disabled={disabled}
            onClick={() => onSelectStyle(style)}
            className={`flex max-w-[120px] flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl bg-white p-2.5 transition-all sm:max-w-[160px] sm:p-4 ${
              isSelected
                ? "border-[3px] border-primary-orange shadow-sm"
                : "border-2 border-gray-300 hover:border-gray-400"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="aspect-square w-full max-w-[100px] overflow-hidden rounded-lg sm:max-w-[120px]">
              <img
                src={example.src}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (
                    example.fallback &&
                    e.currentTarget.src !== example.fallback
                  ) {
                    e.currentTarget.src = example.fallback;
                  }
                }}
              />
            </div>
            <span className="font-body-bold text-sm text-dark-gray sm:text-base">
              {t(example.labelKey)}
            </span>
            <span className="-mt-1 px-1 text-center font-body text-[11px] leading-tight text-medium-gray sm:text-xs">
              {t(example.descriptionKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
