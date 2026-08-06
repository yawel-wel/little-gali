"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Testimonial } from "@/lib/loox/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Title } from "./title";

const LOOX_SHOP_DOMAIN =
  process.env.NEXT_PUBLIC_LOOX_SHOP_DOMAIN ?? "gjvyew-zk.myshopify.com";
const LOOX_PRODUCT_ID =
  process.env.NEXT_PUBLIC_LOOX_PRODUCT_ID ?? "7647868387431";

/**
 * Loox headless widget variants (see Loox docs → External domains).
 * Change via NEXT_PUBLIC_LOOX_WIDGET_VARIANT in env.
 */
export type LooxWidgetVariant =
  | "reviews-product"
  | "reviews-aggregate"
  | "testimonials-carousel"
  | "cards-carousel"
  | "gallery-carousel"
  | "dynamic-carousel"
  | "star-rating"
  | "snippets"
  | "video-slider";

const DEFAULT_VARIANT: LooxWidgetVariant = "testimonials-carousel";

const CAROUSEL_VARIANTS: LooxWidgetVariant[] = [
  "testimonials-carousel",
  "cards-carousel",
  "gallery-carousel",
];

export function LooxProductRating() {
  const { t, locale } = useLanguage();
  const [reviews, setReviews] = useState<Testimonial[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadReviews = async () => {
    if (reviews !== null || isLoading) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("/api/loox/reviews", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load Loox reviews");

      const data = (await response.json()) as { reviews?: Testimonial[] };
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (error) {
      console.error("Failed to load Loox reviews:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        id="loox-widget-script"
        src={`https://loox.io/widget/loox.js?shop=${LOOX_SHOP_DOMAIN}`}
        strategy="afterInteractive"
      />
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={loadReviews}
            className="min-h-5 cursor-pointer"
            aria-label={t("product.book.openReviews")}
          >
            <div
              className="loox-rating"
              data-fetch=""
              data-id={LOOX_PRODUCT_ID}
              data-pattern={`[rating] · [count] ${t("product.book.reviewsLink")}`}
              data-content-size="16"
              data-alignment={locale === "he" ? "right" : "left"}
              data-color-star="#fbbf24"
              data-color-text="#6b7280"
            />
          </button>
        </DialogTrigger>

        <DialogContent
          dir={locale === "he" ? "rtl" : "ltr"}
          className="max-h-[85vh] max-w-2xl gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="border-b border-[#E8DFD4] py-5 pr-16 pl-6 text-start">
            <DialogTitle className="font-heading text-2xl text-dark-gray">
              {t("product.book.reviewsTitle")}
            </DialogTitle>
            <DialogDescription>
              {reviews
                ? t("product.book.reviewsCount").replace(
                    "{count}",
                    String(reviews.length),
                  )
                : t("product.book.reviewsLink")}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(85vh-6.5rem)] overflow-y-auto px-6 py-2">
            {isLoading && (
              <p className="py-12 text-center font-body text-medium-gray">
                {t("cart.loading")}
              </p>
            )}

            {hasError && (
              <div className="py-12 text-center">
                <p className="font-body text-medium-gray">
                  {t("product.book.reviewsError")}
                </p>
                <button
                  type="button"
                  onClick={loadReviews}
                  className="mt-3 cursor-pointer font-body-bold text-dark-gray underline underline-offset-4"
                >
                  {t("product.book.reviewsRetry")}
                </button>
              </div>
            )}

            {!isLoading && !hasError && reviews?.length === 0 && (
              <p className="py-12 text-center font-body text-medium-gray">
                {t("product.book.noReviews")}
              </p>
            )}

            {!isLoading &&
              !hasError &&
              reviews?.map((review) => (
                <article
                  key={review.id}
                  className="border-b border-[#E8DFD4] py-5 last:border-b-0"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="font-body-bold text-dark-gray">{review.name}</p>
                    <div
                      className="flex shrink-0 gap-0.5"
                      aria-label={`${review.rating} / 5`}
                    >
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`size-4 ${
                            index < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="whitespace-pre-line font-body leading-relaxed text-medium-gray">
                    {review.text}
                  </p>
                </article>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function resolveVariant(): LooxWidgetVariant {
  const fromEnv = process.env.NEXT_PUBLIC_LOOX_WIDGET_VARIANT;
  const allowed: LooxWidgetVariant[] = [
    "reviews-product",
    "reviews-aggregate",
    ...CAROUSEL_VARIANTS,
    "dynamic-carousel",
    "star-rating",
    "snippets",
    "video-slider",
  ];

  if (fromEnv && allowed.includes(fromEnv as LooxWidgetVariant)) {
    return fromEnv as LooxWidgetVariant;
  }

  return DEFAULT_VARIANT;
}

declare global {
  interface Window {
    LOOX?: {
      initLooxCarouselV2?: () => void;
    };
  }
}

function initLooxWidget(variant: LooxWidgetVariant) {
  const loox = window.LOOX;
  if (!loox) return;

  if (CAROUSEL_VARIANTS.includes(variant)) {
    loox.initLooxCarouselV2?.();
  }
}

function LooxCarouselContainer({
  id,
  slideType,
}: {
  id: string;
  slideType: "testimonial" | "card" | "gallery";
}) {
  return (
    <div id="loox-default-carousel">
      <div
        className="loox-v2-carousel-container"
        id={id}
        data-slide-type={slideType}
      />
    </div>
  );
}

function LooxWidgetMarkup({ variant }: { variant: LooxWidgetVariant }) {
  switch (variant) {
    case "reviews-product":
      return <div id="looxReviews" data-product-id={LOOX_PRODUCT_ID} />;
    case "reviews-aggregate":
      return <div id="looxReviews" data-loox-aggregate />;
    case "testimonials-carousel":
      return (
        <LooxCarouselContainer
          id="LOOX-V2_CAROUSEL-testimonial"
          slideType="testimonial"
        />
      );
    case "cards-carousel":
      return (
        <LooxCarouselContainer id="LOOX-V2_CAROUSEL-card" slideType="card" />
      );
    case "gallery-carousel":
      return (
        <LooxCarouselContainer
          id="LOOX-V2_CAROUSEL-gallery"
          slideType="gallery"
        />
      );
    case "dynamic-carousel":
      return (
        <loox-dynamic-carousel-widget
          className="loox-widget"
          data-widget="dynamic-carousel-widget"
          show-review-text=""
          style={{ width: "100%" }}
        />
      );
    case "star-rating":
      return (
        <div
          className="loox-rating"
          data-fetch=""
          data-id={LOOX_PRODUCT_ID}
        />
      );
    case "snippets":
      return (
        <loox-snippets-widget
          product-id={LOOX_PRODUCT_ID}
          review-count="3"
        />
      );
    case "video-slider":
      return (
        <loox-video-slider-widget
          show-rating=""
          show-reviewer-name=""
          hide-arrows-mobile=""
          auto-play=""
        />
      );
    default:
      return null;
  }
}

interface LooxWidgetSectionProps {
  variant?: LooxWidgetVariant;
  showComparisonLabel?: boolean;
}

export function LooxWidgetSection({
  variant = resolveVariant(),
  showComparisonLabel = true,
}: LooxWidgetSectionProps) {
  const { t } = useLanguage();
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) {
      initLooxWidget(variant);
    }
  }, [variant]);

  const handleScriptLoad = () => {
    scriptLoadedRef.current = true;
    requestAnimationFrame(() => {
      initLooxWidget(variant);
    });
  };

  return (
    <>
      <Script
        src={`https://loox.io/widget/loox.js?shop=${LOOX_SHOP_DOMAIN}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <section className="relative bg-[#FAFAFA] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Title
              highlightText={t("home.testimonials.titleHighlight")}
              size="lg"
              className="mb-2"
            >
              {t("home.testimonials.title")}
            </Title>
            {showComparisonLabel && (
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Loox widget · {variant}
              </p>
            )}
          </div>

          <div className="max-w-5xl mx-auto min-h-[200px]">
            <LooxWidgetMarkup variant={variant} />
          </div>
        </div>
      </section>
    </>
  );
}
