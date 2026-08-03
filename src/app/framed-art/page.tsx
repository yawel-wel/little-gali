"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomeCtaButton } from "@/components/home-cta-button";
import { FreePreviewNote } from "@/components/feature-pill";
import { FramedArtFeaturesSection } from "@/components/framed-art-features-section";
import { FramedArtPricingCards } from "@/components/framed-art-pricing-cards";
import { QaPreviewSection } from "@/components/qa-preview-section";
import { FRAMED_ART_UNIT_PRICE } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const GALLERY_IMAGES = [
  "/framed-art-carousel.JPG",
  "/framed-art-carousel-1.JPG",
  "/framed-art-carousel-2.png",
  "/framed-art-carousel-3.png",
  "/framed-art-carousel-4.png",
] as const;

const DESCRIPTION_BULLET_KEYS = [
  "product.framedArt.description.bullet1",
  "product.framedArt.description.bullet2",
  "product.framedArt.description.bullet3",
  "product.framedArt.description.bullet4",
  "product.framedArt.description.bullet5",
  "product.framedArt.description.bullet6",
] as const;

const GOOD_TO_KNOW_SECTIONS = [
  {
    id: "dimensions",
    titleKey: "product.framedArt.goodToKnow.dimensions.title",
    lineKeys: [
      "product.framedArt.goodToKnow.dimensions.line1",
      "product.framedArt.goodToKnow.dimensions.line2",
    ],
  },
  {
    id: "material",
    titleKey: "product.framedArt.goodToKnow.material.title",
    lineKeys: [
      "product.framedArt.goodToKnow.material.line1",
      "product.framedArt.goodToKnow.material.line2",
    ],
  },
  {
    id: "hanging",
    titleKey: "product.framedArt.goodToKnow.hanging.title",
    lineKeys: ["product.framedArt.goodToKnow.hanging.line1"],
  },
  {
    id: "care",
    titleKey: "product.framedArt.goodToKnow.care.title",
    lineKeys: [
      "product.framedArt.goodToKnow.care.line1",
      "product.framedArt.goodToKnow.care.line2",
    ],
  },
] as const;

type ProductTab = "description" | "goodToKnow";

const PRODUCT_TABS: { id: ProductTab; labelKey: string }[] = [
  { id: "description", labelKey: "product.framedArt.tabs.description" },
  { id: "goodToKnow", labelKey: "product.framedArt.tabs.goodToKnow" },
];

