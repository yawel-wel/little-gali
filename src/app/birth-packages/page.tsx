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
import { SoftBookFeatureHighlights } from "@/components/soft-book-feature-highlights";
import { PrintPatternPicker } from "@/components/print-pattern-picker";
import { BIRTH_PACKAGE_PRICE } from "@/lib/constants";
import {
  DEFAULT_BLANKET_PATTERN,
  BLANKET_PATTERN_LABEL_KEYS,
  type BlanketPattern,
} from "@/lib/blanket";
import {
  getGiftSetBlanketPattern,
  startGiftSetFlow,
} from "@/lib/gift-set";
import { getPreferredBookColor, setPreferredBookColor } from "@/lib/book-color";
import { useLanguage } from "@/lib/LanguageContext";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const BIRTH_PACKAGE_GALLERY: Record<BlanketPattern, readonly string[]> = {
  dots: [
    "/birth-package-dots-1.jpg",
    "/birth-package-dots-2.jpg",
    "/birth-package-dots-3.jpg",
    "/birth-package-dots-4.jpg",
    "/birth-package-dots-5.jpg",
    "/birth-package-dots-6.jpg",
  ],
  leopard: [
    "/birth-package-leopard-1.jpg",
    "/birth-package-leopard-2.jpg",
    "/birth-package-leopard-3.jpg",
    "/birth-package-leopard-4.jpg",
    "/birth-package-leopard-5.jpg",
    "/birth-package-leopard-6.jpg",
  ],
};

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
    contentKey: "product.birthPackage.tabs.descriptionContent",
  },
  {
    id: "goodToKnow",
    labelKey: "product.book.tabs.goodToKnow",
    contentKey: "",
  },
];

