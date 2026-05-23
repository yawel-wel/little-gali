"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { trackAddToCart, trackInitiateCheckout } from "./meta-pixel-events";

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
  }, []);

  // Update checkoutUrl whenever locale changes (but not when cart changes to avoid loops)
  useEffect(() => {
    if (cart?.checkoutUrl) {
      const updatedUrl = ensureLocaleInCheckoutUrl(cart.checkoutUrl);
      // Only update if the URL actually changed
      if (updatedUrl !== cart.checkoutUrl) {
        setCart({
          ...cart,
          checkoutUrl: updatedUrl,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, ensureLocaleInCheckoutUrl]);

  const fetchCart = async (cartId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shopify/cart/get", {
        method: "POST",
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
          }> => {
            for (let i = 0; i < attempts; i++) {
              try {
                const res = await fetch(
                  `/api/cart-images?cartId=${cId}&lineId=${lId}`
                );
                if (res.ok) {
                  const json = await res.json();
                  if (
                    Array.isArray(json.imageUrls) &&
                    json.imageUrls.length === 5
                  ) {
                    return {
                      imageUrls: json.imageUrls,
                      originalUrls: json.originalUrls,
                      generatedBwUrls: json.generatedBwUrls,
                      generatedColorUrls: json.generatedColorUrls,
                      previewSessionId: json.previewSessionId,
                      style: json.style,
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
              };
            })
          );

          setCart({
            id: data.cart.id,
            checkoutUrl: ensureLocaleInCheckoutUrl(data.cart.checkoutUrl),
            totalQuantity: data.cart.totalQuantity,
            totalAmount: data.cart.totalAmount,
            currencyCode: data.cart.currencyCode,
            items: cartItems,
          });
          localStorage.setItem("shopify_cart_id", data.cart.id);
          // Clear optimistic adding flag if set
          try {
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("adding_to_cart");
            }
          } catch {}
        }
      } else {
        // Cart not found or expired, clear it
        localStorage.removeItem("shopify_cart_id");
        setCart(null);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            return {
              ...item,
              imageUrls: isNewItem ? item.imageUrls : (existingItem?.imageUrls ?? []),
              // For the newly added item use the style passed to addToCart directly —
              // safeguard against API routes not returning it correctly.
              style: isNewItem ? (style ?? "cartoon") : (item.style ?? existingItem?.style),
              isGiftCard: item.isGiftCard ?? existingItem?.isGiftCard,
              giftCardAmount: item.giftCardAmount ?? existingItem?.giftCardAmount,
            };
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
