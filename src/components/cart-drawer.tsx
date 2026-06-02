"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/CartContext";
import {
  BOOK_PRICE,
  DISCOUNTED_BOOK_PRICE,
  FRAMED_ART_UNIT_PRICE,
} from "@/lib/constants";
import { ShoppingCart, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import Button from "@mui/material/Button";
import { trackInitiateCheckout } from "@/lib/meta-pixel-events";
import { CartItemGeneratedAvatars } from "@/components/cart-item-generated-avatars";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import { CartLinePrice, resolveCartLinePrice } from "@/components/cart-line-price";
import { getCartItemAvatarPreview } from "@/lib/cart-item-preview-urls";

export function CartDrawer() {
  const { cart, isLoading, removeFromCart } = useCart();
  const { t, locale } = useLanguage();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRemoveClick = (lineId: string) => {
    setItemToRemove(lineId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    setIsRemoving(itemToRemove);
    setShowConfirmDialog(false);
    try {
      await removeFromCart([itemToRemove]);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsRemoving(null);
      setItemToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
    setItemToRemove(null);
  };

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      // Track Meta Pixel InitiateCheckout event
      try {
        const totalValue = cart.totalAmount ? parseFloat(cart.totalAmount) : 0;
        trackInitiateCheckout(totalValue, cart.totalQuantity);
      } catch (err) {
        console.error("Error tracking InitiateCheckout:", err);
      }
      
      // The checkoutUrl in cart state should already have the locale
      // But ensure it's there as a safety measure
      let checkoutUrl = cart.checkoutUrl;
      try {
        const url = new URL(checkoutUrl);
        // Always ensure locale is set to current locale
        url.searchParams.set("locale", locale);
        checkoutUrl = url.toString();
      } catch (e) {
        // If URL parsing fails, use original URL
        console.error("Error parsing checkout URL:", e);
      }
      window.location.href = checkoutUrl;
    }
  };

  const cartItemCount = cart?.totalQuantity || 0;

  const showDrawerSpinner = isLoading && !isRemoving;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="text"
          color="primary"
          className="relative cursor-pointer hover:bg-transparent min-w-0 p-0"
          sx={{
            minWidth: 0,
            padding: 0,
            borderRadius: "9999px",
            color: "#693430",
            "&:hover": { backgroundColor: "transparent", opacity: 0.7 },
          }}
        >
          <ShoppingCart className="h-6 w-6" style={{ color: "#693430" }} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
          <span className="sr-only">{t("accessibility.openCart")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={locale === "he" ? "left" : "right"}
        className="w-[300px] sm:w-[400px]"
      >
        <SheetTitle className="sr-only">{t("accessibility.cartTitle")}</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pt-12">
            {showDrawerSpinner ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-orange" />
              </div>
            ) : cart && cart.items.length > 0 ? (
              <div className="space-y-3 px-4">
                {[...cart.items].reverse().map((item, reversedIndex) => {
                  // Count only paper books for display index (skip gift cards)
                  const reversedItems = [...cart.items].reverse();
                  const paperBooksBeforeThis = reversedItems
                    .slice(0, reversedIndex + 1)
                    .filter((i) => !i.isGiftCard && !i.isFramedArt).length;
                  const displayIndex = paperBooksBeforeThis;
                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3 bg-white relative"
                      onClick={(e) => {
                        // Prevent clicks on the container from interfering
                        const target = e.target as HTMLElement;
                        if (
                          !target.closest('[role="button"]') &&
                          !target.closest("button")
                        ) {
                          // Only prevent if not clicking on action buttons
                          return;
                        }
                      }}
                    >
                      {/* Loader Overlay - Show only on the item being removed */}
                      {isRemoving === (item.lineId || item.id) && (
                        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-50">
                          <Loader2 className="w-6 h-6 animate-spin text-primary-orange" />
                        </div>
                      )}
                      {isOpen &&
                        !item.isFramedArt &&
                        getCartItemAvatarPreview(item).expectedCount > 0 && (
                          <CartItemGeneratedAvatars
                            item={item}
                            locale={locale}
                            size="compact"
                            className="mb-3 px-1"
                          />
                        )}

                      {/* Title, Style, and Price */}
                      <div>
                        {item.isGiftCard ? (
                          <>
                            <h3 className="text-sm font-body-bold text-dark-gray mb-1">
                              {t("cart.giftCardTitle")}
                            </h3>
                            <div
                              className="flex items-center justify-between w-full"
                              dir="ltr"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveClick(item.lineId || item.id);
                                }}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 md:cursor-pointer md:transition-opacity md:hover:opacity-70"
                                disabled={
                                  isLoading ||
                                  isRemoving === (item.lineId || item.id)
                                }
                                aria-label={t("cart.removeItem")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <CartLinePrice
                                {...resolveCartLinePrice(item, {
                                  total: item.giftCardAmount ?? 0,
                                })}
                              />
                            </div>
                          </>
                        ) : item.isFramedArt ? (
                          <>
                            <div className="flex items-start gap-3" dir="ltr">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveClick(item.lineId || item.id);
                                }}
                                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700"
                                disabled={
                                  isLoading ||
                                  isRemoving === (item.lineId || item.id)
                                }
                                aria-label={t("cart.removeItem")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              <div className="flex flex-1 items-start justify-end gap-2.5">
                                <div className="min-w-0 text-right">
                                  <h3 className="text-sm font-body-bold text-dark-gray">
                                    {t("cart.framedArtTitle")}
                                  </h3>
                                  <div className="mt-1 text-xs text-medium-gray font-body">
                                    <span>{t("cart.style")} </span>
                                    <span className="font-body text-dark-gray">
                                      {item.style === "cartoon"
                                        ? t("cart.style.cartoon")
                                        : item.style === "pencil"
                                          ? t("cart.style.pencil")
                                          : item.style === "watercolor"
                                            ? t("cart.style.watercolor")
                                            : t("cart.style.cartoon")}
                                    </span>
                                  </div>
                                  <CartLinePrice
                                    className="mt-2 !text-sm"
                                    {...resolveCartLinePrice(item, {
                                      total: FRAMED_ART_UNIT_PRICE,
                                    })}
                                  />
                                </div>

                                {(item.framedImageUrl ?? item.imageUrls?.[0]) && (
                                  <div className="shrink-0 w-[3.8rem]">
                                    <FramedArtFrameMockup
                                      imageUrl={
                                        item.framedImageUrl ?? item.imageUrls?.[0]
                                      }
                                      maxWidthClassName="w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="text-sm font-body-bold text-dark-gray mb-1">
                              {t("cart.book")} {displayIndex}
                            </h3>
                            <div className="text-xs text-medium-gray font-body mb-1">
                              <span>{t("cart.colorStyle")} </span>
                              <span className="font-body text-dark-gray">
                                {item.style === "cartoon"
                                  ? t("cart.style.cartoon")
                                  : item.style === "pencil"
                                  ? t("cart.style.pencil")
                                  : item.style === "watercolor"
                                  ? t("cart.style.watercolor")
                                  : t("cart.style.cartoon")}
                              </span>
                            </div>
                            <div
                              className="flex items-center justify-between w-full"
                              dir="ltr"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveClick(item.lineId || item.id);
                                }}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 md:cursor-pointer md:transition-opacity md:hover:opacity-70"
                                disabled={
                                  isLoading ||
                                  isRemoving === (item.lineId || item.id)
                                }
                                aria-label={t("cart.removeItem")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <CartLinePrice
                                className="!text-sm"
                                {...resolveCartLinePrice(
                                  item,
                                  displayIndex > 1
                                    ? {
                                        total: DISCOUNTED_BOOK_PRICE,
                                        compare: BOOK_PRICE,
                                      }
                                    : { total: BOOK_PRICE },
                                )}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-medium-gray font-body">{t("cart.empty")}</p>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push("/upload")}
                  className="mt-4 cursor-pointer"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    borderRadius: "10px",
                    py: 0.6,
                    px: 2,
                    minHeight: 34,
                  }}
                >
                  {t("nav.createBook")}
                </Button>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-body-bold text-dark-gray">
                  {t("cart.total")}
                </span>
                <span className="text-xl font-body-bold text-black">
                  {cart.totalAmount ? parseFloat(cart.totalAmount).toFixed(0) : "0"}{" "}
                  ₪
                </span>
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                className="w-full cursor-pointer"
                disabled={isLoading || isRemoving !== null}
                sx={{
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: "10px",
                  py: 0.8,
                  minHeight: 38,
                  mb: "8px",
                  cursor:
                    isLoading || isRemoving !== null
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isLoading || isRemoving !== null ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("cart.loading")}
                  </>
                ) : (
                  t("cart.checkout")
                )}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push("/cart")}
                className="w-full cursor-pointer"
                sx={{
                  textTransform: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: "10px",
                  py: 0.6,
                  minHeight: 34,
                  borderWidth: 1.5,
                }}
              >
                {t("cart.viewFull")}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="w-[calc(100%-2.5rem)] max-w-[425px]">
          <DialogHeader className="!text-center">
            <DialogTitle className="font-body-bold text-dark-gray mt-4">
              {t("cart.removeItem")}
            </DialogTitle>
            <DialogDescription className="font-body text-medium-gray">
              {t("cart.removeConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-3 sm:gap-2 mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmRemove}
              className="cursor-pointer"
              sx={{
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {t("cart.remove")}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancelRemove}
              className="cursor-pointer"
              sx={{
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {t("cart.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
