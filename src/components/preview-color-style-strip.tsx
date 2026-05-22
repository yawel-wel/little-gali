"use client";

import { Loader2 } from "lucide-react";
import type { StyleType } from "@/components/style-selector";
import {
  BOOK_SLOT_INDEX,
  getColorCandidateForStyleFromPublicSlot,
} from "@/lib/preview-session/color-by-style";
import type {
  FrozenStyleStripThumbnail,
  PreviewSessionPublicView,
} from "@/lib/preview-session/types";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

const STRIP_STYLES: StyleType[] = ["pencil", "cartoon", "watercolor"];

type PreviewColorStyleStripProps = {
  session: PreviewSessionPublicView;
  frozenThumbnails?: Partial<Record<StyleType, FrozenStyleStripThumbnail>>;
  activeStyle: StyleType;
  loadingStyles: ReadonlySet<StyleType>;
  onSelectStyle: (style: StyleType) => void;
  getStyleLabel: (style: StyleType) => string;
  title: string;
  disabled?: boolean;
};

export function PreviewColorStyleStrip({
  session,
  frozenThumbnails,
  activeStyle,
  loadingStyles,
  onSelectStyle,
  getStyleLabel,
  title,
  disabled = false,
}: PreviewColorStyleStripProps) {
  const bookSlot = session.slots.find((slot) => slot.index === BOOK_SLOT_INDEX);
  const useFrozenThumbnails = Boolean(
    frozenThumbnails &&
      (frozenThumbnails.pencil?.previewUrl ||
        frozenThumbnails.cartoon?.previewUrl ||
        frozenThumbnails.watercolor?.previewUrl),
  );

  return (
    <div className="mt-8 w-full max-w-3xl">
      <p className="mb-3 text-center font-body text-sm text-dark-gray/80">{title}</p>
      <div className="flex justify-center gap-3 sm:gap-4" dir="ltr">
        {STRIP_STYLES.map((style) => {
          const isActive = style === activeStyle;
          const isLoading = loadingStyles.has(style);
          const frozenThumb = useFrozenThumbnails
            ? frozenThumbnails?.[style]?.previewUrl
            : undefined;
          const candidate =
            !useFrozenThumbnails && bookSlot
              ? getColorCandidateForStyleFromPublicSlot(bookSlot, style)
              : undefined;
          const thumbUrl = frozenThumb ?? candidate?.previewUrl;

          return (
            <button
              key={style}
              type="button"
              disabled={disabled || isLoading}
              onClick={() => onSelectStyle(style)}
              className={cn(
                "flex w-[5.5rem] flex-col items-center gap-2 sm:w-24",
                "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <div
                className={cn(
                  "relative h-16 w-full overflow-hidden rounded-lg border-2 bg-[#ebe6dc] shadow-sm sm:h-[4.5rem]",
                  isActive ? "border-primary-orange" : "border-gray-200",
                )}
                style={{ aspectRatio: "72 / 84" }}
              >
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-orange" />
                  </div>
                ) : thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    className={cn(
                      SENTRY_REPLAY_BLOCK_USER_IMAGE,
                      "h-full w-full object-cover",
                    )}
                  />
                ) : (
                  <div className="h-full w-full bg-[#e8e2d8]" />
                )}
              </div>
              <span
                className={cn(
                  "text-center font-body text-xs leading-tight sm:text-sm",
                  isActive ? "font-body-bold text-primary-orange" : "text-dark-gray",
                )}
              >
                {getStyleLabel(style)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
