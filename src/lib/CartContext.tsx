"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLanguage } from "./LanguageContext";
import { trackAddToCart, trackInitiateCheckout } from "./meta-pixel-events";
import { parseShopifyLineCost } from "./shopify/cart-line-cost";
import { cartLineIdsMatch } from "./shopify/cart-line-id-match";
import {
  extractColorUrlsFromAttributes,
  extractImagesFromLineAttributes,
} from "./cart-line-images";
import { mergeCartItemsByLineGroup } from "./shopify/merge-cart-items-by-group";
import { normalizeCartLineId } from "./shopify/normalize-cart-line-id";
import type { StoredCartImages } from "./cart-images-store";

export interface CartItem {
  id: string;
  quantity: number;
  imageUrls: string[];
  originalUrls?: string[];
  generatedBwUrls?: string[];
  generatedColorUrls?: string[];
  previewSessionId?: string;
  title?: string;
  lineId?: string;
  style?: "cartoon" | "pencil" | "watercolor";
  isGiftCard?: boolean;
  giftCardAmount?: number;
  isFramedArt?: boolean;
  framedImageUrl?: string;
  /** Line total after Shopify discounts (from Storefront API). */
  lineTotalAmount?: number;
  /** Line subtotal before discounts, when greater than lineTotalAmount. */
  lineCompareAmount?: number;
  /** Merged row: all underlying Shopify line ids when quantity > 1. */
  lineIds?: string[];
  lineGroupId?: string;
  attributes?: Array<{ key: string; value: string }>;
}

export interface PreviewGenerationStats {
  totalGenerations: number;
  selectedGenerationBySlot: number[];
}

export interface BookFulfillmentImages {
  originalUrls: string[];
  generatedBwUrls: string[];
  generatedColorUrls?: string[];
  previewSessionId: string;
  generationStats?: PreviewGenerationStats;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  totalAmount?: string;
  currencyCode?: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (
    imageUrls: string[],
    quantity?: number,
    bookId?: string,
    phoneNumber?: string,
    style?: "cartoon" | "pencil" | "watercolor",
    fulfillment?: BookFulfillmentImages
  ) => Promise<void>;
  addGiftCardToCart: (optionId: string) => Promise<void>;
  addFramedArtToCart: (
    sessionId: string,
    style: "cartoon" | "pencil" | "watercolor",
  ) => Promise<void>;
  removeFromCart: (lineIds: string[]) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  fetchCart: (cartId: string, options?: { silent?: boolean }) => Promise<void>;
  clearCart: () => void;
  /** Wipes local cart immediately; best-effort Shopify line cleanup in background. */
  resetCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const [cart, setCart] = useState<Cart | null>(null);
  // Start in loading state to avoid initial empty-state flicker until we check localStorage
  const [isLoading, setIsLoading] = useState(true);
  const fetchCartSeqRef = useRef(0);

  // Helper function to ensure checkoutUrl always has the current locale
  const ensureLocaleInCheckoutUrl = useCallback((checkoutUrl: string): string => {
    try {
      const url = new URL(checkoutUrl);
      // Always update the locale parameter to match current locale
      url.searchParams.set("locale", locale);
      return url.toString();
    } catch (e) {
      // If URL parsing fails, return original URL
      console.error("Error parsing checkout URL:", e);
      return checkoutUrl;
    }
  }, [locale]);

