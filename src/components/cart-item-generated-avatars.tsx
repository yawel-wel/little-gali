"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/CartContext";
import { getCartItemAvatarPreview } from "@/lib/cart-item-preview-urls";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

const AVATAR_SIZES = {
  default: {
    overlapPx: 14,
    circleClass:
      "h-11 w-11 border-[3px] md:h-12 md:w-12 shadow-[0_6px_16px_rgba(105,52,48,0.14)]",
  },
  compact: {
    overlapPx: 10,
    circleClass:
      "h-8 w-8 border-2 shadow-[0_4px_12px_rgba(105,52,48,0.12)]",
  },
} as const;

type CartItemGeneratedAvatarsProps = {
  item: CartItem;
  locale: "he" | "en";
  className?: string;
  size?: keyof typeof AVATAR_SIZES;
};

function CartItemAvatarCircle({
  url,
  index,
  total,
  overlapPx,
  circleClass,
}: {
  url: string | null;
  index: number;
  total: number;
  overlapPx: number;
  circleClass: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const showSkeleton = !url || !loaded;

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden rounded-full border-[#F6D8DD] bg-white",
        circleClass,
      )}
      style={{
        marginInlineStart: index === 0 ? 0 : -overlapPx,
        zIndex: total - index,
      }}
    >
      {showSkeleton && (
        <div
          className="absolute inset-0 animate-pulse rounded-full bg-[#EAD9D4]"
          aria-hidden
        />
      )}
      {url ? (
        <img
          src={url}
          alt=""
          className={cn(
            SENTRY_REPLAY_BLOCK_USER_IMAGE,
            "h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          decoding="async"
        />
      ) : null}
    </div>
  );
}

export function CartItemGeneratedAvatars({
  item,
  locale,
  className,
  size = "default",
}: CartItemGeneratedAvatarsProps) {
  const { overlapPx, circleClass } = AVATAR_SIZES[size];
  const { slots, expectedCount } = getCartItemAvatarPreview(item);
  if (expectedCount === 0) {
    return null;
  }

  const avatarDir = locale === "he" ? "rtl" : "ltr";
  const displaySlots =
    slots.length >= expectedCount
      ? slots.slice(0, expectedCount)
      : [
          ...slots,
          ...Array.from(
            { length: expectedCount - slots.length },
            (): null => null,
          ),
        ];

  return (
    <div className={cn("flex justify-center", className)} dir={avatarDir}>
      <div className="inline-flex items-center">
        {displaySlots.map((url, index) => (
          <CartItemAvatarCircle
            key={`${index}-${url ?? "pending"}`}
            url={url}
            index={index}
            total={expectedCount}
            overlapPx={overlapPx}
            circleClass={circleClass}
          />
        ))}
      </div>
    </div>
  );
}
