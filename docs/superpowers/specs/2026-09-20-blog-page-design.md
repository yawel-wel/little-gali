# Blog listing and article pages

## Summary

Add a bilingual blog with a listing page and per-post article pages. Posts are hardcoded in a TypeScript data file (placeholders for layout). The blog appears in the side menu under Bamboo Blankets / טטרות במבוק, and in the footer platform column. It does not appear on the home page. Sharing a post URL on social media shows a proper preview; the article page has one Share / copy-link control, not a social-icon row.

## Goals

- SEO: unique URL per post, Hebrew metadata by default, Open Graph image/title/excerpt, `BlogPosting` JSON-LD on articles.
- Shareable posts: paste-the-link previews work; in-page share uses the device share sheet (mobile) or copies the link (desktop).
- Layout matches the reference: listing cards (image, title, date, two-line excerpt); article (title, date, image, body, tags). No Facebook / X / Pinterest icons.
- Hebrew and English copy per post, switched by the existing language switcher (no `/en/...` routes).
- Side menu item under טטרות; not on the home page.

## Out of scope

- Home-page blog teaser or featured posts.
- CMS, Markdown/MDX, or admin editing UI.
- Clickable tags, tag index pages, or filtering.
- Author name, comments, related posts, pagination.
- Separate English URLs (`/en/blog/...`).
- Social-network share icons (Facebook, X, Pinterest).
- Real editorial copy (placeholders only; replace later).

## Routing

| Path | Content |
|------|---------|
| `/blog` | Listing |
| `/blog/[slug]` | Article for that slug |

Unknown slugs call `notFound()` (Next.js default 404). Slugs are English and identical in both languages, e.g. `/blog/baby-vision`.

## Data

`src/lib/blog/posts.ts` is the single source of posts. Helpers: `getAllPosts()` (newest first) and `getPostBySlug(slug)`.

Each post:

| Field | Notes |
|-------|--------|
| `slug` | URL segment, English, stable |
| `publishedAt` | ISO date string |
| `image.src` | Path under `/public` |
| `image.alt` | `{ he, en }` |
| `tags` | Array of `{ he, en }` — display only, not links |
| `he` / `en` | `{ title, excerpt, body }` |
| `body` | Array of paragraph strings (no Markdown) |

Listing excerpt is `excerpt`, shown with CSS `line-clamp-2`. Dates render with `toLocaleDateString` (`he-IL` or `en-US`) according to the current locale.

Ship **three placeholder posts**:

| Slug | Hebrew title (placeholder) | English title (placeholder) | Image (reuse existing) |
|------|----------------------------|-----------------------------|------------------------|
| `baby-vision` | ראיית תינוקות | Baby vision | `/how-it-works-step-1.jpg` |
| `baby-development` | התפתחות תינוקות | Baby development | `/how-it-works-step-2.jpg` |
| `high-contrast` | ניגודיות גבוהה לתינוקות | High contrast for babies | `/how-it-works-step-3.jpg` |

Each has 2–3 dummy paragraphs and two tags (e.g. ראייה / Vision, התפתחות / Development). Copy is obviously placeholder so it can be replaced without a layout change.

## Pages and layout

Shared shell: cream background `#F3EEE8`, `Header`, `Footer`, main padding `calc(72px + var(--banner-height, 0px))`, same as Q&A.

### Listing (`/blog`)

1. Centered `Title` as `h1`: Hebrew **הבלוג שלנו** with highlight **שלנו**; English **Our blog** with highlight **blog**.
2. One-line subtitle from LanguageContext (Hebrew and English).
3. Responsive grid: **1 column** below `md`, **2 columns** from `md` up. Gap consistent with site cards.
4. Each item is a `BlogCard` linking to `/blog/[slug]`:
   - Full-width rounded image
   - Title
   - Date
   - Two-line excerpt (ellipsis)
   - No tags, author, or share on the card

### Article (`/blog/[slug]`)

