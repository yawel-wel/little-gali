# Little Gali — live store

Headless Shopify store: this Next.js app is the storefront; Shopify (Storefront API)
handles cart, checkout and orders. Deployed on Vercel. Real customers buy here every
day: `main` is production.

**Main product (bestseller): the soft book for newborns and babies.** Customers upload
photos of their family and we generate illustrations with Gemini. Two versions: a black &
white side (high contrast for newborn vision) plus a color side, or fully colorful (both
sides in color). Other products: framed art, gift set, blanket, gift card.

## Commands
- `npm run dev` — local dev server
- `npx tsc --noEmit` — typecheck (must pass)
- `npm run lint` — has pre-existing errors; don't add new ones
- No test suite yet (critical-path tests are planned)

Local dev without cost or live data:
- `MOCK_AI_GENERATION=true` — fake B&W and color images instead of Gemini calls
- `PREVIEW_SESSION_STORE=memory` — preview sessions in memory instead of Redis
- `SKIP_PREVIEW_LIMITS=true` — bypass preview limits
- Suggest-crop still calls Google Vision (paid) during upload; it is not mocked

## Core flow (risky — ask before changing)
upload → crop → B&W generation → color generation → preview → cart → Shopify checkout.
- `src/app/upload/page.tsx`, `src/app/preview/[sessionId]/page.tsx` — the flow UI
- `src/lib/preview-session/` — sessions, limits, change credits, generation runners
- `src/lib/preview-session/generate-bw.ts`, `generate-color.ts` — the only Gemini calls
- `src/lib/framed-art/` — framed art flow (same generation code)
- `src/app/api/shopify/cart/*`, `src/lib/CartContext.tsx` — Shopify cart
- Cart line attributes (`_image_N`, `_color_image_N`, `_book_images`, `_style`, ...) are
  read by the little-gali-processing admin. Changing them breaks order processing.
- Each customer gets a limited number of changes (regenerate/replace) per preview
  (`PREVIEW_CHANGE_CREDITS`). Every change is a paid Gemini call.

## Easy rollback
When a change affects what customers see or what things cost (models, prompts,
limits, new flows), offer to put it behind an env var or a flag in
`src/lib/feature-flags.ts`, so it can be switched back in Vercel without a code
change. Skip this for trivial changes.

## Where things live
- All texts: `src/lib/LanguageContext.tsx` (`hebrewTranslations`, `englishTranslations`)
- Colors: `src/theme/colors.ts` and brand classes in `src/app/globals.css`
- Prompts: env vars (`BLACK_AND_WHITE_PROMPT`, `PENCIL_COLOR_PROMPT`, ...) and
  `src/lib/prompts/constants.ts`. Models: `GEMINI_*_IMAGE_MODEL` env vars
- Prices: `NEXT_PUBLIC_*_PRICE` env vars. Feature flags: `src/lib/feature-flags.ts`
- Images: all new uploads and generated images go to Cloudflare R2 (`src/lib/storage/`).
  Cloudinary remains only as a fallback and for old order URLs; many functions still
  have "Cloudinary" in their names for historical reasons.
- Errors: `src/lib/report-error.ts` (Sentry). Analytics: `src/lib/analytics.ts`
  (Mixpanel, browser), `src/lib/analytics-server.ts` (server), `src/lib/meta-pixel-events.ts`

## UI quality bar
- **Mobile first.** Build and check at phone width (~375px) first, then desktop.
- **Reuse before building.** Check `src/components/` and `src/components/ui/` (shadcn)
  for an existing component first. When a pattern repeats, make it a shared component
  instead of duplicating it.
- **Consistency.** Use the existing palette classes (`accent-burgundy`, `primary-orange`,
  `warm-light`, `warm-cream`, `dark-gray`, `medium-gray`, ...) and fonts (`font-heading`,
  `font-body`, `font-body-bold`). No new hex values or fonts. Everything clickable has
  `cursor-pointer` and a hover state.
- **RTL.** Hebrew is the default; the page direction follows the language. In new code
  use logical classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) instead of
  `ml-`/`mr-`/`left-`/`right-`. Check arrows and icons point the right way in both
  Hebrew and English.
- **Texts.** Every user-facing string goes through `t()`, with both Hebrew and English
  added to `LanguageContext.tsx`. Never hardcode text in components.
- **Customer images** (uploads and generated): add `draggable={false}`,
  `onContextMenu={(e) => e.preventDefault()}` (so generated art isn't easily saved before
  purchase) and the `SENTRY_REPLAY_BLOCK_USER_IMAGE` class (keeps customers' family
  photos out of Sentry session recordings).

## Observability
- Failures on customer paths: `reportError("<what failed>", error, { area })`.
- When Gemini refuses an image on content grounds (safety / prohibited content), the
  customer is asked to upload a different photo. Track these as their own signal, not
  mixed into real errors: how often they happen matters for product decisions.
- New user-facing features get a typed Mixpanel event in `src/lib/analytics.ts`.

## Ask before (in addition to the global rules)
- Changing any text shown on the site.
- Changing prices, change credits, or the cart line attributes above.
- Adding a new UI or component library.
