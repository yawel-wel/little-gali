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
import {
  BOOK_PRICE,
  DISCOUNTED_BOOK_PRICE,
  FRAMED_ART_UNIT_PRICE,
} from "@/lib/constants";
import { ArrowRight, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Button from "@mui/material/Button";
import { trackInitiateCheckout } from "@/lib/meta-pixel-events";
import { CartItemGeneratedAvatars } from "@/components/cart-item-generated-avatars";
import { CartSuggestProducts } from "@/components/cart-suggest-products";
import { CartOrderSummary } from "@/components/cart-order-summary";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import { CartLinePrice } from "@/components/cart-line-price";
import { getCartItemAvatarPreview } from "@/lib/cart-item-preview-urls";
import { resolveCartLinePrice } from "@/components/cart-line-price";

export default function CartPage() {
  const { cart, isLoading, removeFromCart, fetchCart } = useCart();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [isOptimisticAdding, setIsOptimisticAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [addGiftMessage, setAddGiftMessage] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [isUpdatingGiftMessage, setIsUpdatingGiftMessage] = useState(false);
  const giftMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh cart when opening /cart (fetchCart is stable unless locale changes).
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const flag = sessionStorage.getItem("adding_to_cart");
        if (flag === "1") {
          setIsOptimisticAdding(true);
        }
      }
    } catch {}
    const savedCartId = localStorage.getItem("shopify_cart_id");
    if (savedCartId) {
      void fetchCart(savedCartId);
    }
  }, [fetchCart]);

  useEffect(() => {
    // Clear optimistic state once cart is loaded
    if (cart && cart.items.length > 0) {
      setIsOptimisticAdding(false);
    }
  }, [cart]);

  // Load gift message from cart attributes
  useEffect(() => {
    if (cart?.id) {
      // Fetch cart attributes to get the current consent value
      const loadConsent = async () => {
        try {
          const response = await fetch("/api/shopify/cart/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId: cart.id }),
          });
          const data = await response.json();
          if (data.cart?.attributes) {
            const giftMessageEnabledAttr = data.cart.attributes.find(
              (attr: any) => attr.key === "_gift_message_enabled"
            );
            if (giftMessageEnabledAttr?.value === "true") {
              setAddGiftMessage(true);
            }
            
            const giftMessageAttr = data.cart.attributes.find(
              (attr: any) => attr.key === "_gift_message"
            );
            if (giftMessageAttr?.value) {
              setGiftMessage(giftMessageAttr.value);
            }
          }
        } catch (error) {
          console.error("Error loading consent:", error);
        }
      };
      loadConsent();
    }
  }, [cart?.id]);

  const handleGiftMessageCheckboxChange = async (checked: boolean) => {
    if (!cart?.id || isUpdatingGiftMessage) return;
    
    setAddGiftMessage(checked);
    setIsUpdatingGiftMessage(true);
    
    // If unchecking, also clear the message
    if (!checked) {
      setGiftMessage("");
    }
    
    try {
      const attributes = [
        { key: "_gift_message_enabled", value: checked ? "true" : "false" },
      ];
      
      // If unchecking, also clear the stored message
      if (!checked) {
        attributes.push({ key: "_gift_message", value: "" });
      }
      
      const response = await fetch("/api/shopify/cart/update-attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          attributes,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update gift message setting");
      }
    } catch (error) {
      console.error("Error updating gift message setting:", error);
      // Revert on error
      setAddGiftMessage(!checked);
    } finally {
      setIsUpdatingGiftMessage(false);
    }
  };

  const handleGiftMessageChange = (message: string) => {
    // Limit to 200 characters
    const limitedMessage = message.slice(0, 200);
    setGiftMessage(limitedMessage);
    
    // Clear existing timeout
    if (giftMessageTimeoutRef.current) {
      clearTimeout(giftMessageTimeoutRef.current);
    }
    
    // Set new timeout to save after user stops typing (500ms delay)
    giftMessageTimeoutRef.current = setTimeout(async () => {
      if (!cart?.id) return;
      
      setIsUpdatingGiftMessage(true);
      
      try {
        const response = await fetch("/api/shopify/cart/update-attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartId: cart.id,
            attributes: [
              { key: "_gift_message", value: limitedMessage },
            ],
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to update gift message");
        }
      } catch (error) {
        console.error("Error updating gift message:", error);
      } finally {
        setIsUpdatingGiftMessage(false);
      }
    }, 500);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (giftMessageTimeoutRef.current) {
        clearTimeout(giftMessageTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main id="main-content" className="flex-1">
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
                      // Count only paper books for display index (skip gift cards)
                      const reversedItems = [...cart.items].reverse();
                      const paperBooksBeforeThis = reversedItems
                        .slice(0, reversedIndex + 1)
                        .filter((i) => !i.isGiftCard && !i.isFramedArt).length;
                      const displayIndex = paperBooksBeforeThis;
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
                          {!item.isFramedArt &&
                            getCartItemAvatarPreview(item).expectedCount > 0 && (
                            <CartItemGeneratedAvatars
                              item={item}
                              locale={locale}
                              className="mb-4"
                            />
                          )}

                          {/* Title, Style, and Price */}
                          <div className="mb-4">
                            {item.isGiftCard ? (
                              <>
                                {/* Gift Card Title */}
                                <h3
                                  className={`text-sm md:text-base font-body-bold text-dark-gray mb-1 ${
                                    locale === "en" ? "text-left" : "text-right"
                                  }`}
                                >
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
                                <div className="flex items-start gap-4" dir="ltr">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveClick(item.lineId || item.id);
                                    }}
                                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 md:cursor-pointer md:transition-opacity md:hover:opacity-70"
                                    disabled={
                                      isLoading ||
                                      isRemoving === (item.lineId || item.id)
                                    }
                                    aria-label={t("cart.removeItem")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>

                                  <div className="flex flex-1 items-start justify-end gap-3">
                                    <div
                                      className={`min-w-0 ${
                                        locale === "en" ? "text-left" : "text-right"
                                      }`}
                                    >
                                      <h3 className="text-sm md:text-base font-body-bold text-dark-gray">
                                        {t("cart.framedArtTitle")}
                                      </h3>
                                      <div className="mt-1 text-sm text-medium-gray font-body">
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
                                        className="mt-3"
                                        {...resolveCartLinePrice(item, {
                                          total: FRAMED_ART_UNIT_PRICE,
                                        })}
                                      />
                                    </div>

                                    {(item.framedImageUrl ??
                                      item.imageUrls?.[0]) && (
                                      <div className="shrink-0 w-[5.4rem]">
                                        <FramedArtFrameMockup
                                          imageUrl={
                                            item.framedImageUrl ??
                                            item.imageUrls?.[0]
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
                                {/* Title - Smaller size, regular weight */}
                                <h3
                                  className={`text-sm md:text-base font-body-bold text-dark-gray mb-1 ${
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
                                    {...resolveCartLinePrice(
                                      item,
                                      displayIndex % 2 === 0
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
                    <CartSuggestProducts />
                  </div>

                  {/* Right Column: Order Summary (Desktop) - Sticky */}
                  <div className="hidden md:block md:w-80 md:flex-shrink-0">
                    <div className="sticky top-4">
                      <CartOrderSummary
                        totalQuantity={cart.totalQuantity}
                        totalAmount={cart.totalAmount}
                        addGiftMessage={addGiftMessage}
                        giftMessage={giftMessage}
                        isCheckingOut={isCheckingOut}
                        isLoading={isLoading}
                        isUpdatingGiftMessage={isUpdatingGiftMessage}
                        onGiftMessageCheckboxChange={handleGiftMessageCheckboxChange}
                        onGiftMessageChange={handleGiftMessageChange}
                        onCheckout={handleCheckout}
                        giftCheckboxId="addGiftMessage"
                      />
                    </div>
                  </div>

                  {/* Mobile: Order Summary Below Items */}
                  <div className="md:hidden mt-6">
                    <CartOrderSummary
                      totalQuantity={cart.totalQuantity}
                      totalAmount={cart.totalAmount}
                      addGiftMessage={addGiftMessage}
                      giftMessage={giftMessage}
                      isCheckingOut={isCheckingOut}
                      isLoading={isLoading}
                      isUpdatingGiftMessage={isUpdatingGiftMessage}
                      onGiftMessageCheckboxChange={handleGiftMessageCheckboxChange}
                      onGiftMessageChange={handleGiftMessageChange}
                      onCheckout={handleCheckout}
                      giftCheckboxId="addGiftMessageMobile"
                    />
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
        <DialogContent className="w-[calc(100%-2.5rem)] max-w-[425px]">
          <DialogHeader
            className={locale === "en" ? "!text-left" : "!text-center"}
          >
            <DialogTitle
              className={`font-body-bold text-dark-gray ${
                locale === "en" ? "text-left" : "text-right mr-10"
              }`}
            >
              {t("cart.removeItem")}
            </DialogTitle>
            <DialogDescription
              className={`font-body text-medium-gray ${
                locale === "en" ? "text-left" : "text-right mr-10"
              }`}
            >
              {t("cart.removeConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            className={`${
              locale === "en" ? "flex-row" : "flex-row-reverse"
            } gap-2 mt-4`}
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
