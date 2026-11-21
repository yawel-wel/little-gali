"use client";

import Image from "next/image";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { MARQUEE_TILE_CLASS, MarqueeRow } from "@/components/marquee-row";

export type BookInUseItem = {
  num: number;
  /** Must match the file in /public exactly: Vercel is case-sensitive (jpg ≠ JPG). */
  ext: string;
};

const ROW_ONE: readonly BookInUseItem[] = [
  { num: 100, ext: "jpg" },
  { num: 2, ext: "JPG" },
  { num: 3, ext: "jpg" },
  { num: 4, ext: "JPG" },
  { num: 5, ext: "JPG" },
  { num: 60, ext: "JPG" },
  { num: 7, ext: "JPG" },
  { num: 8, ext: "jpg" },
  { num: 9, ext: "JPG" },
];

const ROW_TWO: readonly BookInUseItem[] = [
  { num: 10, ext: "jpg" },
  { num: 11, ext: "JPG" },
  { num: 12, ext: "JPG" },
  { num: 13, ext: "JPG" },
  { num: 14, ext: "JPG" },
  { num: 15, ext: "jpg" },
  { num: 16, ext: "JPG" },
  { num: 17, ext: "JPG" },
  { num: 18, ext: "jpg" },
];

/** All book-in-use photos, both rows, in order. */
export const BOOK_IN_USE_ITEMS: readonly BookInUseItem[] = [...ROW_ONE, ...ROW_TWO];

export function bookInUseSrc(item: BookInUseItem): string {
  return `/book-in-use-${item.num}.${item.ext}`;
}

function BookInUseTile({
  item,
  alt,
}: {
  item: BookInUseItem;
  alt: string;
}) {
  return (
    <div className={`${MARQUEE_TILE_CLASS} bg-warm-cream`}>
      <Image
        src={bookInUseSrc(item)}
        alt={alt}
        fill
        draggable={false}
        className="object-cover"
        sizes="(max-width: 1024px) 27vw, 15vw"
      />
    </div>
  );
}

export function BookInUseSection() {
  const { t } = useLanguage();

  const imageAlt = (num: number) =>
    t("home.bookInUse.imageAlt").replace("{num}", String(num));

  return (
    <section
      id="book-in-use"
      aria-labelledby="book-in-use-heading"
      className="pt-6 pb-10 sm:pb-12 lg:pb-20 bg-white"
    >
      <div className="text-center mb-6 px-4">
        <Title
          as="h2"
          id="book-in-use-heading"
          highlightText={t("home.bookInUse.titleHighlight")}
          size="lg"
        >
          {t("home.bookInUse.title")}
        </Title>
      </div>

      <div className="flex flex-col gap-2.5 lg:gap-3.5">
        {[ROW_ONE, ROW_TWO].map((row, index) => (
          <MarqueeRow
            key={index}
            items={row}
            reverse={index === 1}
            getKey={(item) => item.num}
            renderItem={(item, isCopy) => (
              <BookInUseTile item={item} alt={isCopy ? "" : imageAlt(item.num)} />
            )}
          />
        ))}
      </div>
    </section>
  );
}
