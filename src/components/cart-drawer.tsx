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
import type { CartItem } from "@/lib/CartContext";
import {
  BOOK_COLOR_LABEL_KEYS,
  BOOK_COLOR_SWATCHES,
  type BookColor,
} from "@/lib/book-color";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import Button from "@mui/material/Button";
import { trackInitiateCheckout } from "@/lib/meta-pixel-events";
import { CartItemGeneratedAvatars } from "@/components/cart-item-generated-avatars";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import { QuantityControls } from "@/components/quantity-controls";
import { CartLineItemHeader } from "@/components/cart-line-item-header";
import { CartLineItemDetails } from "@/components/cart-line-item-details";
import { getCartItemAvatarPreview } from "@/lib/cart-item-preview-urls";
import { getCartItemLinePricing } from "@/lib/cart-line-pricing";

function getLineId(item: CartItem): string {
  return item.lineId || item.id;
}

function getStyleLabel(
  style: CartItem["style"],
  t: (key: string) => string,
): string {
  if (style === "cartoon") return t("cart.style.cartoon");
  if (style === "pencil") return t("cart.style.pencil");
  if (style === "watercolor") return t("cart.style.watercolor");
  if (style === "colorful") return t("cart.style.colorful");
  return t("cart.style.cartoon");
}

function getBookColorDisplay(
  bookColor: BookColor | undefined,
  t: (key: string) => string,
): { label?: string; swatch?: string } {
  if (!bookColor) {
    return {};
  }
  return {
    label: t(BOOK_COLOR_LABEL_KEYS[bookColor]),
    swatch: BOOK_COLOR_SWATCHES[bookColor],
  };
}

export function CartDrawer() {
  const { cart, isLoading, removeFromCart, updateQuantity, resetCart } = useCart();
  const { t, locale } = useLanguage();
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isResettingCart, setIsResettingCart] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRemoveClick = (lineId: string) => {
    setItemToRemove(lineId);
    setRemoveError(null);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    setBusyLineId(itemToRemove);
    setShowConfirmDialog(false);
    setRemoveError(null);
    try {
      await removeFromCart([itemToRemove]);
    } catch (error) {
      console.error("Error removing item:", error);
      setRemoveError(
        error instanceof Error ? error.message : t("cart.removeFailed"),
      );
    } finally {
      setBusyLineId(null);
      setItemToRemove(null);
    }
  };

  const handleQuantityChange = async (lineId: string, nextQuantity: number) => {
    setBusyLineId(lineId);
    try {
      await updateQuantity(lineId, nextQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setBusyLineId(null);
    }
  };

  const adjustQuantity = (lineId: string, delta: number) => {
    const item = cart?.items.find((i) => getLineId(i) === lineId);
    if (!item) return;
    const current = item.quantity > 0 ? item.quantity : 1;
    const next = current + delta;
    if (next < 1) return;
    void handleQuantityChange(lineId, next);
  };

  const renderQuantityControls = (item: CartItem) => {
    const lineId = getLineId(item);
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const isBusy = busyLineId === lineId;

    return (
      <QuantityControls
        quantity={quantity}
        disabled={isBusy}
        onIncrease={() => adjustQuantity(lineId, 1)}
        onDecrease={() => adjustQuantity(lineId, -1)}
        onDelete={() => handleRemoveClick(lineId)}
      />
    );
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

  const showDrawerSpinner = isLoading && !busyLineId;

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
                {removeError && (
                  <p
                    className="text-center text-sm font-body text-red-600"
                    role="alert"
                  >
                    {removeError}
                  </p>
                )}
                {[...cart.items].reverse().map((item, reversedIndex) => {
                  // Count only paper books for display index (skip gift cards)
                  const reversedItems = [...cart.items].reverse();
                  const paperBooksBeforeThis = reversedItems
                    .slice(0, reversedIndex + 1)
                    .filter((i) => !i.isGiftCard && !i.isFramedArt).length;
                  const displayIndex = paperBooksBeforeThis;
                  const lineId = getLineId(item);
                  const isLineBusy = busyLineId === lineId;
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
                      {isLineBusy && (
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

                      <div>
                        {(() => {
                          const pricing = getCartItemLinePricing(
                            item,
                            item.isGiftCard || item.isFramedArt
                              ? undefined
                              : displayIndex,
                          );
                          const quantity =
                            item.quantity > 0 ? item.quantity : 1;
                          const bookColorDisplay = getBookColorDisplay(
                            item.bookColor,
                            t,
                          );
                          const details = (
                            <CartLineItemDetails
                              locale={locale}
                              colorValue={bookColorDisplay.label}
                              colorSwatchSrc={bookColorDisplay.swatch}
                              showColorRow={
                                !item.isGiftCard && !item.isFramedArt
                              }
                              styleValue={
                                item.isGiftCard
                                  ? undefined
                                  : getStyleLabel(item.style, t)
                              }
                              showStyleRow={!item.isGiftCard}
                              quantity={quantity}
                              unitPrice={pricing.unitPrice}
                              lineTotal={pricing.lineTotal}
                              quantityControls={renderQuantityControls(item)}
                            />
                          );

                          if (item.isGiftCard) {
                            return (
                              <>
                                <CartLineItemHeader
                                  title={t("cart.giftCardTitle")}
                                  unitPrice={pricing.unitPrice}
                                  locale={locale}
                                />
                                {details}
                              </>
                            );
                          }

                          if (item.isFramedArt) {
                            return (
                              <div
                                className="flex items-start gap-2.5"
                                dir={locale === "he" ? "rtl" : "ltr"}
                              >
                                <div className="min-w-0 flex-1">
                                  <CartLineItemHeader
                                    title={t("cart.framedArtTitle")}
                                    unitPrice={pricing.unitPrice}
                                    locale={locale}
                                  />
                                  {details}
                                </div>
                                {(item.framedImageUrl ?? item.imageUrls?.[0]) && (
                                  <div className="shrink-0 w-[3.8rem] md:self-start">
                                    <FramedArtFrameMockup
                                      imageUrl={
                                        item.framedImageUrl ?? item.imageUrls?.[0]
                                      }
                                      maxWidthClassName="w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <>
                              <CartLineItemHeader
                                title={t("cart.book")}
                                unitPrice={pricing.unitPrice}
                                locale={locale}
                              />
                              {details}
                            </>
                          );
                        })()}
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
                disabled={isLoading || busyLineId !== null}
                sx={{
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: "10px",
                  py: 0.8,
                  minHeight: 38,
                  mb: "8px",
                  cursor:
                    isLoading || busyLineId !== null
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isLoading || busyLineId !== null ? (
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
              <button
                type="button"
                disabled={isResettingCart || busyLineId !== null}
                onClick={async () => {
                  setIsResettingCart(true);
                  setRemoveError(null);
                  try {
                    await resetCart();
                    setIsOpen(false);
                  } catch (error) {
                    console.error("Error resetting cart:", error);
                  } finally {
                    setIsResettingCart(false);
                  }
                }}
                className="mt-3 w-full text-center font-body text-sm text-medium-gray underline decoration-medium-gray/50 underline-offset-2 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("cart.clearAll")}
              </button>
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
