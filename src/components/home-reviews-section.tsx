"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Quote, Star } from "lucide-react";
import { Title } from "@/components/title";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BOOK_IN_USE_ITEMS,
  BookInUseSection,
  bookInUseSrc,
  type BookInUseItem,
} from "@/components/book-in-use-section";
import { ScrollableMarqueeRow } from "@/components/scrollable-marquee-row";
import { useLanguage } from "@/lib/LanguageContext";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { isHomeReviewsMixedEnabled } from "@/lib/feature-flags";
import { splitOnHighlight } from "@/lib/loox/highlight";
import type { HomeReview } from "@/lib/loox/types";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";

/** Seconds per card for one loop: slow enough to read a card as it passes. */
const SECONDS_PER_CARD = 6;
const SKELETON_CARDS = 6;

/** Height of a full card (and of a column of two compact cards, and of a book photo). */
const TILE_HEIGHT_CLASS = "h-[340px] lg:h-[360px]";
const CARD_WIDTH_CLASS = "w-[56vw] max-w-[238px] sm:w-[260px] sm:max-w-none lg:w-[300px]";

/** Card size. Narrow cards with the photo on top, on every screen size. */
const REVIEW_CARD_CLASS = `relative ${TILE_HEIGHT_CLASS} ${CARD_WIDTH_CLASS} shrink-0 overflow-hidden rounded-2xl`;
/** Half-height card: two of them stack into one full-card column. */
const COMPACT_CARD_CLASS = "relative min-h-0 w-full flex-1 overflow-hidden rounded-2xl";

