# Tech debt — Little Gali

Known debt we've chosen not to fix yet. Pick items from here deliberately; remove an
item when it's done. Newest first.

Format: **Title** · area · who (tech / designer) · size (S / M / L)
Then: what's wrong, why it matters, where.

---

**Legacy "Cloudinary" names on R2 storage code** · storage · tech · M
All new images go to R2, but many functions and variables are still named after
Cloudinary (`uploadImageFileToCloudinary`, `cloudinaryUrls`, `cloudinary-paths.ts`, ...).
Misleading for anyone reading the code. Rename to storage-neutral names; keep the
Cloudinary fallback only where old order URLs still need it.
Where: `src/lib/preview-session/cloudinary*.ts`, `src/lib/framed-art/cloudinary-paths.ts`,
`src/app/upload/page.tsx`, API routes that import them.

**Two component systems (MUI + shadcn)** · UI · designer · L
Buttons and inputs come from MUI (`@mui/material/Button` in ~10 files) and from shadcn
(`src/components/ui/`), plus many one-off components. Leads to inconsistent look and
duplicated code. Pick one system and consolidate shared components.

**Physical instead of logical direction classes** · UI / RTL · designer · M
~92 uses of `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-` vs ~16 logical (`ms-`/`me-`/...).
Fine in Hebrew, but spacing and positions likely end up on the wrong side in English.
Convert to logical classes and check both languages.

**Dead API routes** · API · tech · S
No callers in the app: `src/app/api/shopify/checkout`, `process-image`, `test-process`,
`order`. Verify nothing external uses them (webhooks, Shopify, old links), then delete.

**Unused watermark helper** · storage · tech · S
`buildWatermarkedPreviewDeliveryUrl` in `src/lib/preview-session/cloudinary-preview-url.ts`
has no callers. Delete.

**Pre-existing lint errors** · tooling · tech · M
`npm run lint` fails on existing code (mostly `no-explicit-any`, setState-in-effect).
New code must not add more; clean up the existing ones gradually.
