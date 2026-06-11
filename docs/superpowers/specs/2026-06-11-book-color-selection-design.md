# Soft book color selection (preview + cart)

## Summary

Let customers choose between two physical soft-book colors on the **full preview page** (B&W and Color tabs). Selection drives which **Shopify product variant** is added to cart. Images, style, and all fulfillment attributes are unchanged regardless of color. Our cart UI shows a new **צבע** row (with inline swatch) above **סגנון**. Shopify admin reads color from the order line variant title.

## Goals

- Book color picker on full preview page only (not upload-without-preview).
- Visible on both B&W and Color tabs during the color phase.
- Default selection: **light** (בהיר עם נקודות).
- Correct Shopify variant on add-to-cart; same image payload as today.
- Cart item layout unchanged except new color row with small swatch.
- Admin fulfillment via existing variant names on order lines.

## Out of scope

- Book color picker on upload-without-preview (defaults to light variant silently).
- Line item properties for `book_color` (variant replaces this).
- Preview image changes based on book color (cosmetic product option only).
- Shopify admin theme or fulfillment app changes.

## Product variants

| Color | Internal key | Shopify variant ID | Hebrew label |
|-------|--------------|-------------------|--------------|
| Light (default) | `light` | `43869379821671` | בהיר עם נקודות |
| Dark | `dark` | `43869379854439` | שחור מנומר |

Store IDs in `src/lib/constants.ts` as `BOOK_VARIANT_IDS` (numeric strings). Server resolves `bookColor` → GraphQL `merchandiseId` (`gid://shopify/ProductVariant/{id}`).

## Preview page UI

### Component: `PreviewBookColorPicker`

New client component, modeled after the approved mockup.

**Placement**

- **Color tab:** directly below `PreviewColorStyleStrip` (3 סגנונות · לחצו להשוואה).
- **B&W tab:** same vertical position below the generated card carousel (no style strip on this tab).

Shown whenever `isColorPhase` is true on `src/app/preview/[sessionId]/page.tsx`.

**Layout (RTL)**

- Section title: **בחרו את צבע הספרון** (`preview.bookColor.title`).
- Two equal-width pill buttons in a row with gap.
- Each pill:
  - Background: `#ebe6dc` (same cream as generated preview cards).
  - Rounded corners (pill shape).
  - Hebrew label on the right; circular swatch image on the far right.
- **Selected state:** thick dark border (match mockup / `border-accent-burgundy` or equivalent) + checkmark icon on the far left.
- **Unselected state:** thin light border (`border-gray-200`).

**Swatch assets** (user-provided, in `public/`)

| File | Label |
|------|-------|
| `book-color-swatch-dark.png` | שחור מנומר |
| `book-color-swatch-light.png` | בהיר עם נקודות |

**State**

- `selectedBookColor: "dark" | "light"` in preview page state.
- Default: `"light"`.
- Persists while switching B&W ↔ Color tabs; no server round-trip on change.
- Disabled while `isSubmitting`.

## Add to cart data flow

```
PreviewPage (selectedBookColor)
  → CartContext.addToCart(..., bookColor)
  → POST /api/shopify/cart/add | /create
  → merchandiseId = BOOK_VARIANT_IDS[bookColor]
  → same imageUrls, style, fulfillment attrs as today
```

**Images:** Unchanged. The five B&W URLs, `originalUrls`, `generatedBwUrls`, `generatedColorUrls`, style attributes, preview session stats, etc. are identical regardless of variant. Only `merchandiseId` differs.

**Upload without preview:** No UI. Pass `bookColor: "light"` (or omit and server-default to light variant).

**Quantity increases:** Existing `update-cart-line-quantity.ts` clones lines using the template line’s `merchandise.id`, so color variant is preserved when quantity goes up.

## Cart UI

### New color row

Extend `CartLineItemDetails` (used by `cart/page.tsx` and `cart-drawer.tsx`).

Insert **above** the existing style row:

```
צבע: [●] בהיר עם נקודות
סגנון: עיפרון
```

- Label: `cart.colorLabel` — Hebrew **צבע:**, English **Color:**
- Value: localized label from variant ID mapping.
- Inline circular swatch (~16–20px) using the same `book-color-swatch-*.png` assets as the preview picker.
- Only for booklet lines (not gift cards, not framed art).
- Rest of cart item (avatars, quantity, pricing, style row) unchanged.

### Resolving color from cart lines

Cart get API already queries `merchandise { id, title, product { title } }`. Extend the response to include `variantId` (numeric or full GID) on each line. `CartContext` maps variant ID → `bookColor` → display label + swatch src.

Fallback: if variant ID is neither known book variant (e.g. legacy `SHOPIFY_PRODUCT_VARIANT_ID` lines), omit the color row or treat as light—implementation should only show the row when ID matches a known book color variant.

## i18n

| Key | Hebrew | English |
|-----|--------|---------|
| `preview.bookColor.title` | בחרו את צבע הספרון | Choose your book color |
| `preview.bookColor.dark` | שחור מנומר | Spotted black |
| `preview.bookColor.light` | בהיר עם נקודות | Light with dots |
| `cart.colorLabel` | צבע: | Color: |

## Files to change (implementation)

| Area | Files |
|------|-------|
| Constants | `src/lib/constants.ts` |
| Preview picker | `src/components/preview-book-color-picker.tsx` (new) |
| Preview page | `src/app/preview/[sessionId]/page.tsx` |
| Cart context | `src/lib/CartContext.tsx` |
| Cart APIs | `src/app/api/shopify/cart/add/route.ts`, `create/route.ts` |
| Cart get | `src/app/api/shopify/cart/get/route.ts` |
| Cart display | `src/components/cart-line-item-details.tsx`, `cart/page.tsx`, `cart-drawer.tsx` |
| i18n | `src/lib/LanguageContext.tsx` |
| Assets | `public/book-color-swatch-dark.png`, `public/book-color-swatch-light.png` (user-supplied) |

Optional helper: `src/lib/book-color.ts` for ID ↔ key ↔ label ↔ swatch mapping (keeps cart and preview DRY).

## Shopify admin

No custom line item properties for color. Order lines show the variant title (e.g. בהיר עם נקודות / Light with dots) configured in Shopify admin for each variant.

## Testing

- Full preview: default light selected; switch dark/light; switch B&W/Color tabs — selection persists.
- Add to cart light → order line variant `43869379821671`; images and style present.
- Add to cart dark → variant `43869379854439`; same images as light for same session.
- Cart page and drawer: צבע row with correct swatch and label above סגנון.
- Upload without preview: adds light variant; no color row regression for gift card / framed art.
- Increase booklet quantity: cloned lines keep same variant.

## Decisions log

| Decision | Choice |
|----------|--------|
| Placement on B&W tab | Color picker only (no style strip); same spot as below strip on Color tab |
| Default color | Light |
| Scope | Full preview only |
| Shopify storage | Product variant, not line item properties |
| Cart swatch | Yes — same PNGs as preview picker |
| Images per variant | Same image set regardless of color |
