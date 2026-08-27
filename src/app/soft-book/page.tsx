"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomeCtaButton } from "@/components/home-cta-button";
import { FreePreviewNote } from "@/components/feature-pill";
import { BookInUseSection } from "@/components/book-in-use-section";
import { QaPreviewSection } from "@/components/qa-preview-section";
import { LooxProductRating } from "@/components/loox-widget-section";
import { BOOK_PRICE } from "@/lib/constants";
import {
  type BookColor,
  DEFAULT_BOOK_COLOR,
  BOOK_COLOR_LABEL_KEYS,
  BOOK_COLOR_SWATCHES,
  BOOK_PRODUCT_GALLERY,
  getPreferredBookColor,
  setPreferredBookColor,
} from "@/lib/book-color";
import { useLanguage } from "@/lib/LanguageContext";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const DESCRIPTION_FEATURE_ITEMS: {
  key:
    | "product.book.description.bullet2"
    | "product.book.description.bullet3"
    | "product.book.description.bullet4"
    | "product.book.description.bullet5"
    | "product.book.description.bullet6"
    | "product.book.description.bullet7";
  iconSrc: string;
}[] = [
  {
    key: "product.book.description.bullet2",
    iconSrc: "/soft-book-features/swap.png",
  },
  {
    key: "product.book.description.bullet3",
    iconSrc: "/soft-book-features/mirror.png",
  },
  {
    key: "product.book.description.bullet4",
    iconSrc: "/soft-book-features/sparkle.png",
  },
  {
    key: "product.book.description.bullet5",
    iconSrc: "/soft-book-features/shield.png",
  },
  {
    key: "product.book.description.bullet6",
    iconSrc: "/soft-book-features/baby.png",
  },
  {
    key: "product.book.description.bullet7",
    iconSrc: "/soft-book-features/gift.png",
  },
];

type ProductTab = "description" | "goodToKnow";

const GOOD_TO_KNOW_SECTIONS = [
  {
    id: "dimensions",
    titleKey: "product.book.goodToKnow.dimensions.title",
    lineKeys: [
      "product.book.goodToKnow.dimensions.line1",
      "product.book.goodToKnow.dimensions.line2",
    ],
  },
  {
    id: "care",
    titleKey: "product.book.goodToKnow.care.title",
    lineKeys: [
      "product.book.goodToKnow.care.line1",
      "product.book.goodToKnow.care.line2",
    ],
  },
] as const;

const PRODUCT_TABS: {
  id: ProductTab;
  labelKey: string;
  contentKey: string;
}[] = [
  {
    id: "description",
    labelKey: "product.book.tabs.description",
    contentKey: "product.book.accordion.overviewContent",
  },
  {
    id: "goodToKnow",
    labelKey: "product.book.tabs.goodToKnow",
    contentKey: "",
  },
];

