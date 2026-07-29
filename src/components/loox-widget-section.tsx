"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useLanguage } from "@/lib/LanguageContext";
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
