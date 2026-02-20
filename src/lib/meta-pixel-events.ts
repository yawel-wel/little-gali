/**
 * Meta Pixel Event Tracking Utilities
 * 
 * Use these functions to track specific events throughout your application
 */

declare global {
  interface Window {
    fbq: any;
  }
}

/**
 * Track a custom event with Meta Pixel
 * @param eventName - Name of the event (e.g., 'ViewContent', 'AddToCart', 'Purchase')
 * @param data - Optional event data
 */
export function trackMetaPixelEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, data);
  }
}

/**
 * Track when a user views content
 * @param contentName - Name of the content being viewed
 * @param contentCategory - Category of the content
 * @param value - Optional value
 */
export function trackViewContent(
  contentName: string,
  contentCategory?: string,
  value?: number
) {
  trackMetaPixelEvent("ViewContent", {
    content_name: contentName,
    content_category: contentCategory,
    value: value,
    currency: "ILS",
  });
}

/**
 * Track when a user adds an item to cart
 * @param contentName - Name of the product
 * @param contentId - Product ID
 * @param value - Price of the item
 * @param quantity - Quantity added
 */
export function trackAddToCart(
  contentName: string,
  contentId: string,
  value: number,
  quantity: number = 1
) {
  trackMetaPixelEvent("AddToCart", {
    content_name: contentName,
    content_ids: [contentId],
    content_type: "product",
    value: value,
    currency: "ILS",
    quantity: quantity,
  });
}

/**
 * Track when a user initiates checkout
 * @param value - Total cart value
 * @param numItems - Number of items in cart
 */
export function trackInitiateCheckout(value: number, numItems: number) {
  trackMetaPixelEvent("InitiateCheckout", {
    value: value,
    currency: "ILS",
    num_items: numItems,
  });
}

/**
 * Track when a user completes a purchase
 * @param value - Total purchase value
 * @param orderId - Order ID
 * @param numItems - Number of items purchased
 */
export function trackPurchase(
  value: number,
  orderId: string,
  numItems: number
) {
  trackMetaPixelEvent("Purchase", {
    value: value,
    currency: "ILS",
    order_id: orderId,
    num_items: numItems,
  });
}

/**
 * Track when a user submits a contact form
 */
export function trackContact() {
  trackMetaPixelEvent("Contact");
}

/**
 * Track when a user completes registration
 */
export function trackCompleteRegistration() {
  trackMetaPixelEvent("CompleteRegistration");
}

/**
 * Track when a user searches
 * @param searchString - The search query
 */
export function trackSearch(searchString: string) {
  trackMetaPixelEvent("Search", {
    search_string: searchString,
  });
}

/**
 * Track when a user adds to wishlist
 * @param contentName - Name of the product
 * @param contentId - Product ID
 * @param value - Price of the item
 */
export function trackAddToWishlist(
  contentName: string,
  contentId: string,
  value: number
) {
  trackMetaPixelEvent("AddToWishlist", {
    content_name: contentName,
    content_ids: [contentId],
    value: value,
    currency: "ILS",
  });
}

/**
 * Track lead generation
 */
export function trackLead() {
  trackMetaPixelEvent("Lead");
}

/**
 * Track when a user subscribes
 */
export function trackSubscribe() {
  trackMetaPixelEvent("Subscribe");
}
