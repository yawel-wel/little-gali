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
  fetchCart: (cartId: string) => Promise<void>;
  clearCart: () => void;
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

  const fetchCart = useCallback(async (cartId: string) => {
    const seq = ++fetchCartSeqRef.current;
    setIsLoading(true);
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
          // Helper to fetch line images and style with small retries to avoid race with server-side storage
          const fetchLineDataWithRetry = async (
            cId: string,
            lId: string,
            attempts = 3,
            delayMs = 200
          ): Promise<{
            imageUrls: string[];
            originalUrls?: string[];
            generatedBwUrls?: string[];
            generatedColorUrls?: string[];
            previewSessionId?: string;
            style?: "cartoon" | "pencil" | "watercolor";
            isFramedArt?: boolean;
            framedImageUrl?: string;
          }> => {
            for (let i = 0; i < attempts; i++) {
              try {
                const res = await fetch(
                  `/api/cart-images?${new URLSearchParams({
                    cartId: cId,
                    lineId: lId,
                  })}`,
                );
                if (res.ok) {
                  const json = await res.json();
                  if (
                    Array.isArray(json.imageUrls) &&
                    (json.imageUrls.length === 5 ||
                      (json.productType === "framed_art" &&
                        json.imageUrls.length >= 1))
                  ) {
                    return {
                      imageUrls: json.imageUrls,
                      originalUrls: json.originalUrls,
                      generatedBwUrls: json.generatedBwUrls,
                      generatedColorUrls: json.generatedColorUrls,
                      previewSessionId: json.previewSessionId,
                      style: json.style,
                      isFramedArt: json.productType === "framed_art",
                      framedImageUrl: json.framedImageUrl ?? json.imageUrls[0],
                    };
                  }
                }
              } catch {
                // ignore and retry
              }
              await new Promise((r) => setTimeout(r, delayMs));
            }
            return { imageUrls: [] };
          };

          // Fetch images and style from our separate storage for each line item
          // Fallback to Shopify attributes if in-memory store is empty (production issue)
          // Also check Shopify attributes for style (fallback)
          const cartItems: CartItem[] = await Promise.all(
            data.cart.lines.map(async (line: any) => {
              const isFramedArtCheck = line.attributes?.find(
                (attr: any) =>
                  attr.key === "_product_type" && attr.value === "framed_art",
              );
              // Check if this is a gift card first (skip image fetch for gift cards)
              const isGiftCardCheck = line.attributes?.find(
                (attr: any) => attr.key === "_type" && attr.value === "gift_card"
              );
              
              const lineData = isGiftCardCheck 
                ? { imageUrls: [] } 
                : await fetchLineDataWithRetry(cartId, line.id);
              
              // Fallback to Shopify attributes if cart-images API returned empty (production issue)
              // This happens because in-memory storage doesn't work across serverless instances
              let imageUrls = lineData.imageUrls;
              let generatedColorUrls = lineData.generatedColorUrls;
              const isFramedArt = Boolean(isFramedArtCheck);
              if (imageUrls.length === 0) {
                // First try the imageUrls already extracted by the get route (from Shopify attributes)
                if (line.imageUrls && Array.isArray(line.imageUrls) && line.imageUrls.length > 0) {
                  imageUrls = line.imageUrls;
                } else if (line.attributes) {
                  // Extract images from Shopify line item attributes (backward compatibility)
                  const shopifyImageUrls: string[] = [];
                  for (let i = 1; i <= 5; i++) {
                    const imageAttr = line.attributes.find(
                      (attr: any) =>
                        attr.key === `_image_${i}` || attr.key === `image_${i}`
                    );
                    if (imageAttr?.value) {
                      shopifyImageUrls.push(imageAttr.value);
                    }
                  }
                  if (shopifyImageUrls.length > 0) {
                    imageUrls = shopifyImageUrls;
                  }
                }
              }
              if (
                (!generatedColorUrls || generatedColorUrls.length === 0) &&
                line.attributes
              ) {
                const shopifyColorUrls: string[] = [];
                for (let i = 1; i <= 5; i++) {
                  const colorAttr = line.attributes.find(
                    (attr: any) => attr.key === `_color_image_${i}`,
                  );
                  if (colorAttr?.value) {
                    shopifyColorUrls.push(colorAttr.value);
                  }
                }
                if (shopifyColorUrls.length === 5) {
                  generatedColorUrls = shopifyColorUrls;
                }
              }
              
              // Check if this is a gift card
              let isGiftCard = false;
              let giftCardAmount = undefined;
              if (line.attributes) {
                const typeAttr = line.attributes.find(
                  (attr: any) => attr.key === "_type"
                );
                if (typeAttr?.value === "gift_card") {
                  isGiftCard = true;
                  
                  // Try to extract gift card amount from stored attribute first
                  const amountAttr = line.attributes.find(
                    (attr: any) => attr.key === "_gift_card_amount"
                  );
                  if (amountAttr?.value) {
                    giftCardAmount = parseFloat(amountAttr.value);
                  } else {
                    // Fallback: Extract from line cost
                    giftCardAmount = line.cost?.totalAmount?.amount ? 
                      parseFloat(line.cost.totalAmount.amount) : undefined;
                  }
                }
              }
              
              // Check Shopify attributes for style (fallback if not in our storage)
              // Check both "style" (visible) and "_style" (hidden) attributes
              let style = lineData.style;
              if (!style && line.attributes && !isGiftCard) {
                const styleAttr = line.attributes.find(
                  (attr: any) => attr.key === "style" || attr.key === "_style"
                );
                if (styleAttr && (styleAttr.value === "cartoon" || styleAttr.value === "pencil" || styleAttr.value === "watercolor")) {
                  style = styleAttr.value;
                }
              }
              
              const framedImageUrl =
                isFramedArt && imageUrls[0]
                  ? imageUrls[0]
                  : lineData.framedImageUrl;

              const linePricing = parseShopifyLineCost(line.cost);

              return {
                id: line.id,
                lineId: line.id,
                quantity: line.quantity,
                title: line.title,
                imageUrls: isGiftCard ? [] : imageUrls,
                originalUrls: isGiftCard ? undefined : lineData.originalUrls,
                generatedBwUrls: isGiftCard ? undefined : lineData.generatedBwUrls,
                generatedColorUrls: isGiftCard ? undefined : generatedColorUrls,
                previewSessionId: isGiftCard ? undefined : lineData.previewSessionId,
                style: isGiftCard ? undefined : style,
                isGiftCard,
                giftCardAmount,
                isFramedArt: isFramedArt || lineData.isFramedArt,
                framedImageUrl,
                lineTotalAmount: linePricing?.total,
                lineCompareAmount: linePricing?.compare,
              };
            })
          );

          if (seq !== fetchCartSeqRef.current) {
            return;
          }

          setCart({
            id: data.cart.id,
            checkoutUrl: ensureLocaleInCheckoutUrl(data.cart.checkoutUrl),
            totalQuantity: data.cart.totalQuantity,
            totalAmount: data.cart.totalAmount,
            currencyCode: data.cart.currencyCode,
            items: cartItems,
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
        await fetchCart(data.cart.id);
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
          await fetchCart(data.cart.id);
          
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
      // If quantity is 0 or less, remove the item
      await removeFromCart([lineId]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/shopify/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: cart.id,
          lineId,
          quantity,
          locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart) {
          // Fetch updated cart
          await fetchCart(data.cart.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (lineIds: string[]) => {
    if (!cart?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/shopify/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId: cart.id,
          lineIds,
          locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cart) {
          // Fetch updated cart
          await fetchCart(data.cart.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart(null);
    localStorage.removeItem("shopify_cart_id");
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
