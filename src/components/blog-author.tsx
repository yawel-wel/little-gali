"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type BlogAuthorProps = {
  size?: "sm" | "md";
  className?: string;
  dateLabel?: string;
};

const avatarSize = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
} as const;

export function BlogAuthor({
  size = "md",
  className,
  dateLabel,
}: BlogAuthorProps) {
  const { t } = useLanguage();
  const compact = size === "sm";

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-[#E8E0D8]",
          avatarSize[size]
        )}
      >
        <Image
          src="/about-us.jpg"
          alt={t("blog.authorImageAlt")}
          fill
          sizes={compact ? "36px" : "48px"}
          className="origin-[50%_12%] scale-[1.75] object-cover object-[50%_12%]"
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-body-bold text-dark-gray",
            compact ? "text-sm" : "text-sm sm:text-base"
          )}
        >
          {t("blog.authorName")}
        </p>
        <p className="font-body text-sm text-medium-gray">
          {t("blog.authorRole")}
        </p>
        {dateLabel ? (
          <time
            className={cn(
              "mt-2.5 block border-t border-dark-gray/15 pt-2 font-body text-xs tracking-wide text-light-gray",
              compact && "mt-2 pt-1.5"
            )}
          >
            {dateLabel}
          </time>
        ) : null}
      </div>
    </div>
  );
}
