"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

const DESCRIPTION_FEATURE_ITEMS: {
  key:
    | "product.book.description.bullet3"
    | "product.book.description.bullet4"
    | "product.book.description.bullet7";
  iconSrc: string;
}[] = [
  {
    key: "product.book.description.bullet3",
    iconSrc: "/soft-book-features/mirror.png",
  },
  {
    key: "product.book.description.bullet4",
    iconSrc: "/soft-book-features/sparkle.png",
  },
  {
    key: "product.book.description.bullet7",
    iconSrc: "/soft-book-features/gift.png",
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
    <div className={cn("space-y-2.5", className)}>
      <ul
        className={cn(
          "grid w-fit max-w-full grid-cols-3 gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-3.5",
          isHe ? "ml-auto" : "mr-auto",
        )}
        dir={isHe ? "rtl" : "ltr"}
      >
        {DESCRIPTION_FEATURE_ITEMS.map(({ key, iconSrc }) => (
          <li
            key={key}
            className="flex min-w-0 max-w-[6.5rem] flex-col items-center gap-1 text-center sm:max-w-[7.25rem]"
          >
            <Image
              src={iconSrc}
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              aria-hidden
            />
            <span className="font-handwritten max-w-full break-words text-[11px] leading-tight text-dark-gray sm:text-xs">
              {t(key)}
            </span>
          </li>
        ))}
      </ul>
      <div
        className="mx-auto w-fit max-w-full bg-[#F0DCC8] px-5 py-1.5 text-center"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%, 10px 50%)",
        }}
      >
        <p className="font-body-bold text-[11px] leading-tight tracking-wide text-dark-gray sm:text-xs">
          {t("product.book.description.bullet5")}
        </p>
      </div>
    </div>
  );
}
