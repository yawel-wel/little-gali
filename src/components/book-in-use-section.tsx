"use client";

import Image from "next/image";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";

type BookInUseItem = {
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

function BookInUseTile({
  item,
  alt,
}: {
  item: BookInUseItem;
  alt: string;
}) {
  return (
    <div className="relative aspect-[3/4] w-[27vw] shrink-0 overflow-hidden rounded-[5px] bg-warm-cream lg:w-[15vw] lg:max-w-64">
      <Image
        src={`/book-in-use-${item.num}.${item.ext}`}
        alt={alt}
        fill
        draggable={false}
        className="object-cover"
        sizes="(max-width: 1024px) 27vw, 15vw"
      />
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  imageAlt,
}: {
  items: readonly BookInUseItem[];
  reverse?: boolean;
  imageAlt: (num: number) => string;
}) {
  return (
    // Fixed LTR so the -50% loop math is the same in Hebrew and English.
    <div
      dir="ltr"
      className="overflow-hidden motion-reduce:overflow-x-auto"
    >
      <div
        className={`book-in-use-marquee flex w-max ${
          reverse ? "book-in-use-marquee-reverse" : ""
        }`}
      >
        {/* Two identical copies: when the first has scrolled out, the second is in its place. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex gap-2.5 pe-2.5 lg:gap-3.5 lg:pe-3.5"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {items.map((item) => (
              <BookInUseTile
                key={item.num}
                item={item}
                alt={copy === 1 ? "" : imageAlt(item.num)}
              />
            ))}
          </div>
        ))}
      </div>
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
        <MarqueeRow items={ROW_ONE} imageAlt={imageAlt} />
        <MarqueeRow items={ROW_TWO} reverse imageAlt={imageAlt} />
      </div>
    </section>
  );
}
