"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";

import "swiper/css";
import "swiper/css/free-mode";

const galleryImages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export function GalleryCarouselSection() {
  const { locale, t } = useLanguage();
  const isHebrew = locale === "he";

  return (
    <section
      aria-label={t("home.gallery.ariaLabel")}
      className="pt-8 pb-12 lg:pt-10 lg:pb-20 bg-white"
    >
      <div className="text-center mb-8 lg:mb-12 px-4">
        {isHebrew ? (
          <Title as="h2" highlightText="בבית" size="lg">
            אצלכם בבית
          </Title>
        ) : (
          <Title as="h2" highlightText="Home" size="lg">
            In Your Home
          </Title>
        )}
      </div>
      <Swiper
        slidesPerView={2.2}
        spaceBetween={10}
        loop={true}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          480: { slidesPerView: 3, spaceBetween: 10 },
          768: { slidesPerView: 4.5, spaceBetween: 12 },
          1024: { slidesPerView: 6, spaceBetween: 14 },
          1280: { slidesPerView: 7, spaceBetween: 14 },
        }}
      >
        {galleryImages.map((num) => (
          <SwiperSlide key={num}>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden lg:cursor-pointer">
              <Image
                src={`/gallery-image-${num}.jpeg`}
                alt={t("home.gallery.imageAlt").replace("{num}", String(num))}
                fill
                priority={num < 8}
                className="object-cover bg-neutral-100"
                sizes="(max-width: 480px) 70vw, (max-width: 768px) 45vw, (max-width: 1024px) 31vw, (max-width: 1280px) 24vw, 20vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