export default function FramedArtProductPage() {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";
  const textAlign = isHe ? "text-right" : "text-left";
  const [imageIndex, setImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");

  const galleryAlt = (index: number) =>
    t("product.framedArt.gallery.imageAlt").replace("{num}", String(index + 1));

  const handleFlowStart = () => {
    track(ANALYTICS_EVENTS.FRAME_FLOW_STARTED);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />

      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav
            aria-label={t("product.framedArt.breadcrumbAria")}
            className={cn("py-4 text-sm font-body text-medium-gray", textAlign)}
          >
            <ol
              dir={isHe ? "rtl" : "ltr"}
              className="flex flex-wrap items-center gap-1.5"
            >
              <li>
                <Link href="/" className="hover:text-dark-gray transition-colors">
                  {t("product.framedArt.breadcrumbHome")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-light-gray">
                <span dir="ltr">{isHe ? "‹" : "›"}</span>
              </li>
              <li>
                <span className="text-dark-gray">
                  {t("product.framedArt.breadcrumbProduct")}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-8 pb-8 lg:grid-cols-2 lg:gap-14">
              {/* Image gallery */}
              <div className="order-1 lg:order-2 lg:sticky lg:top-[calc(72px+var(--banner-height,0px)+1.5rem)]">
                <div
                  className={cn(
                    "flex flex-col gap-3 sm:flex-row sm:items-stretch",
                    isHe ? "sm:flex-row-reverse" : "",
                  )}
                >
                  {/* Main image */}
                  <div className="relative order-1 min-w-0 flex-1 sm:order-2">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F3EEE8]">
                      <Image
                        src={GALLERY_IMAGES[imageIndex]}
                        alt={galleryAlt(imageIndex)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority
                      />
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div
                    className={cn(
                      "order-2 flex shrink-0 gap-2 sm:order-1 sm:flex-col sm:justify-start",
                      isHe ? "flex-row-reverse sm:flex-col" : "",
                    )}
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {GALLERY_IMAGES.map((src, index) => {
                      const isActive = imageIndex === index;
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setImageIndex(index)}
                          aria-label={galleryAlt(index)}
                          aria-pressed={isActive}
                          className={cn(
                            "relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-[#F3EEE8] sm:size-[4.5rem]",
                            isActive
                              ? "border-2 border-[#2d3748]"
                              : "border border-[#E8DFD4] hover:border-primary-orange/60",
                          )}
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="72px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div className={cn("order-2 flex flex-col gap-5 lg:order-1", textAlign)}>
                <h1 className="text-2xl font-heading font-bold text-dark-gray sm:text-3xl lg:text-4xl leading-tight">
                  {t("product.framedArt.name")}
                </h1>

                <div className="flex items-baseline justify-start" dir={isHe ? "rtl" : "ltr"}>
                  <span
                    className="inline-flex items-baseline gap-0 font-heading font-bold text-dark-gray"
                    dir="ltr"
                  >
                    <span className="text-xl">₪</span>
                    <span className="text-3xl leading-none">
                      {FRAMED_ART_UNIT_PRICE}
                    </span>
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="font-body text-medium-gray leading-snug whitespace-pre-line">
                    {t("product.framedArt.description.intro")}
                  </p>
                  <ul
                    className={cn(
                      "list-disc space-y-0.5 font-body text-medium-gray leading-snug",
                      isHe ? "mr-4 text-right" : "ml-4 text-left",
                    )}
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {DESCRIPTION_BULLET_KEYS.map((key) => (
                      <li key={key}>{t(key)}</li>
                    ))}
                  </ul>
                </div>

                <div className="w-full">
                  <FramedArtPricingCards className="px-0 pt-3" />
                  <p
                    className={cn(
                      "mt-2 font-body text-xs text-medium-gray",
                      isHe ? "text-right" : "text-left",
                    )}
                  >
                    {t("home.framedArt.discountNote")}
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/framed-art/upload"
                    className="block"
                    aria-label={t("product.framedArt.ctaAriaLabel")}
                    onClick={handleFlowStart}
                  >
                    <HomeCtaButton
                      fullWidth
                      sx={{
                        borderRadius: "9999px",
                        py: 1.75,
                        fontSize: "1rem",
                      }}
                    >
                      {t("product.framedArt.cta")}
                    </HomeCtaButton>
                  </Link>

                  <FreePreviewNote
                    label={t("home.framedArt.freePreview")}
                    locale={locale}
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <section
          className="w-full bg-white"
          aria-label={t("product.framedArt.tabs.ariaLabel")}
        >
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div
              className="flex flex-wrap items-end justify-start gap-6 border-b border-[#E8DFD4] sm:gap-10"
              dir={isHe ? "rtl" : "ltr"}
              role="tablist"
            >
              {PRODUCT_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "cursor-pointer border-b-2 px-1 py-4 text-xs font-body-bold uppercase tracking-[0.15em] transition-colors",
                      isActive
                        ? "border-dark-gray text-dark-gray"
                        : "border-transparent text-medium-gray hover:text-dark-gray",
                    )}
                  >
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              className={cn(
                "w-full max-w-3xl pt-4 pb-8 sm:pt-5 sm:pb-10",
                isHe ? "ml-auto text-right" : "text-left",
              )}
              dir={isHe ? "rtl" : "ltr"}
            >
              {activeTab === "goodToKnow" ? (
                <>
                  <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
                    {GOOD_TO_KNOW_SECTIONS.map((section) => (
                      <div key={section.id}>
                        <p className="font-body-bold text-base text-dark-gray">
                          {t(section.titleKey)}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          {section.lineKeys.map((lineKey) => (
                            <p
                              key={lineKey}
                              className="font-body text-sm text-medium-gray sm:text-base"
                            >
                              {t(lineKey)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 font-body text-sm leading-relaxed text-medium-gray sm:text-base">
                    <span className="font-body-bold">
                      {t("product.framedArt.goodToKnow.wallNoteTitle")}
                    </span>
                    <br />
                    <span className="whitespace-pre-line">
                      {t("product.framedArt.goodToKnow.wallNote")}
                    </span>
                  </p>
                </>
              ) : (
                <p className="font-body text-medium-gray leading-snug whitespace-pre-line">
                  {t("product.framedArt.accordion.overviewContent")}
                </p>
              )}
            </div>

            <div
              className="flex flex-wrap items-center justify-start gap-6 border-t border-[#E8DFD4] py-6 pb-10"
              dir={isHe ? "rtl" : "ltr"}
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-body text-dark-gray hover:text-primary-orange"
              >
                <MessageCircleQuestion className="size-4" aria-hidden="true" />
                {t("product.framedArt.askQuestion")}
              </Link>
            </div>
          </div>
        </section>

        <FramedArtFeaturesSection />

        <QaPreviewSection
          showCta={false}
          product="framed"
          subtitleKey="product.framedArt.qa.subtitle"
        />
      </main>

      <Footer />
    </div>
  );
}
