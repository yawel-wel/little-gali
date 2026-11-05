"use client";

import { useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/CartContext";
import { getCartItemAvatarPreview } from "@/lib/cart-item-preview-urls";
import { useLanguage } from "@/lib/LanguageContext";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type CartItemImagesDialogProps = {
  item: CartItem;
  /** What the user clicks to open the dialog (avatars or framed art thumbnail). */
  children: ReactNode;
  className?: string;
};

/**
 * Click target + modal showing a cart item's images:
 * books → every generated page as a square; framed art → only the framed art.
 */
export function CartItemImagesDialog({
  item,
  children,
  className,
}: CartItemImagesDialogProps) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const dir = locale === "he" ? "rtl" : "ltr";
  const framedUrl = item.isFramedArt
    ? (item.framedImageUrl ?? item.imageUrls?.[0] ?? null)
    : null;
  const bookUrls = item.isFramedArt
    ? []
    : getCartItemAvatarPreview(item).slots.filter(
        (url): url is string => Boolean(url),
      );

  if (item.isFramedArt ? !framedUrl : bookUrls.length === 0) {
    return <div className={className}>{children}</div>;
  }

  const title = item.isFramedArt ? t("cart.framedArtTitle") : t("cart.book");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t("preview.zoom")} – ${title}`}
        className={cn(
          "block cursor-pointer border-0 bg-transparent p-0 transition-opacity hover:opacity-85",
          className,
        )}
      >
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir={dir}
          className={cn(
            "max-h-[90vh] overflow-y-auto pt-10 md:p-6 md:pt-12",
            item.isFramedArt
              ? "w-[calc(100%-2rem)] max-w-md p-4"
              : // Mobile: modal hugs the image grid with slim side padding.
                "w-fit max-w-2xl px-6 pb-6 pt-13 md:w-[calc(100%-2rem)]",
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {framedUrl ? (
            <FramedArtFrameMockup
              imageUrl={framedUrl}
              maxWidthClassName="max-w-sm"
            />
          ) : (
            <div
              className={cn(
                // Mobile: 2 big columns. With 10 pages the first column is the
                // B&W side and the second the color side, so each row is one page.
                "mx-auto grid w-56 grid-cols-2 gap-3 md:w-full",
                bookUrls.length === 10 &&
                  "grid-flow-col grid-rows-5 md:grid-flow-row md:grid-rows-none",
                bookUrls.length === 9 ? "md:grid-cols-3" : "md:grid-cols-5",
              )}
            >
              {bookUrls.map((url, index) => (
                <img
                  key={`${index}-${url}`}
                  src={url}
                  alt=""
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  decoding="async"
                  className={cn(
                    SENTRY_REPLAY_BLOCK_USER_IMAGE,
                    "aspect-square w-full rounded-[5px] bg-white object-cover",
                  )}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