export default function SoftBookProductPage() {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";
  const textAlign = isHe ? "text-right" : "text-left";
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<BookColor>(DEFAULT_BOOK_COLOR);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");

  useEffect(() => {
    const preferred = getPreferredBookColor();
    if (preferred) {
      setSelectedColor(preferred);
    }
  }, []);

  const colorImages = BOOK_PRODUCT_GALLERY[selectedColor];
  const currentImageSrc = colorImages[imageIndex];

  const selectColor = (color: BookColor) => {
    setSelectedColor(color);
    setPreferredBookColor(color);
    setImageIndex(0);
  };

  const galleryAlt = (index: number) =>
    t("product.book.gallery.imageAlt")
      .replace("{num}", String(index + 1))
      .replace("{color}", t(BOOK_COLOR_LABEL_KEYS[selectedColor]));

  const galleryImageClass = (index: number) => {
    if (index === 3) return "object-cover object-left";
    if (selectedColor === "light" && index === 1) return "object-cover object-right";
    return "object-cover";
  };

  const handleFlowStart = () => {
    setPreferredBookColor(selectedColor);
    track(ANALYTICS_EVENTS.BOOKLET_FLOW_STARTED, {
      book_color: selectedColor,
    });
  };

  const uploadHref = "/upload";
  const activeTabContent =
    PRODUCT_TABS.find((tab) => tab.id === activeTab)?.contentKey ??
    PRODUCT_TABS[0].contentKey;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />

      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <div className="container mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav
            aria-label={t("product.book.breadcrumbAria")}
            className={cn("py-4 text-sm font-body text-medium-gray", textAlign)}
          >
            <ol
              dir={isHe ? "rtl" : "ltr"}
              className="flex flex-wrap items-center gap-1.5"
            >
              <li>
                <Link href="/" className="hover:text-dark-gray transition-colors">
                  {t("product.book.breadcrumbHome")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-light-gray">
                <span dir="ltr">{isHe ? "‹" : "›"}</span>
              </li>
              <li>
                <span className="text-dark-gray">{t("product.book.breadcrumbProduct")}</span>
              </li>
            </ol>
          </nav>

          <div className="mx-auto w-full max-w-6xl min-w-0">
            <div className="grid w-full min-w-0 items-start gap-8 pb-8 lg:grid-cols-2 lg:gap-14 lg:pb-8">
              {/* Image gallery */}
              <div className="order-1 w-full min-w-0 lg:order-2 lg:sticky lg:top-[calc(72px+var(--banner-height,0px)+1.5rem)]">
                <div
                  className={cn(
                    "flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch",
                    isHe ? "sm:flex-row-reverse" : "",
                  )}
                >
                  {/* Main image */}
                  <div className="relative order-1 w-full min-w-0 flex-1 sm:order-2">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F3EEE8]">
                      <Image
                        src={currentImageSrc}
                        alt={galleryAlt(imageIndex)}
                        fill
                        className={galleryImageClass(imageIndex)}
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority
                      />
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div
                    className={cn(
                      "order-2 flex w-full min-w-0 gap-2 overflow-x-auto pb-0.5 sm:order-1 sm:w-auto sm:flex-col sm:justify-start sm:overflow-visible",
                      isHe ? "flex-row-reverse sm:flex-col" : "",
                    )}
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {colorImages.map((src, index) => {
                      const isActive = imageIndex === index;
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setImageIndex(index)}
                          aria-label={galleryAlt(index)}
                          aria-pressed={isActive}
                          className={cn(
                            "relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-[#F3EEE8] sm:size-[4.5rem]",
                            isActive
                              ? "border-2 border-[#2d3748]"
                              : "border border-[#E8DFD4] hover:border-primary-orange/60",
                          )}
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className={galleryImageClass(index)}
                            sizes="72px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div
                className={cn(
                  "order-2 flex w-full min-w-0 max-w-full flex-col gap-5 lg:order-1",
                  textAlign,
                )}
              >
                <div className="order-1 space-y-1.5">
                  <h1 className="text-2xl font-heading font-bold text-dark-gray sm:text-3xl lg:text-4xl leading-tight">
                    {t("product.book.name")}
                  </h1>

                  <LooxProductRating />
                </div>

                <div
                  className={cn(
                    "order-2 flex items-baseline",
                    isHe ? "justify-start" : "justify-start",
                  )}
                  dir={isHe ? "rtl" : "ltr"}
                >
                  <span
                    className="inline-flex items-baseline gap-0 font-heading font-bold text-dark-gray"
                    dir="ltr"
                  >
                    <span className="text-xl">₪</span>
                    <span className="text-3xl leading-none">{BOOK_PRICE}</span>
                  </span>
                </div>

                <div className="order-4 w-full min-w-0 space-y-4 lg:order-3">
                  <p className="max-w-full break-words font-body text-medium-gray leading-snug whitespace-pre-line">
                    {t("product.book.description.intro")}
                  </p>
                  <ul
                    className={cn(
                      "grid w-fit max-w-full grid-cols-3 gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-3.5",
                      isHe ? "ml-auto" : "mr-auto",
                    )}
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {DESCRIPTION_FEATURE_ITEMS.map(({ key, iconSrc }) => (
                      <li
                        key={key}
                        className="flex min-w-0 max-w-[6.5rem] flex-col items-center gap-1 text-center sm:max-w-[7.25rem]"
                      >
                        <Image
                          src={iconSrc}
                          alt=""
                          width={32}
                          height={32}
                          className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                          aria-hidden
                        />
                        <span className="font-handwritten max-w-full break-words text-[11px] leading-tight text-dark-gray sm:text-xs">
                          {t(key)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Color selector */}
                <div className="order-3 w-full min-w-0 space-y-2.5 lg:order-4">
                  <p className="text-sm font-body-bold text-dark-gray">
                    {t("product.book.colorLabel")}:{" "}
                    <span className="font-body text-medium-gray">
                      {t(BOOK_COLOR_LABEL_KEYS[selectedColor])}
                    </span>
                  </p>
                  <div
                    className="flex w-full flex-wrap justify-start gap-3"
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {(["light", "dark"] as BookColor[]).map((color) => {
                      const isSelected = selectedColor === color;
                      const label = t(BOOK_COLOR_LABEL_KEYS[color]);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => selectColor(color)}
                          aria-pressed={isSelected}
                          aria-label={label}
                          className={cn(
                            "relative size-[2.7rem] cursor-pointer overflow-hidden rounded-md bg-white p-0.5 transition-colors sm:size-12",
                            isSelected
                              ? "border-2 border-[#2d3748]"
                              : "border border-[#E8DFD4] hover:border-primary-orange/60",
                          )}
                        >
                          <Image
                            src={BOOK_COLOR_SWATCHES[color]}
                            alt={label}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div className="order-5 w-full min-w-0 space-y-3 pt-2">
                  <Link
                    href={uploadHref}
                    className="block w-full max-w-full"
                    aria-label={t("home.book.ctaAriaLabel")}
                    onClick={handleFlowStart}
                  >
                    <HomeCtaButton
                      fullWidth
                      sx={{
                        borderRadius: "9999px",
                        px: { xs: 2.5, sm: 5 },
                        py: { xs: 1.25, sm: 1.75 },
                        fontSize: { xs: "0.9375rem", sm: "1rem" },
                      }}
                    >
                      {t("product.book.ctaSecondary")}
                    </HomeCtaButton>
                  </Link>

                  <FreePreviewNote
                    label={t("home.book.freePreview")}
                    locale={locale}
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <section className="w-full bg-white" aria-label={t("product.book.tabs.ariaLabel")}>
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div
                className={cn(
                  "flex flex-wrap items-end gap-6 border-b border-[#E8DFD4] sm:gap-10",
                  isHe ? "justify-start" : "justify-start",
                )}
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
                        {t("product.book.goodToKnow.mirrorNoteTitle")}
                      </span>
                      <br />
                      <span className="whitespace-pre-line">
                        {t("product.book.goodToKnow.mirrorNote")}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="font-body text-medium-gray leading-snug whitespace-pre-line">
                    {t(activeTabContent)}
                  </p>
                )}
              </div>

              <div
                className={cn(
                  "flex flex-wrap items-center gap-6 border-t border-[#E8DFD4] py-6 pb-10",
                  isHe ? "justify-start" : "justify-start",
                )}
                dir={isHe ? "rtl" : "ltr"}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-body text-dark-gray hover:text-primary-orange"
                >
                  <MessageCircleQuestion className="size-4" aria-hidden="true" />
                  {t("product.book.askQuestion")}
                </Link>
              </div>
            </div>
          </section>

        <BookInUseSection />

        <QaPreviewSection
          showCta={false}
          subtitleKey="product.book.qa.subtitle"
        />
      </main>

      <Footer />
    </div>
  );
}
