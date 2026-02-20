# Meta Pixel Tracking Setup

This document explains how Meta Pixel tracking has been implemented in the Little Gali application.

## Environment Configuration

The Meta Pixel tracking requires two environment variables:

### 1. Meta Pixel ID (Required for client-side tracking)
Add to your `.env.local` file:

```bash
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here
```

**Important:** The environment variable must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

### 2. Meta Conversions API Token (Required for Purchase tracking)
Add to your `.env.local` file:

```bash
META_CONVERSIONS_API_TOKEN=your_access_token_here
```

This is used for server-side Purchase event tracking via the Conversions API.

**How to get your Conversions API Access Token:**
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Select your pixel
3. Click "Settings" in the left menu
4. Scroll to "Conversions API" section
5. Click "Generate Access Token"
6. Copy the token and add it to your `.env.local`

## Implementation Overview

### 1. Core Components

#### `/src/components/meta-pixel.tsx`
Contains two main components:
- `MetaPixelScript`: Server-side script injection component that loads the Meta Pixel base code
- `MetaPixel`: Client-side component for dynamic page view tracking

#### `/src/lib/meta-pixel-events.ts`
Utility functions for tracking specific events throughout the application:
- `trackViewContent()` - Track content views
- `trackAddToCart()` - Track when items are added to cart
- `trackInitiateCheckout()` - Track checkout initiation
- `trackPurchase()` - Track completed purchases
- `trackContact()` - Track contact form submissions
- `trackSubscribe()` - Track email subscriptions
- `trackLead()` - Track lead generation
- And more...

### 2. Integration Points

The Meta Pixel has been integrated at the following key points:

#### Layout (`/src/app/layout.tsx`)
- Meta Pixel script is loaded in the `<head>` section
- Automatically tracks initial page views

#### Cart Operations (`/src/lib/CartContext.tsx`)
- **AddToCart**: Tracks when users add items to their cart
- Includes product name, ID, value, and quantity

#### Checkout (`/src/components/cart-drawer.tsx` & `/src/app/cart/page.tsx`)
- **InitiateCheckout**: Tracks when users click the checkout button
- Includes total cart value and number of items

#### Contact Form (`/src/app/contact/page.tsx`)
- **Contact**: Tracks successful contact form submissions

#### Email Signup (`/src/app/page.tsx`)
- **Subscribe**: Tracks email newsletter subscriptions

#### Shopify Webhook (`/src/app/api/shopify/webhook/route.ts`)
- **Purchase**: Tracks completed purchases via Conversions API
- Includes order value, currency, order ID, and number of items
- Uses server-side tracking for reliability (works even with ad blockers)

## Tracked Events

### Standard Events
The following Meta Pixel standard events are currently tracked:

1. **PageView** - Automatically tracked on every page load and route change
2. **AddToCart** - When user adds a book or gift card to cart
3. **InitiateCheckout** - When user clicks checkout button
4. **Contact** - When user submits contact form
5. **Subscribe** - When user signs up for email newsletter
6. **Purchase** - When an order is completed (tracked via Conversions API in webhook)

### Future Events
The following utility functions are available but not yet implemented in the UI:

- **ViewContent** - Can be used for specific product/page views
- **Lead** - For lead generation forms
- **CompleteRegistration** - For user account creation
- **Search** - For search functionality
- **AddToWishlist** - For wishlist features

## Adding New Event Tracking

To track a new event in any component:

1. Import the tracking function:
```typescript
import { trackMetaPixelEvent } from "@/lib/meta-pixel-events";
// or import specific event functions:
import { trackViewContent, trackLead } from "@/lib/meta-pixel-events";
```

2. Call the tracking function at the appropriate point:
```typescript
// Generic custom event
trackMetaPixelEvent("CustomEventName", {
  custom_param: "value",
  value: 100,
  currency: "ILS"
});

// Or use predefined standard events
trackViewContent("Product Name", "Category", 149);
```

## Testing

### Development Testing
1. Install the Meta Pixel Helper Chrome extension
2. Navigate through your site and perform actions
3. Check the extension icon for tracked events
4. Click the extension to see event details and parameters

### Production Verification
1. Go to Meta Events Manager
2. Navigate to your pixel
3. Check the "Test Events" tab to see live events
4. Verify event parameters are correct

## Privacy & Compliance

- Meta Pixel only loads when a valid `NEXT_PUBLIC_META_PIXEL_ID` is provided
- All tracking is done client-side
- Ensure compliance with GDPR/privacy laws in your region
- Consider adding cookie consent before initializing the pixel

## Troubleshooting

### Pixel Not Loading
- Check that `NEXT_PUBLIC_META_PIXEL_ID` is set in `.env.local`
- Verify the environment variable is accessible: `process.env.NEXT_PUBLIC_META_PIXEL_ID`
- Check browser console for errors
- Ensure ad blockers are disabled during testing

### Events Not Firing
- Open browser DevTools and check the Console for errors
- Use Meta Pixel Helper extension to verify events
- Check that `window.fbq` is defined before tracking
- Verify event names match Meta's standard event names

### Purchase Events Not Showing
- Verify `META_CONVERSIONS_API_TOKEN` is set in `.env.local`
- Check webhook logs for Meta API errors
- Ensure the webhook is properly configured in Shopify
- Go to Events Manager > Test Events to see live Purchase events
- Note: Purchase events may take a few minutes to appear in Meta's reporting

### Common Issues
1. **Environment variable not found**: Make sure to restart Next.js dev server after adding `.env.local`
2. **Pixel blocked by ad blocker**: Disable ad blockers during testing
3. **Events appearing in Test Events but not in Overview**: Wait a few minutes for data to aggregate
4. **Purchase events not tracked**: Verify Conversions API token is valid and has proper permissions
5. **Webhook not firing**: Check Shopify webhook configuration and verify the webhook secret matches

## Additional Resources

- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Standard Events Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Meta Events Manager](https://business.facebook.com/events_manager)
