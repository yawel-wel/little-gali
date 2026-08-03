# Framed art product page

## Summary

Add a product page for the framed art product at `/framed-art`, modeled on the existing soft book product page at `/soft-book`. The framed art section on the home page stops linking straight into the upload flow: its CTA becomes **התחילו כאן** and navigates to the new product page, which in turn carries a **התחילו ליצור** CTA into `/framed-art/upload`.

## Goals

- New product page at `/framed-art`, structurally mirroring `/soft-book`.
- Home section CTA reads התחילו כאן / "Start here" and links to `/framed-art`.
- Product page CTA links to `/framed-art/upload`, preserving the existing upload flow untouched.
- Pricing tier cards (1 / 2 / 3 frames) shared between the home section and the product page.
- Full Hebrew and English copy for the new page.

## Out of scope

- Any change to the upload or preview flows.
- Any change to `/soft-book` beyond leaving it as-is (no shared `ProductPage` abstraction).
- Product reviews or ratings for framed art.
- Shopify variant or pricing changes.

## Routing

| Path | Content |
|------|---------|
| `/framed-art` | New product page (this spec) |
| `/framed-art/upload` | Existing upload flow, unchanged |
| `/framed-art/preview/[sessionId]` | Existing preview, unchanged |

`src/app/framed-art/layout.tsx` already redirects to `/` when `isFramedArtEnabled()` is false, so the new page inherits the feature flag guard with no additional code.

## Files

| File | Change |
|------|--------|
| `src/app/framed-art/page.tsx` | New. Client component `FramedArtProductPage`. |
| `src/components/framed-art-pricing-cards.tsx` | New. Extracted tier cards grid. |
| `src/components/framed-art-home-section.tsx` | Use extracted cards; CTA text and href change. |
| `src/lib/LanguageContext.tsx` | New `product.framedArt.*` keys (he + en); `home.framedArt.cta` value change. |
| `src/lib/analytics.ts` | Add `FRAME_FLOW_STARTED`. |

## Page structure

Top to bottom, following `src/app/soft-book/page.tsx`:

1. `Header`, `main` with the standard `calc(72px + var(--banner-height, 0px))` top padding.
2. Breadcrumbs: בית › איור ממוסגר.
3. Two-column grid (single column on mobile):
   - **Gallery** (sticky on desktop): main square image plus a thumbnail strip. Sources: `/framed-art-hero.png`, `/framed-art-carousel-1.png`, `/framed-art-carousel-2.png`, `/framed-art-carousel-3.png`.
   - **Info column**: `h1` product name → `₪119` headline price → description intro and bullet list → pricing tier cards → CTA → free preview note.
4. Tabs: **תיאור** and **כדאי לדעת**, same tab pattern and styling as the book page.
5. `FramedArtFeaturesSection` (existing component, unchanged).
6. `QaPreviewSection` with `showCta={false}`.
7. `Footer`.

Deliberately omitted relative to the book page: the star rating and Google reviews link (framed art has no reviews of its own yet, and the existing reviews are about the book), the in-use video, `BookInUseSection`, and the color selector.

The pricing tier cards occupy the slot the book page gives to its color swatches. Framed art has no product option to pick here — illustration style is chosen later in the upload flow.

## Shared pricing cards

`PRICING_CARDS` and its grid markup currently live inline in `framed-art-home-section.tsx`. Move both into `src/components/framed-art-pricing-cards.tsx`, exporting a `FramedArtPricingCards` component. This is a pure extraction: the home section renders identically before and after. Prices continue to come from `FRAMED_ART_UNIT_PRICE`, `FRAMED_ART_TWO_PRICE`, and `FRAMED_ART_THREE_PRICE` in `src/lib/constants.ts`.

## Copy

New keys under `product.framedArt.*` in both language blocks of `LanguageContext.tsx`:

| Key | Purpose |
|-----|---------|
| `name` | Product title |
| `breadcrumbAria`, `breadcrumbHome`, `breadcrumbProduct` | Breadcrumb nav |
| `gallery.imageAlt` | Thumbnail and main image alt text, `{num}` placeholder |
| `description.intro` | Lead paragraph |
| `description.bullet1`–`bullet6` | Bullet list |
| `tabs.ariaLabel`, `tabs.description`, `tabs.goodToKnow` | Tab strip |
| `accordion.overviewContent` | Description tab body |
| `goodToKnow.*` | Frame size, mounting, care |
| `cta`, `ctaAriaLabel` | Product page CTA |
| `askQuestion` | Contact link |

`home.framedArt.cta` changes from התחילו ליצור / "Start creating" to התחילו כאן / "Start here". The product page CTA reuses the התחילו ליצור / "Start creating" wording, so the home button and the product button read as distinct steps.

Frame dimensions and materials are drafted from what the existing framed art copy implies and must be verified against the real product specs before launch.

## Analytics

`src/lib/analytics.ts` has a `frame_*` event family but no equivalent of the booklet flow's `booklet_flow_started`. Add:

```ts
FRAME_FLOW_STARTED: "frame_flow_started",
```

Fire it from the product page CTA click, mirroring `handleFlowStart` on the book page. This is what makes the new page's conversion rate measurable.

## Error handling

The page introduces no data fetching, no network calls, and no persisted state. The only state is the gallery's selected image index and the active tab, both local to the component, so there are no new failure modes.

## Testing

- `npx tsc --noEmit` passes.
- `npm run build` succeeds.
- Manual check of `/framed-art` in Hebrew and English, confirming right-to-left layout, gallery thumbnail switching, tab switching, and that the CTA reaches `/framed-art/upload`.
- Confirm the home section pricing cards are visually unchanged after the extraction.
