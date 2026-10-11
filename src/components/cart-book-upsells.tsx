"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { CartItem } from "@/lib/CartContext";
import { useCart } from "@/lib/CartContext";
import { useLanguage } from "@/lib/LanguageContext";
import { ANALYTICS_EVENTS, track, type BookUpsellProduct } from "@/lib/analytics";
import { BLANKET_PRODUCT_IMAGES, matchingBlanketPattern } from "@/lib/blanket";
import { bookColorFromVariantId, type BookColor } from "@/lib/book-color";
import { nextFramedArtPrice } from "@/lib/cart-line-pricing";
import {
  BLANKET_PRICE,
  FRAMED_ART_UNIT_PRICE,
  GIFT_SET_BLANKET_UPGRADE_PRICE,
} from "@/lib/constants";
import { isFramedArtEnabled } from "@/lib/feature-flags";
import { FramedArtFrameMockup } from "@/components/framed-art-frame-mockup";

const MAX_BOOK_PAGES = 9;

/** Soft book or gift set line (the lines these upsells are about). */
export function isCartBookItem(item: CartItem): boolean {
  return !item.isGiftCard && !item.isFramedArt && !item.isBambooBlanket;
}
const isBookItem = isCartBookItem;

function bookColorOf(item: CartItem): BookColor | null {
  return item.bookColor ?? bookColorFromVariantId(item.variantId);
}

function lineIdOf(item: CartItem): string {
  return item.lineId || item.id;
}

function attributeOf(item: CartItem, key: string): string | undefined {
  return item.attributes?.find((a) => a.key === key)?.value;
}

/** Color pages of a book line, in page order (Shopify attributes first, they match frame lines). */
function colorPageUrls(item: CartItem): string[] {
  const fromAttributes: string[] = [];
  for (let n = 1; n <= MAX_BOOK_PAGES; n += 1) {
    const url = attributeOf(item, `_color_image_${n}`);
    if (!url) break;
    fromAttributes.push(url);
  }
  return fromAttributes.length > 0 ? fromAttributes : (item.generatedColorUrls ?? []);
}

export type FrameablePage = { lineId: string; index: number; url: string };

/**
 * Book pages that can still be framed (pages already framed in the cart are left out).
 * With `book`, only that book's pages.
 */
export function getFrameablePages(items: CartItem[], book?: CartItem): FrameablePage[] {
  if (!isFramedArtEnabled()) return [];
  const framedUrls = new Set(
    items
      .filter((item) => item.isFramedArt)
      .map((item) => attributeOf(item, "_image") ?? item.framedImageUrl)
      .filter(Boolean),
  );
  const books = book ? [book] : items.filter(isBookItem);
  return books.flatMap((bookItem) =>
    colorPageUrls(bookItem)
      .map((url, index) => ({ lineId: lineIdOf(bookItem), index, url }))
      .filter((page) => !framedUrls.has(page.url)),
  );
}

/**
 * Books that can get the matching blanket: one per book color (the next book of that
 * color takes over after an upgrade). None once a standalone blanket is in the cart.
 * With `book`, just that book when it is eligible.
 */
export function getBlanketOffers(
  items: CartItem[],
  book?: CartItem,
): Array<{ item: CartItem; color: BookColor }> {
  if (items.some((item) => item.isBambooBlanket)) return [];
  if (book) {
    const color = bookColorOf(book);
    return isBookItem(book) && !book.isBirthPackage && color ? [{ item: book, color }] : [];
  }
  const byColor = new Map<BookColor, CartItem>();
  for (const item of items) {
    const color = bookColorOf(item);
    if (isBookItem(item) && !item.isBirthPackage && color && !byColor.has(color)) {
      byColor.set(color, item);
    }
  }
  return [...byColor].map(([color, item]) => ({ item, color }));
}

function useTrackShownOnce(product: BookUpsellProduct, shown: boolean) {
  const trackedRef = useRef(false);
  useEffect(() => {
    if (shown && !trackedRef.current) {
      trackedRef.current = true;
      track(ANALYTICS_EVENTS.BOOK_UPSELL_SHOWN, { product });
    }
  }, [product, shown]);
}

