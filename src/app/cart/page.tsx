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
import type { CartItem } from "@/lib/CartContext";
import {
  BOOK_COLOR_LABEL_KEYS,
  BOOK_COLOR_SWATCHES,
  type BookColor,
} from "@/lib/book-color";
import { ArrowRight, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Button from "@mui/material/Button";
import { trackInitiateCheckout } from "@/lib/meta-pixel-events";
import { CartItemGeneratedAvatars } from "@/components/cart-item-generated-avatars";
import { CartSuggestProducts } from "@/components/cart-suggest-products";
import { CartOrderSummary } from "@/components/cart-order-summary";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";
import { QuantityControls } from "@/components/quantity-controls";
import { CartLineItemHeader } from "@/components/cart-line-item-header";
import { CartLineItemDetails } from "@/components/cart-line-item-details";
import { getCartItemAvatarPreview } from "@/lib/cart-item-preview-urls";
import { getCartItemLinePricing } from "@/lib/cart-line-pricing";
import { isAddingToCart } from "@/lib/cart-add-pending";
import { cartLineIdsMatch } from "@/lib/shopify/cart-line-id-match";
import {
  giftMessageFromCartNote,
  GIFT_MESSAGE_MAX_LENGTH,
} from "@/lib/shopify/cart-gift-note";
import {
  BLANKET_PATTERN_LABEL_KEYS,
  BLANKET_SWATCH_IMAGES,
} from "@/lib/blanket";
import Image from "next/image";

function getLineId(item: CartItem): string {
  return item.lineId || item.id;
}

function getStyleLabel(
  style: CartItem["style"],
  t: (key: string) => string,
): string | undefined {
  if (style === "pens" || !style) return undefined;
  if (style === "cartoon") return t("cart.style.cartoon");
  if (style === "pencil") return t("cart.style.pencil");
  if (style === "watercolor") return t("cart.style.watercolor");
  if (style === "colorful") return t("cart.style.colorful");
  return t("cart.style.cartoon");
}

function getBookTypeLabel(
  bookFlow: CartItem["bookFlow"],
  t: (key: string) => string,
): string | undefined {
  if (bookFlow === "colorful") return t("cart.type.colorful");
  if (bookFlow === "classic") return t("cart.type.classic");
  return undefined;
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

function CartAddingItemRow({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[4.5rem] items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:min-h-[5rem] md:p-5"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className="h-5 w-5 shrink-0 animate-spin text-primary-orange"
        aria-hidden
      />
      <p className="font-body text-sm text-medium-gray">{label}</p>
    </div>
  );
}

function readAddingToCartFlag(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return isAddingToCart();
  } catch {
    return false;
  }
}

export default function CartPage() {
  const {
    cart,
    isLoading,
    removeFromCart,
    updateQuantity,
    fetchCart,
    resetCart,
    updateCartNote,
  } = useCart();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [isOptimisticAdding, setIsOptimisticAdding] = useState(readAddingToCartFlag);
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [isResettingCart, setIsResettingCart] = useState(false);
  const [addGiftMessage, setAddGiftMessage] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const giftHydratedRef = useRef(false);
  const giftTouchedRef = useRef(false);
  const giftMessageRef = useRef("");
  const addGiftMessageRef = useRef(false);
  const isPendingAdd = isOptimisticAdding || readAddingToCartFlag();

  // Refresh cart when opening /cart. Defer fetch while an add is in flight so we
  // don't overwrite the cart with stale data or clear the pending UI too early.
  useEffect(() => {
    let cancelled = false;

    const runFetch = (options?: { silent?: boolean }) => {
      if (cancelled) return;
      // Re-read after pending clears — add-to-cart may have written a new cart id.
      const savedCartId = localStorage.getItem("shopify_cart_id");
      if (!savedCartId) {
        return;
      }
      void fetchCart(savedCartId, options);
    };

    if (readAddingToCartFlag()) {
      const interval = window.setInterval(() => {
        if (!readAddingToCartFlag()) {
          window.clearInterval(interval);
          // Silent: context often already holds the just-added cart.
          runFetch({ silent: true });
        }
      }, 200);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
      };
    }

    runFetch();
    return () => {
      cancelled = true;
    };
  }, [fetchCart]);

  useEffect(() => {
    if (!readAddingToCartFlag()) {
      setIsOptimisticAdding(false);
      return;
    }
    setIsOptimisticAdding(true);
    const interval = window.setInterval(() => {
      setIsOptimisticAdding(readAddingToCartFlag());
    }, 200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    giftMessageRef.current = giftMessage;
  }, [giftMessage]);

  useEffect(() => {
    addGiftMessageRef.current = addGiftMessage;
  }, [addGiftMessage]);

  useEffect(() => {
    if (!cart || giftHydratedRef.current || cart.note === undefined) {
      return;
    }
    giftHydratedRef.current = true;
    if (giftTouchedRef.current) {
      return;
    }
    const message = giftMessageFromCartNote(cart.note);
    if (message) {
      setAddGiftMessage(true);
      setGiftMessage(message);
    }
  }, [cart]);

  const persistGiftNote = useCallback(
    async (note: string) => {
      if (!cart?.id) {
        return;
      }
      if (!giftHydratedRef.current && !giftTouchedRef.current) {
        return;
      }
      await updateCartNote(note);
    },
    [cart?.id, updateCartNote],
  );

  const handleGiftMessageCheckboxChange = (checked: boolean) => {
    giftTouchedRef.current = true;
    setAddGiftMessage(checked);
    if (!checked) {
      setGiftMessage("");
      void persistGiftNote("").catch((error) => {
        console.error("Error saving gift message:", error);
      });
    }
  };

  const handleGiftMessageChange = (message: string) => {
    giftTouchedRef.current = true;
    setGiftMessage(message.slice(0, GIFT_MESSAGE_MAX_LENGTH));
  };

  const handleGiftMessageBlur = () => {
    if (!addGiftMessageRef.current) {
      return;
    }
    void persistGiftNote(giftMessageRef.current).catch((error) => {
      console.error("Error saving gift message:", error);
    });
  };

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
    setQuantityError(null);
    try {
      await updateQuantity(lineId, nextQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setQuantityError(
        error instanceof Error ? error.message : t("cart.quantityUpdateFailed"),
      );
    } finally {
      setBusyLineId(null);
    }
  };

  const quantityUpdateInFlightRef = useRef<string | null>(null);

  const adjustQuantity = (lineId: string, delta: number) => {
    if (quantityUpdateInFlightRef.current === lineId) return;
    const item = cart?.items.find((i) => cartLineIdsMatch(getLineId(i), lineId));
    if (!item) return;
    const current = item.quantity > 0 ? item.quantity : 1;
    const next = current + delta;
    if (next < 1) return;
    quantityUpdateInFlightRef.current = lineId;
    void handleQuantityChange(lineId, next).finally(() => {
      if (quantityUpdateInFlightRef.current === lineId) {
        quantityUpdateInFlightRef.current = null;
      }
    });
  };

  const renderQuantityControls = (item: CartItem) => {
    const lineId = getLineId(item);
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const isBusy = busyLineId === lineId;

    return (
      <QuantityControls
        quantity={quantity}
        disabled={isBusy || isPendingAdd}
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

  const handleResetCart = async () => {
    setIsResettingCart(true);
    setRemoveError(null);
    try {
      await resetCart();
    } catch (error) {
      console.error("Error resetting cart:", error);
    } finally {
      setIsResettingCart(false);
    }
  };

  // Edit functionality removed: books can only be created via normal flow and not edited from cart

  const handleCheckout = async () => {
    if (!cart?.id) return;

    setIsCheckingOut(true);

    try {
      const note = addGiftMessage ? giftMessage : "";
      const checkoutUrl = await updateCartNote(note);

      try {
        const totalValue = cart.totalAmount ? parseFloat(cart.totalAmount) : 0;
        trackInitiateCheckout(totalValue, cart.totalQuantity);
      } catch (err) {
        console.error("Error tracking InitiateCheckout:", err);
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      setIsCheckingOut(false);
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

              {(removeError || quantityError) && (
                <p
                  className="text-center text-sm font-body text-red-600"
                  role="alert"
                >
                  {removeError ?? quantityError}
                </p>
              )}

              {/* Cart Content */}
              {isLoading && !cart ? (
                <div
                  className="flex min-h-[120px] items-center justify-center gap-3"
                  style={{ backgroundColor: "#F3EEE8" }}
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary-orange" />
                  <span className="font-body text-sm text-medium-gray">
                    {t("cart.loading")}
                  </span>
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
                        .filter(
                          (i) =>
                            !i.isGiftCard &&
                            !i.isFramedArt &&
                            !i.isBambooBlanket &&
                            !i.isBirthPackage,
                        ).length;
                      const displayIndex = paperBooksBeforeThis;
                      const lineId = getLineId(item);
                      const isLineBusy = busyLineId === lineId;
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 md:px-5 md:pt-5 md:pb-4 shadow-sm relative"
                        >
                          {isLineBusy && (
                            <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-50">
                              <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
                            </div>
                          )}
                          {!item.isFramedArt &&
                            !item.isBambooBlanket &&
                            getCartItemAvatarPreview(item).expectedCount > 0 && (
                            <CartItemGeneratedAvatars
                              item={item}
                              locale={locale}
                              className="mb-4"
                            />
                          )}

                          <div>
                            {(() => {
                              const pricing = getCartItemLinePricing(
                                item,
                                item.isGiftCard ||
                                  item.isFramedArt ||
                                  item.isBambooBlanket ||
                                  item.isBirthPackage
                                  ? undefined
                                  : displayIndex,
                              );
                              const quantity =
                                item.quantity > 0 ? item.quantity : 1;
                              const bookColorDisplay = getBookColorDisplay(
                                item.bookColor,
                                t,
                              );
                              const blanketPattern =
                                item.blanketPattern ?? "dots";
                              const bookTypeLabel = getBookTypeLabel(
                                item.bookFlow,
                                t,
                              );
                              const details = (
                                <CartLineItemDetails
                                  locale={locale}
                                  colorValue={
                                    item.isBambooBlanket
                                      ? t(
                                          BLANKET_PATTERN_LABEL_KEYS[
                                            blanketPattern
                                          ],
                                        )
                                      : bookColorDisplay.label
                                  }
                                  colorSwatchSrc={
                                    item.isBambooBlanket
                                      ? BLANKET_SWATCH_IMAGES[blanketPattern]
                                      : bookColorDisplay.swatch
                                  }
                                  showColorRow={
                                    (!item.isGiftCard && !item.isFramedArt) ||
                                    Boolean(item.isBambooBlanket)
                                  }
                                  styleValue={
                                    item.isGiftCard || item.isBambooBlanket
                                      ? undefined
                                      : getStyleLabel(item.style, t)
                                  }
                                  showStyleRow={
                                    !item.isGiftCard &&
                                    !item.isBambooBlanket &&
                                    item.style !== "pens" &&
                                    Boolean(item.style)
                                  }
                                  typeValue={
                                    item.isGiftCard ||
                                    item.isFramedArt ||
                                    item.isBambooBlanket
                                      ? undefined
                                      : item.isBirthPackage
                                        ? `${bookTypeLabel} · ${t(BLANKET_PATTERN_LABEL_KEYS[blanketPattern])}`
                                        : bookTypeLabel
                                  }
                                  showTypeRow={
                                    !item.isGiftCard &&
                                    !item.isFramedArt &&
                                    !item.isBambooBlanket
                                  }
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

                              if (item.isBambooBlanket) {
                                return (
                                  <div
                                    className="flex items-start gap-3"
                                    dir={locale === "he" ? "rtl" : "ltr"}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <CartLineItemHeader
                                        title={t("cart.blanketTitle")}
                                        unitPrice={pricing.unitPrice}
                                        locale={locale}
                                      />
                                      {details}
                                    </div>
                                    {item.imageUrls?.[0] ? (
                                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#F3EEE8]">
                                        <Image
                                          src={item.imageUrls[0]}
                                          alt=""
                                          fill
                                          className="object-cover"
                                          sizes="80px"
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }

                              if (item.isFramedArt) {
                                return (
                                  <div
                                    className="flex items-start gap-3"
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
                                    {(item.framedImageUrl ??
                                      item.imageUrls?.[0]) && (
                                      <div className="shrink-0 w-[5.4rem] md:self-start">
                                        <FramedArtFrameMockup
                                          imageUrl={
                                            item.framedImageUrl ??
                                            item.imageUrls?.[0]
                                          }
                                          maxWidthClassName="w-full"
                                        />
                                      </div>
                                    )}
                                    {locale === "he" ? (
                                      <div
                                        className="hidden min-w-0 flex-1 md:block"
                                        aria-hidden
                                      />
                                    ) : null}
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <CartLineItemHeader
                                    title={
                                      item.isBirthPackage
                                        ? t("cart.birthPackageTitle").replace(
                                            "{pattern}",
                                            t(
                                              BLANKET_PATTERN_LABEL_KEYS[
                                                blanketPattern
                                              ],
                                            ),
                                          )
                                        : t("cart.book")
                                    }
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
                    {isPendingAdd && (
                      <CartAddingItemRow label={t("cart.addingItem")} />
                    )}
                    <CartSuggestProducts />
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        disabled={isResettingCart || isPendingAdd}
                        onClick={() => void handleResetCart()}
                        className="font-body text-sm text-medium-gray underline decoration-medium-gray/50 underline-offset-2 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("cart.clearAll")}
                      </button>
                    </div>
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
                        isLoading={isLoading || isPendingAdd}
                        onGiftMessageCheckboxChange={handleGiftMessageCheckboxChange}
                        onGiftMessageChange={handleGiftMessageChange}
                        onGiftMessageBlur={handleGiftMessageBlur}
                        onCheckout={() => void handleCheckout()}
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
                      isLoading={isLoading || isPendingAdd}
                      onGiftMessageCheckboxChange={handleGiftMessageCheckboxChange}
                      onGiftMessageChange={handleGiftMessageChange}
                      onGiftMessageBlur={handleGiftMessageBlur}
                      onCheckout={() => void handleCheckout()}
                      giftCheckboxId="addGiftMessageMobile"
                    />
                  </div>
                </div>
              ) : isPendingAdd ? (
                <div className="py-8">
                  <CartAddingItemRow label={t("cart.addingItem")} />
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