function ReviewPhoto({
  review,
  isCopy,
  className,
}: {
  review: HomeReview;
  isCopy: boolean;
  className: string;
}) {
  const { t } = useLanguage();
  if (!review.imageUrl) return null;

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-warm-light ${className}`}>
      {/* Loox serves its own sized photos; a plain img avoids Next image optimization costs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={review.imageUrl}
        alt={
          isCopy
            ? ""
            : review.imageAlt ??
              t("home.reviews.photoAlt").replace("{name}", review.name)
        }
        loading="lazy"
        decoding="async"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className={`${SENTRY_REPLAY_BLOCK_USER_IMAGE} absolute inset-0 size-full object-cover`}
      />
    </div>
  );
}

/** Highlight only when it picks out a small part of the review; a mostly-highlighted review reads as plain text. */
const MAX_HIGHLIGHT_SHARE = 0.4;
/** Long text before the highlight is cut so the highlight stays inside the card. */
const MAX_TEXT_BEFORE_HIGHLIGHT = 120;

function ReviewQuote({
  review,
  full = false,
}: {
  review: HomeReview;
  /** In the full-review popup, never cut the text before the highlight. */
  full?: boolean;
}) {
  const found = splitOnHighlight(review.text, review.highlight);
  const parts =
    found && found.match.length / review.text.length <= MAX_HIGHLIGHT_SHARE
      ? found
      : null;

  return (
    <p
      dir="auto"
      className="whitespace-pre-line font-body text-sm leading-relaxed text-dark-gray"
    >
      {parts ? (
        <>
          {!full && parts.before.length > MAX_TEXT_BEFORE_HIGHLIGHT
            ? "… "
            : parts.before}
          <mark className="bg-soft-yellow-light font-body-bold text-inherit [box-decoration-break:clone] px-0.5">
            {parts.match}
          </mark>
          {parts.after}
        </>
      ) : (
        review.text
      )}
    </p>
  );
}

/** Burgundy check. With `label` it is announced (when no visible text says "verified"). */
function VerifiedMark({ label }: { label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent-burgundy"
    >
      <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

/** A photo of the book in use, as tall as a review card. */
function BookPhotoTile({ item, isCopy }: { item: BookInUseItem; isCopy: boolean }) {
  const { t } = useLanguage();
  return (
    <div
      className={`relative ${TILE_HEIGHT_CLASS} aspect-[3/4] shrink-0 overflow-hidden rounded-2xl bg-warm-cream`}
    >
      <Image
        src={bookInUseSrc(item)}
        alt={
          isCopy
            ? ""
            : t("home.bookInUse.imageAlt").replace("{num}", String(item.num))
        }
        fill
        draggable={false}
        className="object-cover"
        sizes="270px"
      />
    </div>
  );
}

type Tile =
  | { kind: "review"; key: string; review: HomeReview }
  | { kind: "pair"; key: string; reviews: [HomeReview, HomeReview] }
  | { kind: "book"; key: string; item: BookInUseItem };

/**
 * Mixed layout: photo reviews (full cards) alternate with columns of two text-only
 * reviews (half-height cards), and a book-in-use photo follows every 2–3 of those.
 */
function buildMixedTiles(reviews: HomeReview[]): Tile[] {
  const withPhoto = reviews.filter((review) => review.imageUrl);
  const textOnly = reviews.filter((review) => !review.imageUrl);

  const reviewTiles: Tile[] = [];
  const pairs: Tile[] = [];
  for (let i = 0; i + 1 < textOnly.length; i += 2) {
    pairs.push({
      kind: "pair",
      key: `${textOnly[i].id}+${textOnly[i + 1].id}`,
      reviews: [textOnly[i], textOnly[i + 1]],
    });
  }
  const singles: Tile[] = withPhoto.map((review) => ({
    kind: "review",
    key: review.id,
    review,
  }));
  // An odd one out has no partner: it gets a full card.
  if (textOnly.length % 2 === 1) {
    const last = textOnly[textOnly.length - 1];
    pairs.push({ kind: "review", key: last.id, review: last });
  }
  for (let i = 0; i < Math.max(singles.length, pairs.length); i += 1) {
    if (singles[i]) reviewTiles.push(singles[i]);
    if (pairs[i]) reviewTiles.push(pairs[i]);
  }

  const tiles: Tile[] = [];
  let bookIndex = 0;
  let sinceBook = 0;
  let gap = 2;
  for (const tile of reviewTiles) {
    tiles.push(tile);
    sinceBook += 1;
    if (sinceBook === gap) {
      const item = BOOK_IN_USE_ITEMS[bookIndex % BOOK_IN_USE_ITEMS.length];
      tiles.push({ kind: "book", key: `book-${bookIndex}`, item });
      bookIndex += 1;
      sinceBook = 0;
      gap = gap === 2 ? 3 : 2;
    }
  }
  return tiles;
}

function ReviewCard({
  review,
  isCopy,
  onReadMore,
  compact = false,
}: {
  review: HomeReview;
  isCopy: boolean;
  onReadMore: (review: HomeReview) => void;
  /** Half height, for a review without a photo stacked with another one. */
  compact?: boolean;
}) {
  const { t, locale } = useLanguage();
  const textRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  // "Read more" only when the text doesn't fit in the card.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const ratingLabel = t("home.reviews.ratingAria").replace(
    "{rating}",
    String(review.rating),
  );
  const initial = review.name.trim().charAt(0).toUpperCase();

  return (
    <article
      dir={locale === "he" ? "rtl" : "ltr"}
      className={`${compact ? COMPACT_CARD_CLASS : REVIEW_CARD_CLASS} flex flex-col gap-3 border border-[#E8DFD4] bg-warm-cream ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <ReviewPhoto
        review={review}
        isCopy={isCopy}
        className="h-32 w-full lg:h-36"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Quote
          aria-hidden="true"
          className={`mb-3 size-7 shrink-0 fill-current text-accent-burgundy rtl:-scale-x-100 ${
            review.imageUrl || compact ? "hidden" : ""
          }`}
        />

        <div className={`flex items-center gap-2.5 ${compact ? "mb-2" : "mb-3"}`}>
          <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-full bg-accent-burgundy font-body-bold text-white ${
              compact ? "size-8 text-sm" : "size-9 text-base lg:size-10"
            }`}
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-1 font-body-bold text-sm text-dark-gray">
              <span dir="auto" className="truncate">
                {review.name}
              </span>
              {/* Compact cards have no footer: the verified mark sits by the name. */}
              {compact && review.verified && (
                <VerifiedMark label={t("home.reviews.verified")} />
              )}
            </p>
            <div className="flex gap-0.5" role="img" aria-label={ratingLabel}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  aria-hidden="true"
                  className={`size-3.5 lg:size-4 ${
                    index < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={textRef}
          className={`min-h-0 flex-1 overflow-hidden ${
            overflowing
              ? "[mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
              : ""
          }`}
        >
          <ReviewQuote review={review} />
        </div>

        {overflowing && (
          <button
            type="button"
            onClick={() => onReadMore(review)}
            tabIndex={isCopy ? -1 : undefined}
            className="mt-1 self-start cursor-pointer font-body-bold text-sm text-accent-burgundy underline underline-offset-4 hover:opacity-80"
          >
            {t("home.reviews.readMore")}
          </button>
        )}

        {!compact && review.verified && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-[#E8DFD4] pt-3 font-body text-sm text-medium-gray">
            <span>{t("home.reviews.verified")}</span>
            <VerifiedMark />
          </div>
        )}
      </div>
    </article>
  );
}

function ReviewDialog({
  review,
  onClose,
}: {
  review: HomeReview | null;
  onClose: () => void;
}) {
  const { t, locale } = useLanguage();

  return (
    <Dialog open={review !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir={locale === "he" ? "rtl" : "ltr"}
        className="max-h-[85vh] max-w-lg gap-0 overflow-y-auto bg-warm-cream p-6 pt-12"
      >
        {review && (
          <>
            <ReviewPhoto
              review={review}
              isCopy={false}
              className="mb-4 aspect-[4/3] w-full"
            />
            <DialogHeader className="mb-3 flex-row items-center gap-2.5 space-y-0 text-start">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-burgundy font-body-bold text-base text-white"
              >
                {review.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <DialogTitle dir="auto" className="font-body-bold text-base text-dark-gray">
                  {review.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("home.reviews.ratingAria").replace(
                    "{rating}",
                    String(review.rating),
                  )}
                </DialogDescription>
                <div className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${
                        index < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </DialogHeader>

            <ReviewQuote review={review} full />

            {review.verified && (
              <div className="mt-4 flex items-center gap-1.5 border-t border-[#E8DFD4] pt-3 font-body text-sm text-medium-gray">
                <span>{t("home.reviews.verified")}</span>
                <VerifiedMark />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-3 overflow-hidden px-4 lg:gap-4" aria-hidden="true">
      {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
        <div key={index} className={`${REVIEW_CARD_CLASS} bg-warm-cream`} />
      ))}
    </div>
  );
}

/** Photo reviews first, keeping Loox's featured order within each group. */
function photosFirst(reviews: HomeReview[]): HomeReview[] {
  return [
    ...reviews.filter((review) => review.imageUrl),
    ...reviews.filter((review) => !review.imageUrl),
  ];
}

export function HomeReviewsSection() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<HomeReview[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openReview, setOpenReview] = useState<HomeReview | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/loox/home-reviews")
      .then(async (response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = (await response.json()) as { reviews?: HomeReview[] };
        if (cancelled) return;
        const list = Array.isArray(data.reviews) ? data.reviews : [];
        if (list.length === 0) setFailed(true);
        else setReviews(list);
      })
      .catch(() => {
        // The API route already reports to Sentry; here we just fall back.
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const mixed = isHomeReviewsMixedEnabled();
  const tiles = useMemo<Tile[] | null>(() => {
    if (!reviews) return null;
    if (mixed) return buildMixedTiles(reviews);
    return photosFirst(reviews).map((review) => ({
      kind: "review" as const,
      key: review.id,
      review,
    }));
  }, [reviews, mixed]);

  const openFullReview = (selected: HomeReview) => {
    setOpenReview(selected);
    track(ANALYTICS_EVENTS.HOME_REVIEW_EXPANDED, {
      has_photo: Boolean(selected.imageUrl),
    });
  };

  const renderTile = (tile: Tile, isCopy: boolean) => {
    switch (tile.kind) {
      case "review":
        return (
          <ReviewCard review={tile.review} isCopy={isCopy} onReadMore={openFullReview} />
        );
      case "pair":
        return (
          <div className={`flex ${TILE_HEIGHT_CLASS} ${CARD_WIDTH_CLASS} shrink-0 flex-col gap-3 lg:gap-4`}>
            {tile.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isCopy={isCopy}
                onReadMore={openFullReview}
                compact
              />
            ))}
          </div>
        );
      case "book":
        return <BookPhotoTile item={tile.item} isCopy={isCopy} />;
    }
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !reviews || trackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        trackedRef.current = true;
        track(ANALYTICS_EVENTS.HOME_REVIEWS_VIEWED, {
          review_count: reviews.length,
          highlight_count: reviews.filter((review) => review.highlight).length,
        });
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reviews]);

  // If Loox is down, keep the page whole with the section that was here before.
  if (failed) return <BookInUseSection />;

  return (
    <section
      ref={sectionRef}
      id="reviews"
      aria-labelledby="home-reviews-heading"
      className="bg-white pt-6 pb-10 sm:pb-12 lg:pb-20"
    >
      <div className="mb-6 px-4 text-center">
        <Title
          as="h2"
          id="home-reviews-heading"
          highlightText={t("home.testimonials.titleHighlight")}
          size="lg"
        >
          {t("home.testimonials.title")}
        </Title>
      </div>

      {tiles ? (
        <ScrollableMarqueeRow
          items={tiles}
          durationSeconds={tiles.length * SECONDS_PER_CARD}
          gapClassName="gap-3 pe-3 lg:gap-4 lg:pe-4"
          paused={openReview !== null}
          previousLabel={t("home.reviews.prevAria")}
          nextLabel={t("home.reviews.nextAria")}
          getKey={(tile) => tile.key}
          renderItem={renderTile}
        />
      ) : (
        <SkeletonRow />
      )}

      <ReviewDialog review={openReview} onClose={() => setOpenReview(null)} />
    </section>
  );
}
