"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

const DESCRIPTION_FEATURE_ITEMS: {
  key:
    | "product.book.description.bullet3"
    | "product.book.description.bullet5"
    | "product.book.description.bullet7";
  iconSrc: string;
  iconPx?: number;
}[] = [
  {
    key: "product.book.description.bullet3",
    iconSrc: "/soft-book-features/square-mirror.png",
  },
  {
    key: "product.book.description.bullet5",
    iconSrc: "/soft-book-features/shield.png",
    iconPx: 30,
  },
  {
    key: "product.book.description.bullet7",
    iconSrc: "/soft-book-features/gift.png",
    iconPx: 30,
  },
];

type SoftBookFeatureHighlightsProps = {
  className?: string;
};

export function SoftBookFeatureHighlights({
  className,
}: SoftBookFeatureHighlightsProps) {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";

  return (
    <ul
      className={cn(
        "flex w-full items-start justify-center gap-2 lg:gap-5",
        className,
      )}
      dir={isHe ? "rtl" : "ltr"}
    >
      {DESCRIPTION_FEATURE_ITEMS.map(({ key, iconSrc, iconPx = 28 }) => (
        <li
          key={key}
          className="flex w-24 min-w-0 flex-none flex-col items-center gap-1.5 text-center"
        >
          <Image
            src={iconSrc}
            alt=""
            width={iconPx + 8}
            height={iconPx + 8}
            className={cn(
              "shrink-0 object-contain",
              iconPx === 30
                ? "size-[34px] lg:size-[38px]"
                : "size-8 lg:size-9",
            )}
            aria-hidden
          />
          <span className="font-body text-sm leading-snug text-dark-gray">
            {t(key)}
          </span>
        </li>
      ))}
    </ul>
  );
}