function Price({ amount, compare }: { amount: number; compare?: number }) {
  return (
    <p className="font-heading text-[15px] font-bold leading-none text-dark-gray" dir="ltr">
      {compare != null ? (
        <span className="me-1.5 font-body text-sm font-normal text-medium-gray line-through">
          ₪{compare}
        </span>
      ) : null}
      <span className="text-sm">₪</span>
      {amount}
    </p>
  );
}

function AddButton({ isAdding, onClick }: { isAdding: boolean; onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isAdding}
      className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-accent-burgundy px-3 py-1.5 font-body-bold text-xs text-accent-burgundy transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      {isAdding ? t("cart.bookUpsell.adding") : t("cart.bookUpsell.add")}
    </button>
  );
}

/**
 * One upsell card: picture on the start side; title and note on top, price and add
 * button on the bottom line. Mobile: ~85% wide in a horizontal scroll row. md+: two per
 * row, no scroll. A card that is alone fills the whole width.
 */
function UpsellCard({
  media,
  title,
  note,
  price,
  isAdding,
  failed,
  onAdd,
  isOnlyCard,
}: {
  isOnlyCard: boolean;
  media: React.ReactNode;
  title: string;
  note: string;
  price: React.ReactNode;
  isAdding: boolean;
  failed: boolean;
  onAdd: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div
      className={`flex shrink-0 snap-start gap-3 rounded-lg border border-gray-200 bg-white p-3 md:w-auto md:min-w-0 ${
        isOnlyCard ? "w-full md:col-span-2" : "w-[85%]"
      }`}
    >
      <div className="w-24 shrink-0">{media}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-body-bold text-sm leading-snug text-dark-gray">{title}</p>
        <p className="mt-0.5 font-body text-xs text-medium-gray">{note}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {price}
          <AddButton isAdding={isAdding} onClick={onAdd} />
        </div>
        {failed ? (
          <p className="mt-1 font-body text-xs text-red-600">{t("cart.bookUpsell.failed")}</p>
        ) : null}
      </div>
    </div>
  );
}

