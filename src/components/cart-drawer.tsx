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
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import { BOOK_PRICE } from "@/lib/constants";
import { ShoppingCart, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { QuantityControls } from "@/components/quantity-controls";
import { useLanguage } from "@/lib/LanguageContext";

export function CartDrawer() {
  const { cart, isLoading, removeFromCart, updateQuantity } = useCart();
  const { t, locale } = useLanguage();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const router = useRouter();

  const handleRemoveClick = (lineId: string) => {
    setItemToRemove(lineId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    setIsRemoving(itemToRemove);
    setShowConfirmDialog(false);
    setIsActionLoading(true);
    try {
      await removeFromCart([itemToRemove]);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsActionLoading(false);
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

  const showDrawerSpinner = isLoading && !isActionLoading;

  const handleQuantityChange = async (lineId: string, newQuantity: number) => {
    setIsActionLoading(true);
    try {
      await updateQuantity(lineId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-dark-gray cursor-pointer hover:bg-transparent"
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
                  const itemTotal = item.quantity * BOOK_PRICE;
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
                      {/* X Icon for Quick Removal */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClick(item.lineId || item.id);
                        }}
                        className="absolute top-2 left-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center shadow-md transition-all z-10 cursor-pointer"
                        disabled={isActionLoading}
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

                      {/* Title and Price - Below Images */}
                      <div className="mb-3">
                        {/* Title - Smaller size */}
                        <h3 className="text-sm font-body text-dark-gray mb-1">
                          {t("cart.book")} {displayIndex}
                        </h3>
                        {/* Price - Bolder weight */}
                        <p className="text-sm font-body-bold text-dark-gray">
                          {BOOK_PRICE} ₪
                        </p>
                      </div>

                      {/* Item Details with inline values */}
                      <div className="text-xs text-medium-gray font-body space-y-0.5 mb-2">
                        <div>
                          <span>{t("cart.quantity")} </span>
                          <span className="font-body text-dark-gray">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <span>{t("cart.itemTotal")} </span>
                          <span className="font-body text-dark-gray">
                            {itemTotal} ₪
                          </span>
                        </div>
                      </div>

                      {/* Combined Quantity Controls */}
                      <div>
                        <QuantityControls
                          quantity={item.quantity}
                          onIncrease={() =>
                            handleQuantityChange(
                              item.lineId || item.id,
                              item.quantity + 1
                            )
                          }
                          onDecrease={() =>
                            handleQuantityChange(
                              item.lineId || item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          onDelete={() =>
                            handleRemoveClick(item.lineId || item.id)
                          }
                          isLoading={isActionLoading}
                          isDeleting={isRemoving === item.id && isActionLoading}
                          disabled={isActionLoading}
                          size="sm"
                        />
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
                  onClick={() => router.push("/upload")}
                  className="mt-4 bg-primary-orange hover:bg-primary-orange/90 text-white cursor-pointer"
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
                  {cart.items.reduce(
                    (sum, item) => sum + item.quantity * BOOK_PRICE,
                    0
                  )}{" "}
                  ₪
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-body-bold py-3 cursor-pointer"
                disabled={isLoading || isActionLoading}
                style={{
                  cursor:
                    isLoading || isActionLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading || isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("cart.loading")}
                  </>
                ) : (
                  t("cart.checkout")
                )}
              </Button>
              <Button
                onClick={() => router.push("/cart")}
                variant="outline"
                className="w-full mt-2 border-primary-orange text-primary-orange hover:bg-primary-orange/10 cursor-pointer"
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
              onClick={handleConfirmRemove}
              className="bg-primary-orange hover:bg-primary-orange/90 text-white font-body-bold cursor-pointer"
            >
              {t("cart.remove")}
            </Button>
            <Button
              onClick={handleCancelRemove}
              variant="outline"
              className="border-gray-300 text-dark-gray hover:bg-gray-50 font-body-bold cursor-pointer"
            >
              {t("cart.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
