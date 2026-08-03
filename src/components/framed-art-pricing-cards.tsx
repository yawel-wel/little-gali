"use client";

import {
  FRAMED_ART_THREE_PRICE,
  FRAMED_ART_TWO_PRICE,
  FRAMED_ART_UNIT_PRICE,
} from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

const PRICING_CARDS = [
  {
    labelKey: "home.framedArt.priceCardSingle" as const,
    total: FRAMED_ART_UNIT_PRICE,
    perPhoto: FRAMED_ART_UNIT_PRICE,
    bestValue: false,
  },
  {
    labelKey: "home.framedArt.priceCardTwo" as const,
    total: FRAMED_ART_TWO_PRICE,
    perPhoto: Math.floor(FRAMED_ART_TWO_PRICE / 2),
    bestValue: false,
  },
  {
    labelKey: "home.framedArt.priceCardThree" as const,
    total: FRAMED_ART_THREE_PRICE,
    perPhoto: Math.floor(FRAMED_ART_THREE_PRICE / 3),
    bestValue: true,
  },
];

export function FramedArtPricingCards({ className }: { className?: string }) {
  const { t, locale } = useLanguage();

  return (
    <div className={cn("px-2 pb-2.5 pt-2", className)}>
      <div
        className="grid grid-cols-3 gap-1.5 sm:gap-2"
        dir={locale === "he" ? "rtl" : "ltr"}
      >
        {PRICING_CARDS.map((card) => (
          <div
            key={card.labelKey}
            className="relative flex flex-col items-center rounded-lg border border-[#E8DFD4] bg-white px-1.5 py-3 text-center sm:px-2"
          >
            {card.bestValue && (
              <span
                dir={locale === "he" ? "rtl" : "ltr"}
                className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-orange px-2 py-0.5 text-[10px] font-body-bold leading-none text-white"
              >
                {t("home.framedArt.bestValue")}
              </span>
            )}
            <p className="text-xs font-body-bold text-dark-gray sm:text-sm">
              {t(card.labelKey)}
            </p>
            <p
              className="mt-1 font-heading text-xl font-bold leading-none text-dark-gray tabular-nums sm:text-2xl"
              dir="ltr"
            >
              ₪{card.total}
            </p>
            <p className="mt-1 text-[10px] text-medium-gray sm:text-xs">
              {t("home.framedArt.pricePerPhoto").replace(
                "{price}",
                String(card.perPhoto),
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