  const fetchCart = useCallback(async (cartId: string, options?: { silent?: boolean }) => {
    const seq = ++fetchCartSeqRef.current;
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      const response = await fetch("/api/shopify/cart/get", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId, locale }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart) {
          const cartAttributes = data.cart.attributes as
            | Array<{ key: string; value: string }>
            | undefined;

          const cartItems: CartItem[] = data.cart.lines.map((line: {
            id: string;
            quantity: number;
            title?: string;
            imageUrls?: string[];
            attributes?: Array<{ key: string; value: string }>;
            cost?: Parameters<typeof parseShopifyLineCost>[0];
            storedImages?: StoredCartImages | null;
          }) => {
            const stored = line.storedImages;
            const attrExtract = extractImagesFromLineAttributes(
              line.attributes,
              cartAttributes,
            );
            let imageUrls =
              line.imageUrls?.length ? line.imageUrls : attrExtract.imageUrls;
            let isFramedArt = attrExtract.isFramedArt;

            if (stored?.imageUrls?.length) {
              const validBook = stored.imageUrls.length === 5;
              const validFramed =
                stored.productType === "framed_art" &&
                stored.imageUrls.length >= 1;
              if (validBook || validFramed) {
                imageUrls = stored.imageUrls;
                isFramedArt = validFramed;
              }
            }

            let generatedColorUrls =
              stored?.generatedColorUrls ??
              extractColorUrlsFromAttributes(line.attributes);

            const isGiftCard = Boolean(
              line.attributes?.some(
                (attr) => attr.key === "_type" && attr.value === "gift_card",
              ),
            );

            let giftCardAmount: number | undefined;
            if (isGiftCard && line.attributes) {
              const amountAttr = line.attributes.find(
                (attr) => attr.key === "_gift_card_amount",
              );
              if (amountAttr?.value) {
                giftCardAmount = parseFloat(amountAttr.value);
              } else {
                const cost = line.cost as { totalAmount?: { amount?: string } };
                giftCardAmount = cost?.totalAmount?.amount
                  ? parseFloat(cost.totalAmount.amount)
                  : undefined;
              }
            }

            let style = stored?.style;
            if (!style && line.attributes && !isGiftCard) {
              const styleAttr = line.attributes.find(
                (attr) => attr.key === "style" || attr.key === "_style",
              );
              if (
                styleAttr &&
                (styleAttr.value === "cartoon" ||
                  styleAttr.value === "pencil" ||
                  styleAttr.value === "watercolor")
              ) {
                style = styleAttr.value;
              }
            }

            const framedImageUrl =
              isFramedArt && imageUrls[0]
                ? (stored?.framedImageUrl ?? imageUrls[0])
                : stored?.framedImageUrl;

            const linePricing = parseShopifyLineCost(line.cost);

            return {
              id: line.id,
              lineId: line.id,
              quantity: line.quantity,
              title: line.title,
              imageUrls: isGiftCard ? [] : imageUrls,
              originalUrls: isGiftCard ? undefined : stored?.originalUrls,
              generatedBwUrls: isGiftCard ? undefined : stored?.generatedBwUrls,
              generatedColorUrls: isGiftCard ? undefined : generatedColorUrls,
              previewSessionId: isGiftCard ? undefined : stored?.previewSessionId,
              style: isGiftCard ? undefined : style,
              isGiftCard,
              giftCardAmount,
              isFramedArt,
              framedImageUrl,
              lineTotalAmount: linePricing?.total,
              lineCompareAmount: linePricing?.compare,
              attributes: line.attributes,
            };
          });

          const displayItems = mergeCartItemsByLineGroup(cartItems);

          if (seq !== fetchCartSeqRef.current) {
            return;
          }

          setCart({
            id: data.cart.id,
            checkoutUrl: ensureLocaleInCheckoutUrl(data.cart.checkoutUrl),
            totalQuantity: data.cart.totalQuantity,
            totalAmount: data.cart.totalAmount,
            currencyCode: data.cart.currencyCode,
            items: displayItems,
          });
          localStorage.setItem("shopify_cart_id", data.cart.id);
        }
      } else {
        if (seq !== fetchCartSeqRef.current) {
          return;
        }
        // Cart not found or expired, clear it
        localStorage.removeItem("shopify_cart_id");
        setCart(null);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      if (seq === fetchCartSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [ensureLocaleInCheckoutUrl, locale]);

  // Defer cart I/O until after first paint so home/upload feel snappier.
  useEffect(() => {
    const run = () => {
      fetch("/api/warmup").catch(() => {});

      let savedCartId: string | null = null;
      try {
        savedCartId = localStorage.getItem("shopify_cart_id");
      } catch {
        setIsLoading(false);
        return;
      }

      if (savedCartId) {
        try {
          if (sessionStorage.getItem("adding_to_cart") === "1") {
            // Avoid a stale fetch racing with add-to-cart; /cart refreshes when done.
            return;
          }
        } catch {}
        void fetchCart(savedCartId);
      } else {
        setIsLoading(false);
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(run, 0);
    return () => window.clearTimeout(id);
  }, [fetchCart]);

  // Update checkoutUrl whenever locale changes (but not when cart changes to avoid loops)
  useEffect(() => {
    if (cart?.checkoutUrl) {
      const updatedUrl = ensureLocaleInCheckoutUrl(cart.checkoutUrl);
      if (updatedUrl !== cart.checkoutUrl) {
        setCart({
          ...cart,
          checkoutUrl: updatedUrl,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, ensureLocaleInCheckoutUrl]);

  const addToCart = async (
    imageUrls: string[],
    quantity: number = 1,
    bookId?: string,
    phoneNumber?: string,
    style?: "cartoon" | "pencil" | "watercolor",
    fulfillment?: BookFulfillmentImages
  ) => {
    setIsLoading(true);
    try {
      let response;
      if (cart?.id) {
        // Add to existing cart
        console.log("📤 CartContext: Sending to API - style:", style);
        response = await fetch("/api/shopify/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartId: cart.id,
            imageUrls,
            quantity,
            bookId,
            phoneNumber,
            style: style || "cartoon",
            locale,
            originalUrls: fulfillment?.originalUrls,
            generatedBwUrls: fulfillment?.generatedBwUrls,
            generatedColorUrls: fulfillment?.generatedColorUrls,
            previewSessionId: fulfillment?.previewSessionId,
            generationStats: fulfillment?.generationStats,
          }),
        });
      } else {
        // Create new cart
        response = await fetch("/api/shopify/cart/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrls,
            quantity,
            bookId,
            phoneNumber,
            style: style || "cartoon",
            locale,
            originalUrls: fulfillment?.originalUrls,
            generatedBwUrls: fulfillment?.generatedBwUrls,
            generatedColorUrls: fulfillment?.generatedColorUrls,
            previewSessionId: fulfillment?.previewSessionId,
            generationStats: fulfillment?.generationStats,
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (data.cart) {
          // Build cart state directly from the API response — no second fetch needed.
          // The create/add routes already return full cart data including imageUrls and style.
          // For existing lines (add-to-cart case), merge imageUrls/style from current cart state
          // since the add route only populates them for the newly added line.
          const cartItems: CartItem[] = data.cart.items.map((item: any) => {
            const existingItem = cart?.items.find((i) => i.lineId === item.lineId);
            const isNewItem = (item.imageUrls?.length ?? 0) > 0;
            const base: CartItem = {
              ...item,
              imageUrls: isNewItem ? item.imageUrls : (existingItem?.imageUrls ?? []),
              style: isNewItem ? (style ?? "cartoon") : (item.style ?? existingItem?.style),
              isGiftCard: item.isGiftCard ?? existingItem?.isGiftCard,
              giftCardAmount: item.giftCardAmount ?? existingItem?.giftCardAmount,
              originalUrls: existingItem?.originalUrls ?? item.originalUrls,
              generatedBwUrls: existingItem?.generatedBwUrls ?? item.generatedBwUrls,
              generatedColorUrls:
                existingItem?.generatedColorUrls ?? item.generatedColorUrls,
              previewSessionId:
                existingItem?.previewSessionId ?? item.previewSessionId,
            };
            if (isNewItem && fulfillment) {
              return {
                ...base,
                originalUrls: fulfillment.originalUrls,
                generatedBwUrls: fulfillment.generatedBwUrls,
                generatedColorUrls: fulfillment.generatedColorUrls,
                previewSessionId: fulfillment.previewSessionId,
              };
            }
            return base;
          });

          setCart({
            id: data.cart.id,
            checkoutUrl: ensureLocaleInCheckoutUrl(data.cart.checkoutUrl),
            totalQuantity: data.cart.totalQuantity,
            totalAmount: data.cart.totalAmount,
            currencyCode: data.cart.currencyCode,
            items: cartItems,
          });
          localStorage.setItem("shopify_cart_id", data.cart.id);
          try {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("adding_to_cart");
            }
          } catch {}

          // Track Meta Pixel AddToCart event
          try {
            trackAddToCart(
              "Little Gali Baby Book",
              bookId || "custom-book",
              quantity * 149,
              quantity
            );
          } catch (err) {
            console.error("Error tracking AddToCart:", err);
          }
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addFramedArtToCart = async (
    sessionId: string,
    style: "cartoon" | "pencil" | "watercolor",
  ) => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("adding_to_cart", "1");
      }
      const response = await fetch("/api/shopify/cart/add-framed-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart?.id,
          sessionId,
          style,
          locale,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      const data = await response.json();
      if (data.cart) {
        await fetchCart(data.cart.id, { silent: true });
        try {
          trackAddToCart("איור ממוסגר", sessionId, 129, 1);
        } catch (err) {
          console.error("Error tracking framed art AddToCart:", err);
        }
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("adding_to_cart");
          }
        } catch {}
      }
    } catch (error) {
      console.error("Error adding framed art to cart:", error);
      try {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("adding_to_cart");
        }
      } catch {}
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addGiftCardToCart = async (optionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shopify/cart/add-gift-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: cart?.id,
          optionId,
          locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart) {
          await fetchCart(data.cart.id, { silent: true });

          // Track Meta Pixel AddToCart event for gift card
          try {
            // Extract gift card value from optionId (format: gid://shopify/ProductVariant/...)
            const giftCardValue = 100; // Default fallback
            trackAddToCart(
              "Little Gali Gift Card",
              optionId,
              giftCardValue,
              1
            );
          } catch (err) {
            console.error("Error tracking gift card AddToCart:", err);
          }
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add gift card to cart");
      }
    } catch (error) {
      console.error("Error adding gift card to cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart?.id) return;

    if (quantity <= 0) {
      await removeFromCart([lineId]);
      return;
    }

    const previousCart = cart;
    const nextItems = cart.items.map((item) => {
      const id = item.lineId || item.id;
      return cartLineIdsMatch(id, lineId) ? { ...item, quantity } : item;
    });
    const nextTotalQuantity = nextItems.reduce(
      (sum, item) => sum + (item.quantity > 0 ? item.quantity : 1),
      0,
    );

    setCart({
      ...cart,
      items: nextItems,
      totalQuantity: nextTotalQuantity,
    });

    try {
      const response = await fetch("/api/shopify/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: cart.id,
          lineId: normalizeCartLineId(lineId),
          quantity,
          locale,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setCart(previousCart);
        throw new Error(error.error || "Failed to update quantity");
      }

      const data = await response.json();
      if (data.cart?.id) {
        await fetchCart(data.cart.id, { silent: true });
      }
    } catch (error) {
      setCart(previousCart);
      console.error("Error updating quantity:", error);
      throw error;
    }
  };

  const removeFromCart = async (lineIds: string[]) => {
    if (!cart?.id) return;

    const expanded = new Set<string>();
    for (const id of lineIds) {
      const item = cart.items.find((i) =>
        cartLineIdsMatch(i.lineId || i.id, id),
      );
      if (item?.lineIds?.length) {
        for (const lid of item.lineIds) {
          expanded.add(normalizeCartLineId(lid));
        }
      } else {
        expanded.add(normalizeCartLineId(id));
      }
    }
    const normalizedLineIds = [...expanded];
    const lineIdSet = new Set(normalizedLineIds);
    const previousCart = cart;

    const nextItems = cart.items.filter((item) => {
      const ids = item.lineIds?.length
        ? item.lineIds.map(normalizeCartLineId)
        : [normalizeCartLineId(item.lineId || item.id)];
      return !ids.some((id) => lineIdSet.has(id));
    });
    const nextTotalQuantity = nextItems.reduce(
      (sum, item) => sum + (item.quantity > 0 ? item.quantity : 1),
      0,
    );

    setCart({
      ...cart,
      items: nextItems,
      totalQuantity: nextTotalQuantity,
    });

    try {
      const response = await fetch("/api/shopify/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: cart.id,
          lineIds: normalizedLineIds,
          locale,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setCart(previousCart);
        throw new Error(error.error || "Failed to remove from cart");
      }

      const data = await response.json();
      if (data.cart?.id) {
        if (nextTotalQuantity === 0) {
          clearCart();
          return;
        }
        await fetchCart(data.cart.id, { silent: true });
      }
    } catch (error) {
      setCart(previousCart);
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const clearCart = () => {
    setCart(null);
    try {
      localStorage.removeItem("shopify_cart_id");
    } catch {
      // ignore
    }
  };

  const resetCart = async () => {
    const cartId = cart?.id;
    const lineIds =
      cart?.items.map((item) => normalizeCartLineId(item.lineId || item.id)) ??
      [];

    clearCart();

    if (!cartId || lineIds.length === 0) {
      return;
    }

    try {
      await fetch("/api/shopify/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, lineIds, locale }),
      });
    } catch {
      // Local cart is already cleared; stale Shopify carts expire on their own.
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        addGiftCardToCart,
        addFramedArtToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
        clearCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
