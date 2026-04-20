"use client";

import { useLanguage } from "@/lib/LanguageContext";

export type StyleType = "cartoon" | "pencil" | "watercolor";

interface StyleSelectorProps {
  selectedStyle: StyleType | null;
  onStyleChange: (style: StyleType) => void;
  disabled?: boolean;
}

const STYLE_IMAGES: Record<StyleType, string> = {
  pencil: "/style-example-pencil.png",
  cartoon: "/style-example-cartoon.png",
  watercolor: "/style-example-watercolor.png",
};

const STYLE_IMAGES_FALLBACK: Record<StyleType, string | undefined> = {
  pencil: "/style-example-pencil2.png",
  cartoon: undefined,
  watercolor: undefined,
};

export function StyleSelector({
  selectedStyle,
  onStyleChange,
  disabled = false,
}: StyleSelectorProps) {
  const { t, locale } = useLanguage();

  const styles: StyleType[] = ["pencil", "cartoon", "watercolor"];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Heading */}
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-body-bold text-dark-gray flex items-center justify-center gap-2">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-body-bold"
            style={{ backgroundColor: "#e1b093" }}
          >
            3
          </span>
          {locale === "he" ? "בחירת סגנון צבעוני" : "Choose Color Style"}
        </h3>
        <p className="text-md font-body text-medium-gray text-center">
          {t("styleSelector.subtitle")}
        </p>
      </div>

      {/* Style Options */}
      <div className="flex flex-row gap-1.5 sm:gap-4 justify-center w-full max-w-full sm:max-w-2xl px-2 sm:px-0">
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => !disabled && onStyleChange(style)}
            disabled={disabled}
            className={`flex flex-col items-center gap-2 sm:gap-4 p-2.5 sm:p-5 rounded-2xl transition-all duration-200 flex-1 max-w-[140px] sm:max-w-[240px] bg-white ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:shadow-md"
            } ${
              selectedStyle === style
                ? "border-[4px] border-primary-orange"
                : "border-[2px] border-gray-300 hover:border-gray-400"
            }`}
            style={{
              transform: "scale(1)",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.transform = "scale(1.02)";
                if (selectedStyle !== style) {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            {/* Style Example Image */}
            <div className="w-[85px] h-[85px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] rounded-lg overflow-hidden bg-white">
              <img
                src={STYLE_IMAGES[style]}
                alt={t(`styleSelector.${style}Alt`)}
                className="w-full h-full object-cover"
                style={{ border: "none", outline: "none" }}
                onError={(e) => {
                  const fallback = STYLE_IMAGES_FALLBACK[style];
                  if (fallback && e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
              />
            </div>
            {/* Label */}
            <span className="font-body-bold text-sm sm:text-base md:text-lg text-dark-gray">
              {t(`styleSelector.${style}`)}
            </span>
            {/* Description */}
            <span className="font-body text-xs sm:text-sm text-medium-gray text-center px-2 -mt-2">
              {t(`styleSelector.${style}Description`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
