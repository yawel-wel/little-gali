"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
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
import { ArrowRight, Loader2, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Button from "@mui/material/Button";

export default function CartPage() {
  const { cart, isLoading, removeFromCart, fetchCart } = useCart();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [isOptimisticAdding, setIsOptimisticAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Fetch cart on mount if we have a cart ID
  useEffect(() => {
    // Detect optimistic adding to avoid empty flash
    try {
      if (typeof window !== "undefined") {
        const flag = sessionStorage.getItem("adding_to_cart");
        if (flag === "1") {
          setIsOptimisticAdding(true);
        }
      }
    } catch {}
    const savedCartId = localStorage.getItem("shopify_cart_id");
    if (savedCartId && !cart) {
      fetchCart(savedCartId);
    }
  }, [cart, fetchCart]);

  useEffect(() => {
    // Clear optimistic state once cart is loaded
    if (cart && cart.items.length > 0) {
      setIsOptimisticAdding(false);
    }
  }, [cart]);

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

  // Edit functionality removed: books can only be created via normal flow and not edited from cart

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      setIsCheckingOut(true);
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

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main className="flex-1">
        <section
          className="relative py-10 lg:py-16 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Title */}
              <div className="text-center space-y-4">
                <Title
                  highlightText={t("cart.titleHighlight")}
                  size="xl"
                  roundedUnderline
                  className="font-bold"
                >
                  {t("cart.title")}
                </Title>
              </div>

              {/* Cart Content */}
              {isOptimisticAdding || (isLoading && !cart) ? (
                <div
                  className="min-h-[200px] flex items-center justify-center"
                  style={{ backgroundColor: "#F3EEE8" }}
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
                </div>
              ) : cart && cart.items.length > 0 ? (
                <div className="md:flex md:gap-6 md:items-start">
                  {/* Left Column: Cart Items */}
                  <div className="md:flex-1 space-y-4">
                    {[...cart.items].reverse().map((item, reversedIndex) => {
                      const displayIndex = reversedIndex + 1;
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm relative"
                        >
                          {/* Loader Overlay - Show only on the item being removed */}
                          {isRemoving === (item.lineId || item.id) && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-50">
                              <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
                            </div>
                          )}
                          {/* X Icon for Quick Removal */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClick(item.lineId || item.id);
                            }}
                            className={`absolute top-3 w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center shadow-md transition-all z-10 cursor-pointer ${
                              locale === "en" ? "right-3" : "left-3"
                            }`}
                            disabled={
                              isLoading ||
                              isRemoving === (item.lineId || item.id)
                            }
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {/* Images Section - Centered */}
                          {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="mb-4">
                              {/* Mobile: Scrollable row */}
                              <div className="md:hidden">
                                <div
                                  className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar justify-center"
                                  style={{
                                    scrollSnapType: "x mandatory",
                                    WebkitOverflowScrolling: "touch",
                                  }}
                                >
                                  {item.imageUrls
                                    .slice(0, 5)
                                    .map((url, imgIndex) => (
                                      <div
                                        key={imgIndex}
                                        className="flex-shrink-0"
                                        style={{ scrollSnapAlign: "start" }}
                                      >
                                        <div className="w-[65px] h-[65px] rounded-lg overflow-hidden border-2 border-primary-orange shadow-sm">
                                          <img
                                            src={url}
                                            alt={`Image ${
                                              imgIndex + 1
                                            } of book ${displayIndex}`}
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                            decoding="async"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                              {/* Desktop: All 5 images visible - centered */}
                              <div className="hidden md:flex gap-2 justify-center">
                                {item.imageUrls
                                  .slice(0, 5)
                                  .map((url, imgIndex) => (
                                    <div
                                      key={imgIndex}
                                      className="flex-shrink-0"
                                    >
                                      <div className="w-[75px] h-[75px] rounded-lg overflow-hidden border-2 border-primary-orange shadow-sm">
                                        <img
                                          src={url}
                                          alt={`Image ${
                                            imgIndex + 1
                                          } of book ${displayIndex}`}
                                          className="w-full h-full object-cover"
                                          loading="eager"
                                          decoding="async"
                                        />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Title, Style, and Price */}
                          <div className="mb-4">
                            {/* Title - Smaller size, regular weight */}
                            <h3
                              className={`text-sm md:text-base font-body text-dark-gray mb-1 ${
                                locale === "en" ? "text-left" : "text-right"
                              }`}
                            >
                              {t("cart.book")} {displayIndex}
                            </h3>
                            {/* Color Style - Above price */}
                            <div
                              className={`text-sm text-medium-gray font-body mb-1 ${
                                locale === "en" ? "text-left" : "text-right"
                              }`}
                            >
                              <span>{t("cart.colorStyle")} </span>
                              <span className="font-body text-dark-gray">
                                {item.style === "cartoon"
                                  ? t("cart.style.cartoon")
                                  : item.style === "pencil"
                                  ? t("cart.style.pencil")
                                  : t("cart.style.cartoon")}
                              </span>
                            </div>
                            {/* Price - Smaller size, bolder weight */}
                            <p
                              className={`text-sm md:text-base font-body-bold text-dark-gray ${
                                locale === "en" ? "text-left" : "text-right"
                              }`}
                            >
                              {displayIndex > 1 ? (
                                <>
                                  <span className="line-through text-medium-gray mr-2">
                                    {BOOK_PRICE}
                                  </span>
                                  <span>{DISCOUNTED_BOOK_PRICE} ₪</span>
                                </>
                              ) : (
                                <>{BOOK_PRICE} ₪</>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Order Summary (Desktop) - Sticky */}
                  <div className="hidden md:block md:w-80 md:flex-shrink-0">
                    <div className="sticky top-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2
                          className={`text-xl font-body-bold text-dark-gray mb-4 ${
                            locale === "en" ? "text-left" : "text-right"
                          }`}
                        >
                          {t("cart.orderSummary")}
                        </h2>
                        <div className="space-y-3">
                          <div
                            className={`flex justify-between items-center ${
                              locale === "en" ? "flex-row" : "flex-row-reverse"
                            }`}
                          >
                            {locale === "he" ? (
                              <>
                                <span className="font-body-bold text-dark-gray">
                                  {cart.totalQuantity}
                                </span>
                                <span className="text-medium-gray font-body">
                                  {t("cart.itemsCount")}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-medium-gray font-body">
                                  {t("cart.itemsCount")}
                                </span>
                                <span className="font-body-bold text-dark-gray">
                                  {cart.totalQuantity}
                                </span>
                              </>
                            )}
                          </div>
                          <div
                            className={`flex justify-between items-center ${
                              locale === "en" ? "flex-row" : "flex-row-reverse"
                            }`}
                          >
                            {locale === "he" ? (
                              <>
                                <span className="text-xl font-body-bold text-black">
                                  {cart.items.reduce(
                                    (sum, item, index) =>
                                      sum +
                                      (index === 0
                                        ? BOOK_PRICE
                                        : DISCOUNTED_BOOK_PRICE) *
                                        item.quantity,
                                    0
                                  )}{" "}
                                  ₪
                                </span>
                                <span className="text-medium-gray font-body">
                                  {t("cart.total")}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-medium-gray font-body">
                                  {t("cart.total")}
                                </span>
                                <span className="text-xl font-body-bold text-black">
                                  {cart.items.reduce(
                                    (sum, item, index) =>
                                      sum +
                                      (index === 0
                                        ? BOOK_PRICE
                                        : DISCOUNTED_BOOK_PRICE) *
                                        item.quantity,
                                    0
                                  )}{" "}
                                  ₪
                                </span>
                              </>
                            )}
                          </div>
                          <div className="pt-4 border-t border-gray-200">
                            <p
                              className={`text-sm text-medium-gray font-body mb-4 ${
                                locale === "en" ? "text-left" : "text-right"
                              }`}
                            >
                              {t("cart.deliveryTime")}
                            </p>
                            <p
                              className={`text-sm text-medium-gray font-body ${
                                locale === "en" ? "text-left" : "text-right"
                              }`}
                            >
                              {t("cart.readyMessage")}
                            </p>
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <div className="mt-6">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCheckout}
                            disabled={isCheckingOut || isLoading}
                            className="w-full cursor-pointer"
                            sx={{
                              borderRadius: "12px",
                              textTransform: "none",
                              fontSize: "0.95rem",
                              fontWeight: 700,
                              py: 1.1,
                              minHeight: 44,
                            }}
                          >
                            {isCheckingOut ? (
                              <>
                                <Loader2
                                  className={`w-5 h-5 animate-spin ${
                                    locale === "en" ? "mr-2" : "ml-2"
                                  }`}
                                />
                                {t("cart.checkoutProgress")}
                              </>
                            ) : (
                              t("cart.checkout")
                            )}
                          </Button>
                        </div>

                        {/* Add Book Button */}
                        <div className="mt-3">
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => router.push("/upload")}
                            className="w-full cursor-pointer"
                            sx={{
                              borderRadius: "12px",
                              textTransform: "none",
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              py: 0.9,
                              minHeight: 40,
                              borderWidth: 2,
                            }}
                          >
                            {t("cart.addBook")}
                          </Button>
                          <p
                            className={`text-sm font-body text-medium-gray text-center mt-2 ${
                              locale === "en" ? "text-left" : "text-right"
                            }`}
                          >
                            {t("cart.secondBook")}
                          </p>
                          <p
                            className={`text-xs font-body text-medium-gray text-center mt-1 ${
                              locale === "en" ? "text-left" : "text-right"
                            }`}
                          >
                            {t("cart.discountNote")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Order Summary Below Items */}
                  <div className="md:hidden space-y-6 mt-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h2
                        className={`text-xl font-body-bold text-dark-gray mb-4 ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                      >
                        {t("cart.orderSummary")}
                      </h2>
                      <div className="space-y-3">
                        <div
                          className={`flex justify-between items-center ${
                            locale === "en" ? "flex-row" : "flex-row-reverse"
                          }`}
                        >
                          {locale === "he" ? (
                            <>
                              <span className="font-body-bold text-dark-gray">
                                {cart.totalQuantity}
                              </span>
                              <span className="text-medium-gray font-body">
                                {t("cart.itemsCount")}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-medium-gray font-body">
                                {t("cart.itemsCount")}
                              </span>
                              <span className="font-body-bold text-dark-gray">
                                {cart.totalQuantity}
                              </span>
                            </>
                          )}
                        </div>
                        <div
                          className={`flex justify-between items-center ${
                            locale === "en" ? "flex-row" : "flex-row-reverse"
                          }`}
                        >
                          {locale === "he" ? (
                            <>
                              <span className="text-xl font-body-bold text-black">
                                {cart.items.reduce(
                                  (sum, item, index) =>
                                    sum +
                                    (index === 0
                                      ? BOOK_PRICE
                                      : DISCOUNTED_BOOK_PRICE) *
                                      item.quantity,
                                  0
                                )}{" "}
                                ₪
                              </span>
                              <span className="text-medium-gray font-body">
                                {t("cart.total")}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-medium-gray font-body">
                                {t("cart.total")}
                              </span>
                              <span className="text-xl font-body-bold text-black">
                                {cart.items.reduce(
                                  (sum, item, index) =>
                                    sum +
                                    (index === 0
                                      ? BOOK_PRICE
                                      : DISCOUNTED_BOOK_PRICE) *
                                      item.quantity,
                                  0
                                )}{" "}
                                ₪
                              </span>
                            </>
                          )}
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <p
                            className={`text-sm text-medium-gray font-body mb-4 ${
                              locale === "en" ? "text-left" : "text-right"
                            }`}
                          >
                            {t("cart.deliveryTime")}
                          </p>
                          <p
                            className={`text-sm text-medium-gray font-body ${
                              locale === "en" ? "text-left" : "text-right"
                            }`}
                          >
                            {t("cart.readyMessage")}
                          </p>
                        </div>
                      </div>

                      {/* Checkout Button */}
                      <div className="mt-6 space-y-3">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleCheckout}
                          disabled={isCheckingOut || isLoading}
                          className="w-full cursor-pointer"
                          sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            py: 1.1,
                            minHeight: 44,
                          }}
                        >
                          {isCheckingOut ? (
                            <>
                              <Loader2
                                className={`w-5 h-5 animate-spin ${
                                  locale === "en" ? "mr-2" : "ml-2"
                                }`}
                              />
                              {t("cart.checkoutProgress")}
                            </>
                          ) : (
                            t("cart.checkout")
                          )}
                        </Button>

                        {/* Add Book Button */}
                        <div>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => router.push("/upload")}
                            className="w-full cursor-pointer"
                            sx={{
                              borderRadius: "12px",
                              textTransform: "none",
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              py: 0.9,
                              minHeight: 40,
                              borderWidth: 2,
                            }}
                          >
                            {t("cart.addBook")}
                          </Button>
                          <p
                            className={`text-sm font-body text-medium-gray text-center mt-2 ${
                              locale === "en" ? "text-left" : "text-right"
                            }`}
                          >
                            {t("cart.secondBook")}
                          </p>
                          <p
                            className={`text-xs font-body text-medium-gray text-center mt-1 ${
                              locale === "en" ? "text-left" : "text-right"
                            }`}
                          >
                            {t("cart.discountNote")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-body-bold text-dark-gray mb-4 text-center">
                    {t("cart.empty")}
                  </h2>
                  <p className="text-medium-gray font-body mb-8 text-center">
                    {t("cart.startCreating")}
                  </p>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push("/upload")}
                    className="cursor-pointer"
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      py: 0.9,
                      px: 3,
                      minHeight: 40,
                    }}
                  >
                    {t("cart.createBook")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader
            className={locale === "en" ? "!text-left" : "!text-center"}
          >
            <DialogTitle
              className={`font-body-bold text-dark-gray mt-4 ${
                locale === "en" ? "text-left" : "text-right"
              }`}
            >
              {t("cart.removeItem")}
            </DialogTitle>
            <DialogDescription
              className={`font-body text-medium-gray ${
                locale === "en" ? "text-left" : "text-right"
              }`}
            >
              {t("cart.removeConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            className={`${
              locale === "en" ? "flex-row" : "flex-row-reverse"
            } gap-2 sm:gap-0 mt-4`}
          >
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
    </div>
  );
}
