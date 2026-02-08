"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/CartContext";
import { BOOK_PRICE, DISCOUNTED_BOOK_PRICE } from "@/lib/constants";
import { ShoppingCart, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import Button from "@mui/material/Button";

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
          className="relative text-dark-gray cursor-pointer hover:bg-transparent min-w-0 p-0"
          sx={{
            minWidth: 0,
            padding: 0,
            borderRadius: "9999px",
            "&:hover": { backgroundColor: "transparent", opacity: 0.7 },
          }}
        >
          <ShoppingCart className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={locale === "he" ? "left" : "right"}
        className="w-[300px] sm:w-[400px]"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pt-12">
            {showDrawerSpinner ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-orange" />
              </div>
            ) : cart && cart.items.length > 0 ? (
              <div className="space-y-3 px-4">
                {[...cart.items].reverse().map((item, reversedIndex) => {
                  const displayIndex = reversedIndex + 1;
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
                      {/* X Icon for Quick Removal */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClick(item.lineId || item.id);
                        }}
                        className={`absolute top-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center shadow-md transition-all z-10 cursor-pointer ${
                          locale === "en" ? "right-2" : "left-2"
                        }`}
                        disabled={
                          isLoading || isRemoving === (item.lineId || item.id)
                        }
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {/* Images Section */}
                      {item.imageUrls && item.imageUrls.length > 0 && (
                        <div className="mb-3">
                          <div
                            className="flex gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar"
                            style={{
                              scrollSnapType: "x mandatory",
                              WebkitOverflowScrolling: "touch",
                            }}
                          >
                            {item.imageUrls.slice(0, 5).map((url, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="flex-shrink-0"
                                style={{ scrollSnapAlign: "start" }}
                              >
                                <div className="w-[60px] h-[60px] rounded-lg overflow-hidden border-2 border-primary-orange shadow-sm">
                                  <img
                                    src={url}
                                    alt={`Image ${
                                      imgIndex + 1
                                    } of book ${displayIndex}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Title, Style, and Price */}
                      <div className="mb-3">
                        {/* Title - Smaller size */}
                        <h3 className="text-sm font-body text-dark-gray mb-1">
                          {t("cart.book")} {displayIndex}
                        </h3>
                        {/* Color Style - Above price */}
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
                        {/* Price - Bolder weight */}
                        <p className="text-sm font-body-bold text-dark-gray text-right" dir="ltr">
                          {displayIndex > 1 ? (
                            <>
                              <span>₪ {DISCOUNTED_BOOK_PRICE}</span>
                              <span className="line-through text-medium-gray ml-2">
                                {BOOK_PRICE}
                              </span>
                            </>
                          ) : (
                            <>₪ {BOOK_PRICE}</>
                          )}
                        </p>
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
                  {[...cart.items]
                    .reverse()
                    .reduce(
                      (sum, item, index) =>
                        sum +
                        (index % 2 === 0 ? BOOK_PRICE : DISCOUNTED_BOOK_PRICE) *
                          item.quantity,
                      0
                    )}{" "}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="!text-center">
            <DialogTitle className="font-body-bold text-dark-gray mt-4">
              {t("cart.removeItem")}
            </DialogTitle>
            <DialogDescription className="font-body text-medium-gray">
              {t("cart.removeConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2 sm:gap-0 mt-4">
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