1. Breadcrumb: בית / בלוג / title (English: Home / Blog / title). Blog crumb links to `/blog`.
2. Title as `h1` (no highlight underline on the post title).
3. Date only (no author).
4. Hero image, rounded, full content width.
5. Body paragraphs.
6. `BlogShareButton` (not a social-icon row).
7. **Tags** heading + non-clickable pills.

## Sharing and SEO

Language is client-side (`localStorage`), default Hebrew. Search engines and unfurls see Hebrew.

**Metadata** (server `generateMetadata` on both routes). Do not import the client `LanguageContext` from server pages. Put Hebrew listing SEO strings (`title`, `description`) next to the posts module (e.g. `BLOG_LISTING_SEO` in `posts.ts`).

- Listing: those Hebrew title + description values; Open Graph image can be the site default `/social-share.JPG`.
- Article: Hebrew `title`, `excerpt` as description, Open Graph `type: article`, `publishedTime`, image = post image, `locale: he_IL`. Twitter `summary_large_image`.
- Canonical URL: `https://www.littlegali.com/blog` or `https://www.littlegali.com/blog/{slug}`.

**JSON-LD** on the article page: `BlogPosting` with Hebrew headline, description, image, datePublished, and publisher Little Gali.

**In-page share** (`BlogShareButton`):

- Accessible button labeled שיתוף / Share.
- If `navigator.share` is available, open the share sheet with title, text (excerpt), and URL.
- Otherwise (or if share throws): copy the article URL to the clipboard and show a short copied confirmation.
- Place after the body, before tags.

## Navigation

Side menu in `header.tsx`, immediately after `nav.bambooBlanket`:

`{ nameKey: "nav.blog", href: "/blog", isAnchor: false }`

Footer platform column in `footer.tsx`, after Q&A: `{ labelKey: "nav.blog", href: "/blog" }`.

Not linked from the home page.

## Files

| File | Change |
|------|--------|
| `src/lib/blog/posts.ts` | New. Post type, placeholder posts, `getAllPosts`, `getPostBySlug`. |
| `src/components/blog-card.tsx` | New. Listing card. |
| `src/components/blog-share-button.tsx` | New. Client share / copy-link. |
| `src/components/blog-index.tsx` | New. Client listing UI (`useLanguage`). |
| `src/components/blog-article.tsx` | New. Client article UI. |
| `src/app/blog/page.tsx` | New. Server page: metadata + `BlogIndex`. |
| `src/app/blog/[slug]/page.tsx` | New. Server page: metadata, `notFound`, JSON-LD, `BlogArticle`. |
| `src/lib/LanguageContext.tsx` | `nav.blog`, listing title/highlight/subtitle, breadcrumb, tags label, share/copied strings (HE + EN). |
| `src/components/header.tsx` | Menu item after bamboo blanket. |
| `src/components/footer.tsx` | Platform column link. |

Route files stay server components so `generateMetadata` works. Anything that calls `useLanguage` is a client child.

## Errors

- Unknown slug → `notFound()`.
- Missing/broken image → page still renders; `Image` keeps width/height so layout does not collapse.
- Share API missing or rejected → copy link + confirmation. Clipboard failure → show the URL in the confirmation so the user can copy it manually.

## Testing

- `/blog` shows three cards; 2 columns on desktop, 1 on mobile.
- Each card shows image, title, date, two-line excerpt; clicking goes to `/blog/{slug}`.
- Article shows title, date, image, body, share button, tags; no Facebook / X / Pinterest icons.
- Side menu: בלוג / Blog directly under טטרות במבוק / Bamboo Blankets. Home page unchanged.
- Footer platform column includes the blog link.
- Language switcher swaps HE/EN on listing and article (including title highlight, dates, tags, share label).
- `/blog/not-a-post` 404s.
- Article response includes Hebrew Open Graph title/description/image and `BlogPosting` JSON-LD.
- Share: on a supporting mobile browser the share sheet opens; otherwise the URL is copied.
