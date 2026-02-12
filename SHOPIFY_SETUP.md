# Shopify Integration Setup Guide

This document outlines the required environment variables and setup steps for the Shopify checkout integration.

## Required Environment Variables

### Local Development (.env.local)

Add the following environment variables to your `.env.local` file:

```env
# Shopify Store Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
SHOPIFY_PRODUCT_VARIANT_ID=gid://shopify/ProductVariant/YOUR_VARIANT_ID
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Gift Card Product Variants (for different options)
SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_NO_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID
SHOPIFY_GIFT_CARD_VARIANT_ID_TWO_WITH_SHIPPING=gid://shopify/ProductVariant/YOUR_VARIANT_ID

# Cloudinary Image Storage (Required - for storing images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Email Service (Existing - for webhook notifications)
RESEND_API_KEY=your_resend_api_key
```

### Vercel Environment Variables

Add the same environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments as needed

## How to Get These Values

### 1. SHOPIFY_STORE_DOMAIN

- Your Shopify store domain (e.g., `little-gali.myshopify.com`)
- Found in your Shopify admin dashboard

### 2. SHOPIFY_STOREFRONT_ACCESS_TOKEN

1. Go to your Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **Develop apps** (or **Manage private apps** in older versions)
3. Create a new private app or use an existing one
4. Enable **Storefront API** access
5. Copy the **Storefront API access token**

### 3. SHOPIFY_PRODUCT_VARIANT_ID

1. Go to your Shopify Admin → **Products**
2. Select the product variant you want to use for checkout
3. Look at the URL when editing a variant - it will look like:
   ```
   https://admin.shopify.com/store/your-store/products/7372727779431/variants/41645760544871
   ```
4. The numeric ID at the end (e.g., `41645760544871`) is your variant ID
5. For the Storefront API, you need to use the GraphQL format: `gid://shopify/ProductVariant/XXXXXXXX`
6. Add the prefix `gid://shopify/ProductVariant/` before the numeric ID from the URL

**Example:**

- URL shows: `https://admin.shopify.com/store/.../variants/41645760544871`
- Numeric ID from URL: `41645760544871`
- Environment variable value: `gid://shopify/ProductVariant/41645760544871`

**Alternative:** You can also find it via the GraphQL Admin API or Storefront API

### 4. SHOPIFY_WEBHOOK_SECRET

1. Go to your Shopify Admin → **Settings** → **Notifications**
2. Scroll down to **Webhooks**
3. Create a new webhook with:
   - **Event**: Order paid
   - **Format**: JSON
   - **URL**: `https://your-domain.com/api/shopify/webhook`
4. Shopify will generate a webhook secret - save this value
5. Alternatively, you can set a custom secret when creating the webhook

### 5. CLOUDINARY_CLOUD_NAME & CLOUDINARY_UPLOAD_PRESET

**Why Cloudinary?** Base64 images are too large for Shopify cart attributes (64KB limit). Cloudinary stores images permanently and provides URLs.

**Setup Steps:**

1. Sign up for free at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy your **Cloud Name** (visible at the top of the dashboard)
4. Go to **Settings** → **Upload** → **Upload presets**
5. Click **Add upload preset**
6. Configure:
   - **Preset name**: `little-gali-upload` (or any name)
   - **Signing mode**: **Unsigned** (important for client-side uploads)
   - **Folder**: `little-gali` (optional, for organization)
7. Click **Save**
8. Copy the preset name

**Environment Variables:**

- `CLOUDINARY_CLOUD_NAME`: Your cloud name from dashboard (e.g., `dxyz123abc`)
- `CLOUDINARY_UPLOAD_PRESET`: The preset name you created (e.g., `little-gali-upload`)

**Free Tier:** 25GB storage, 25GB bandwidth/month - more than enough for most use cases!

### 6. Gift Card Product Variant IDs

**Setup Gift Cards in Shopify:**

1. Go to your Shopify Admin → **Products** → **Gift Cards**
2. If you haven't created gift cards yet:
   - Click **Add gift card product**
   - Shopify will automatically create a gift card product
3. Edit your gift card product and add variants for different options:
   - One personalized book without shipping
   - One personalized book with shipping
   - Two personalized books without shipping
   - Two personalized books with shipping
4. For each variant, get the variant ID from the URL when editing it
5. Convert to GraphQL format: `gid://shopify/ProductVariant/XXXXXXXX`

**Example:**
- For "One book without shipping" variant with ID `41645760544871`
- Environment variable: `SHOPIFY_GIFT_CARD_VARIANT_ID_ONE_NO_SHIPPING=gid://shopify/ProductVariant/41645760544871`

**Note:** If you want different options, update the `GIFT_CARD_OPTIONS` array in `/src/lib/constants.ts` and add corresponding environment variables.

### 7. RESEND_API_KEY

- Already configured in your project
- Get from [Resend Dashboard](https://resend.com/api-keys)

## Shopify Webhook Setup

1. In Shopify Admin, go to **Settings** → **Notifications** → **Webhooks**
2. Click **Create webhook**
3. Configure:
   - **Event**: `Order paid`
   - **Format**: `JSON`
   - **URL**: `https://your-domain.com/api/shopify/webhook`
4. Copy the webhook secret and add it as `SHOPIFY_WEBHOOK_SECRET`

## Testing

### Local Testing

1. Use a tool like [ngrok](https://ngrok.com/) to create a public URL for your local server
2. Point the Shopify webhook to your ngrok URL
3. Test the checkout flow end-to-end

### Production Testing

1. Make a test order through your checkout
2. Verify the webhook receives the order payment event
3. Check that the email notification is sent correctly

## Important Notes

1. **Image Storage**: Currently, images are converted to base64 data URLs and stored in cart attributes. For production with large images, consider uploading images to a CDN (Cloudinary, AWS S3, etc.) first and storing URLs instead.

2. **Cart Attributes**: Shopify cart attributes have size limits. Very large base64 strings might be truncated. Consider compressing images further or using external storage.

3. **Webhook Security**: The webhook endpoint verifies the HMAC signature to ensure requests are from Shopify. Never share or commit your `SHOPIFY_WEBHOOK_SECRET`.

4. **Product Variant**: Ensure the product variant ID matches your actual Shopify product. The variant must be active and available for purchase.

## Troubleshooting

### Checkout Not Working

- Verify `SHOPIFY_STORE_DOMAIN` doesn't include `https://` (just the domain)
- Check that `SHOPIFY_STOREFRONT_ACCESS_TOKEN` has Storefront API access
- Ensure `SHOPIFY_PRODUCT_VARIANT_ID` is in the correct format: `gid://shopify/ProductVariant/XXXXX`

### Webhook Not Receiving Events

- Verify the webhook URL is publicly accessible
- Check that `SHOPIFY_WEBHOOK_SECRET` matches the secret in Shopify
- Look at server logs for webhook errors
- Test webhook delivery in Shopify Admin → Webhooks → click on your webhook → View details

### Images Not Appearing in Email

- Check that images are being extracted from cart attributes correctly
- Verify base64 data URLs are valid (they should start with `data:image/...`)
- Consider using permanent image URLs instead of base64 for production