/** "הסרת הטטרה" on a gift set line: turns it back into a plain soft book. */
export function CartBookLineUpsell({ item }: { item: CartItem }) {
  const { t } = useLanguage();
  const { downgradeGiftSetToBook } = useCart();
  const [isBusy, setIsBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!item.isBirthPackage || !item.bookColor) {
    return null;
  }

  const removeBlanket = async () => {
    if (isBusy) return;
    setIsBusy(true);
    setFailed(false);
    try {
      await downgradeGiftSetToBook(lineIdOf(item));
      track(ANALYTICS_EVENTS.BOOK_UPSELL_REMOVED, { product: "blanket" });
    } catch {
      setFailed(true);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={isBusy}
        onClick={() => void removeBlanket()}
        className="flex cursor-pointer items-center gap-1.5 font-body text-xs text-medium-gray underline underline-offset-2 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
        {t("cart.bookUpsell.removeBlanket")}
      </button>
      {failed ? (
        <p className="mt-1 font-body text-xs text-red-600">{t("cart.bookUpsell.failed")}</p>
      ) : null}
    </div>
  );
}

/**
 * Cart upsells: matching blanket(s) and a framed book page. Without `book`, for all books
 * in the cart; with `book`, only for that book (shown under it when the cart has 2+ books).
 */
export function CartBookUpsells({ items, book }: { items: CartItem[]; book?: CartItem }) {
  const { t, locale } = useLanguage();
  const { upgradeBookToGiftSet, addFramedArtFromBook } = useCart();
  const isHe = locale === "he";
  const [pageIndex, setPageIndex] = useState(0);
  const [adding, setAdding] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const blanketOffers = getBlanketOffers(items, book);
  const pages = getFrameablePages(items, book);
  useTrackShownOnce("blanket", blanketOffers.length > 0);
  useTrackShownOnce("framed_art", pages.length > 0);

  if (blanketOffers.length === 0 && pages.length === 0) {
    return null;
  }

  // Each card has its own busy/error key; one add at a time.
  const run = async (key: string, action: () => Promise<void>, onDone: () => void) => {
    if (adding) return;
    setAdding(key);
    setFailed(null);
    try {
      await action();
      onDone();
    } catch {
      setFailed(key);
    } finally {
      setAdding(null);
    }
  };

  const isOnlyCard = blanketOffers.length + (pages.length > 0 ? 1 : 0) === 1;
  const page = Math.min(pageIndex, Math.max(pages.length - 1, 0));
  const activePage = pages[page];
  const framedCount = items
    .filter((item) => item.isFramedArt)
    .reduce((sum, item) => sum + (item.quantity > 0 ? item.quantity : 1), 0);
  const nextPrice = nextFramedArtPrice(framedCount);
  const stepPage = (delta: number) => {
    setPageIndex((page + delta + pages.length) % pages.length);
  };
  const PrevIcon = isHe ? ChevronRight : ChevronLeft;
  const NextIcon = isHe ? ChevronLeft : ChevronRight;
  const arrowClass =
    "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-dark-gray transition-colors hover:bg-warm-light";

  return (
    <section
      className={book ? "w-full" : "mt-4 w-full"}
      dir={isHe ? "rtl" : "ltr"}
      aria-label={t("cart.bookUpsell.ariaLabel")}
    >
      <h2 className="font-body-bold text-sm text-dark-gray md:text-base">
        {t("cart.bookUpsell.title")}
      </h2>

      <div className="hide-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-2 md:overflow-visible">
        {blanketOffers.map(({ item, color }) => {
          const key = `blanket-${lineIdOf(item)}`;
          return (
            <UpsellCard
              key={key}
              isOnlyCard={isOnlyCard}
              media={
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#F3EEE8]">
                  <Image
                    src={BLANKET_PRODUCT_IMAGES[matchingBlanketPattern(color)]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              }
              title={t("cart.bookUpsell.blanketTitle")}
              note={t("cart.bookUpsell.blanketNote")}
              price={<Price amount={GIFT_SET_BLANKET_UPGRADE_PRICE} compare={BLANKET_PRICE} />}
              isAdding={adding === key}
              failed={failed === key}
              onAdd={() =>
                void run(
                  key,
                  () => upgradeBookToGiftSet(lineIdOf(item)),
                  () => track(ANALYTICS_EVENTS.BOOK_UPSELL_ADDED, { product: "blanket" }),
                )
              }
            />
          );
        })}

        {activePage ? (
          <UpsellCard
            isOnlyCard={isOnlyCard}
            media={
              <>
                <div className="rounded-md bg-warm-light p-2">
                  <FramedArtFrameMockup imageUrl={activePage.url} maxWidthClassName="w-full" />
                </div>
                {pages.length > 1 ? (
                  <div className="mt-1.5 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepPage(-1)}
                      aria-label={t("cart.bookUpsell.prevPage")}
                      className={arrowClass}
                    >
                      <PrevIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <span className="whitespace-nowrap font-body text-xs text-medium-gray">
                      {t("cart.bookUpsell.pageCount")
                        .replace("{n}", String(page + 1))
                        .replace("{total}", String(pages.length))}
                    </span>
                    <button
                      type="button"
                      onClick={() => stepPage(1)}
                      aria-label={t("cart.bookUpsell.nextPage")}
                      className={arrowClass}
                    >
                      <NextIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                ) : null}
              </>
            }
            title={t("cart.bookUpsell.framedTitle")}
            note={t("cart.bookUpsell.framedNote")}
            price={
              <Price
                amount={nextPrice}
                compare={nextPrice < FRAMED_ART_UNIT_PRICE ? FRAMED_ART_UNIT_PRICE : undefined}
              />
            }
            isAdding={adding === "framed_art"}
            failed={failed === "framed_art"}
            onAdd={() =>
              void run(
                "framed_art",
                () => addFramedArtFromBook(activePage.lineId, activePage.index),
                () =>
                  track(ANALYTICS_EVENTS.BOOK_UPSELL_ADDED, {
                    product: "framed_art",
                    page: activePage.index + 1,
                  }),
              )
            }
          />
        ) : null}
      </div>
    </section>
  );
}
