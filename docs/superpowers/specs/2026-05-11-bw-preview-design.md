# B&W image preview and cart handoff

## Goals (phase 1)

- Customer-facing B&W preview after five cropped photos.
- Anonymous preview sessions (httpOnly cookie + Upstash Redis).
- Five parallel B&W generations on session start; per-slot regen/replace afterward.
- Three change credits per session; when exhausted, user may still approve and continue (option A).
- Watermarked preview URLs; clean URLs for cart/fulfillment.
- Contact CTA with session context on preview screen.
- Color style step with surprise copy only (no color generation).
- Cart stores five selected originals and five selected B&W outputs.

## Out of scope (phase 1)

- Sign-up/login.
- Color preview generation.
- Admin UI changes.

## Architecture

Preview sessions live in Upstash Redis (TTL 48h). Gemini runs only on server routes under `/api/preview-session`. The browser sends session id, slot index, action, and idempotency keys—never prompts or API keys.

Phases: `bw_review` → `bw_approved` → `style_selected` → `cart_added`.

Each slot stores `originalUrl`, `candidates[]` (B&W history), `activeCandidateId`, and `inFlight`.

Change credits: initial five generations are free; each replace or re-generate consumes one of three credits.

Cart handoff extends `cart-images` storage with `originalUrls`, `generatedBwUrls`, `previewSessionId`, and `style`.

Contact flow: `/contact?previewSessionId=…` prefills message; `/api/contact` resolves session when cookie matches and emails operator links/thumbnails.

## Security

- Signed httpOnly `preview_session` cookie bound to session id.
- New-session rate limit by IP (24h window).
- Idempotency keys and per-slot in-flight mutex.
- Source URLs must belong to the session and approved Cloudinary host.

## Future color

Reuse slot candidates with `kind: color`, same mutex/quota patterns, `generationMode: color` on server only after B&W approval.