export default function BirthPackagesProductPage() {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";
  const textAlign = isHe ? "text-right" : "text-left";
  const [imageIndex, setImageIndex] = useState(0);
  const [printPattern, setPrintPattern] = useState<BlanketPattern>(
    DEFAULT_BLANKET_PATTERN,
  );
  const [activeTab, setActiveTab] = useState<ProductTab>("description");

  useEffect(() => {
    setPrintPattern(getGiftSetBlanketPattern());
  }, []);

  const patternImages = BIRTH_PACKAGE_GALLERY[printPattern];
  const currentImageSrc = patternImages[imageIndex] ?? patternImages[0];

  const selectPrint = (pattern: BlanketPattern) => {
    setPrintPattern(pattern);
    setImageIndex(0);
  };

  const galleryAlt = (index: number) =>
    t("product.birthPackage.gallery.imageAlt")
      .replace("{num}", String(index + 1))
      .replace("{print}", t(BLANKET_PATTERN_LABEL_KEYS[printPattern]));

  const handleFlowStart = () => {
    const preferred = getPreferredBookColor();
    if (preferred) setPreferredBookColor(preferred);
    startGiftSetFlow(printPattern);
    track(ANALYTICS_EVENTS.BOOKLET_FLOW_STARTED, {
      book_color: preferred ?? "light",
    });
  };

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
          <nav
            aria-label={t("product.birthPackage.breadcrumbAria")}
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
                <span className="text-dark-gray">
                  {t("product.birthPackage.breadcrumbProduct")}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mx-auto w-full max-w-6xl min-w-0">
            <div className="grid w-full min-w-0 items-start gap-8 pb-8 lg:grid-cols-2 lg:gap-14 lg:pb-8">
              <div className="order-1 w-full min-w-0 lg:order-2 lg:sticky lg:top-[calc(72px+var(--banner-height,0px)+1.5rem)]">
                <div
                  className={cn(
                    "flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch",
                    isHe ? "sm:flex-row-reverse" : "",
                  )}
                >
                  <div className="relative order-1 w-full min-w-0 flex-1 sm:order-2">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F3EEE8]">
                      <Image
                        src={currentImageSrc}
                        alt={galleryAlt(imageIndex)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "order-2 flex w-full min-w-0 gap-2 overflow-x-auto pb-0.5 sm:order-1 sm:w-auto sm:flex-col sm:justify-start sm:overflow-visible",
                      isHe ? "flex-row-reverse sm:flex-col" : "",
                    )}
                    dir={isHe ? "rtl" : "ltr"}
                  >
                    {patternImages.map((src, index) => {
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
                            className="object-cover"
                            sizes="72px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "order-2 flex w-full min-w-0 max-w-full flex-col gap-5 lg:order-1",
                  textAlign,
                )}
              >
                <div className="order-1 space-y-1.5">
                  <h1 className="text-2xl font-heading font-bold leading-tight text-dark-gray sm:text-3xl lg:text-4xl">
                    {t("product.birthPackage.name")}
                  </h1>
                </div>

                <div
                  className="order-2 -my-3 flex items-baseline"
                  dir={isHe ? "rtl" : "ltr"}
                >
                  <span
                    className="inline-flex items-baseline gap-0 font-heading font-bold text-dark-gray"
                    dir="ltr"
                  >
                    <span className="text-xl">₪</span>
                    <span className="text-3xl leading-none">
                      {BIRTH_PACKAGE_PRICE}
                    </span>
                  </span>
                </div>

                <div className="order-4 w-full min-w-0 space-y-4 lg:order-3">
                  <p className="max-w-full whitespace-pre-line break-words font-body leading-snug text-medium-gray">
                    {t("product.birthPackage.description")}
                  </p>
                  <div
                    className={cn(
                      "w-full space-y-4 lg:w-fit lg:max-w-full",
                      isHe ? "lg:ml-auto" : "lg:mr-auto",
                    )}
                  >
                    <SoftBookFeatureHighlights />
                  </div>
                </div>

                <div className="order-3 w-full min-w-0 lg:order-4">
                  <PrintPatternPicker
                    pattern={printPattern}
                    onPatternChange={selectPrint}
                  />
                </div>

                <div className="order-5 w-full min-w-0 space-y-3 pt-2">
                  <Link
                    href="/upload"
                    className="block w-full max-w-full"
                    aria-label={t("home.book.ctaAriaLabel")}
                    onClick={handleFlowStart}
                  >
                    <HomeCtaButton
                      fullWidth
                      sx={{
                        borderRadius: "5px",
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

        <section
          className="w-full bg-white"
          aria-label={t("product.book.tabs.ariaLabel")}
        >
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div
              className="flex flex-wrap items-end gap-6 border-b border-[#E8DFD4] sm:gap-10"
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
                  <p className="font-body-bold text-base text-dark-gray">
                    {t("product.birthPackage.goodToKnow.bookHeading")}
                  </p>
                  <div className="mt-4 grid gap-8 sm:grid-cols-2 sm:gap-12">
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

                  <p className="mt-10 font-body-bold text-base text-dark-gray">
                    {t("product.birthPackage.goodToKnow.blanketHeading")}
                  </p>
                  <div className="mt-4 grid gap-8 sm:grid-cols-2 sm:gap-12">
                    <div>
                      <p className="font-body-bold text-base text-dark-gray">
                        {t(
                          "product.birthPackage.goodToKnow.blanket.dimensions.title",
                        )}
                      </p>
                      <p className="mt-1 font-body text-sm text-medium-gray sm:text-base">
                        {t(
                          "product.birthPackage.goodToKnow.blanket.dimensions.line1",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="font-body-bold text-base text-dark-gray">
                        {t(
                          "product.birthPackage.goodToKnow.blanket.fabric.title",
                        )}
                      </p>
                      <p className="mt-1 font-body text-sm text-medium-gray sm:text-base">
                        {t(
                          "product.birthPackage.goodToKnow.blanket.fabric.line1",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="font-body-bold text-base text-dark-gray">
                        {t(
                          "product.birthPackage.goodToKnow.blanket.care.title",
                        )}
                      </p>
                      <p className="mt-1 font-body text-sm text-medium-gray sm:text-base">
                        {t(
                          "product.birthPackage.goodToKnow.blanket.care.line1",
                        )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="font-body leading-snug whitespace-pre-line text-medium-gray">
                  {t(activeTabContent)}
                </p>
              )}
            </div>

            <div
              className="flex flex-wrap items-center gap-6 border-t border-[#E8DFD4] py-6 pb-10"
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
