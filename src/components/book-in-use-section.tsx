"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";

import "swiper/css";

const BOOK_IN_USE_IMAGES = [
  { num: 100, ext: "jpg" },
  { num: 2, ext: "JPG" },
  { num: 3, ext: "jpg" },
  { num: 4, ext: "JPG" },
  { num: 5, ext: "JPG" },
  { num: 60, ext: "JPG" },
  { num: 7, ext: "JPG" },
  { num: 8, ext: "jpg" },
  { num: 9, ext: "JPG" },
  { num: 10, ext: "jpg" },
  { num: 11, ext: "JPG" },
] as const;

const dotVariants = {
  inactive: {
    width: "0.5rem",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  active: {
    width: ["0.4rem", "0.2rem", "1.5rem", "1.25rem"],
    transition: { duration: 0.45, ease: "easeOut", times: [0, 0.1, 0.65, 1] },
  },
};

function BookInUseImage({
  num,
  ext,
  alt,
  priority = false,
}: {
  num: number;
  ext: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
      <Image
        src={`/book-in-use-${num}.${ext}`}
        alt={alt}
        fill
        priority={priority}
        className="object-cover bg-neutral-100"
        sizes="(max-width: 1024px) 28vw, 16vw"
      />
    </div>
  );
}

export function BookInUseSection() {
  const { locale, t } = useLanguage();
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const imageAlt = (num: number) =>
    t("home.bookInUse.imageAlt").replace("{num}", String(num));

  return (
    <section
      id="book-in-use"
      aria-labelledby="book-in-use-heading"
      className="pt-8 pb-12 lg:pt-10 lg:pb-20 bg-white"
    >
      <div className="text-center mb-8 lg:mb-12 px-4">
        <Title
          as="h2"
          id="book-in-use-heading"
          highlightText={t("home.bookInUse.titleHighlight")}
          size="lg"
        >
          {t("home.bookInUse.title")}
        </Title>
      </div>

      <div className="relative max-w-7xl mx-auto px-2 lg:px-16">
        <button
          type="button"
          onClick={() => swiperInstance?.slideNext()}
          className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 lg:flex lg:cursor-pointer"
          aria-label={t("home.bookInUse.prevAria")}
        >
          <ChevronLeft className="h-6 w-6 text-dark-gray" />
        </button>

        <button
          type="button"
          onClick={() => swiperInstance?.slidePrev()}
          className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-50 lg:flex lg:cursor-pointer"
          aria-label={t("home.bookInUse.nextAria")}
        >
          <ChevronRight className="h-6 w-6 text-dark-gray" />
        </button>

        {/* Correct-size preview until Swiper finishes init (avoids width:100% flash) */}
        {!isReady && (
          <>
            <div
              className="flex gap-2.5 overflow-hidden lg:hidden"
              dir={locale === "he" ? "rtl" : "ltr"}
              aria-hidden="true"
            >
              {BOOK_IN_USE_IMAGES.slice(0, 4).map(({ num, ext }, index) => (
                <div
                  key={num}
                  className="w-[calc((100%-25px)/3.5)] shrink-0"
                >
                  <BookInUseImage
                    num={num}
                    ext={ext}
                    alt={imageAlt(num)}
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
            <div
              className="hidden gap-3.5 overflow-hidden lg:flex"
              dir={locale === "he" ? "rtl" : "ltr"}
              aria-hidden="true"
            >
              {BOOK_IN_USE_IMAGES.slice(0, 6).map(({ num, ext }, index) => (
                <div
                  key={num}
                  className="w-[calc((100%-70px)/6)] shrink-0"
                >
                  <BookInUseImage
                    num={num}
                    ext={ext}
                    alt={imageAlt(num)}
                    priority={index < 4}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <div
          className={
            isReady
              ? undefined
              : "pointer-events-none absolute inset-x-2 top-0 -z-10 h-0 overflow-hidden opacity-0 lg:inset-x-16"
          }
          aria-hidden={!isReady}
        >
          <Swiper
            slidesPerView={3.5}
            spaceBetween={10}
            loop={true}
            onSwiper={(swiper) => {
              setSwiperInstance(swiper);
              // Wait a frame so slide widths are applied before revealing
              requestAnimationFrame(() => setIsReady(true));
            }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
            dir={locale === "he" ? "rtl" : "ltr"}
            breakpoints={{
              1024: {
                slidesPerView: 6,
                spaceBetween: 14,
              },
            }}
          >
            {BOOK_IN_USE_IMAGES.map(({ num, ext }) => (
              <SwiperSlide key={num}>
                <BookInUseImage num={num} ext={ext} alt={imageAlt(num)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2" style={{ direction: "ltr" }}>
        {BOOK_IN_USE_IMAGES.map(({ num }, index) => {
          const visualIndex =
            locale === "he" ? BOOK_IN_USE_IMAGES.length - 1 - index : index;
          return (
            <motion.button
              key={num}
              type="button"
              onClick={() => swiperInstance?.slideToLoop(visualIndex)}
              className="block h-2 shrink-0 rounded-full lg:cursor-pointer lg:hover:opacity-70"
              variants={dotVariants}
              animate={currentIndex === visualIndex ? "active" : "inactive"}
              style={{
                backgroundColor:
                  currentIndex === visualIndex ? "#693430" : "#9ca3af",
              }}
              aria-label={t("home.bookInUse.dotAria")
                .replace("{num}", String(visualIndex + 1))
                .replace("{total}", String(BOOK_IN_USE_IMAGES.length))}
            />
          );
        })}
      </div>
    </section>
  );
}
