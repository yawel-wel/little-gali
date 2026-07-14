"use client";

import { useCallback, useMemo, useRef, useState, type TouchEvent, type TransitionEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import type { BookFlow } from "@/lib/preview-session/book-flow";
import { PreviousPreviewSessions } from "@/components/previous-preview-sessions";
import { isAiPreviewEnabled } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

type UploadBookFlowChooserProps = {
  onSelect: (flow: BookFlow) => void;
};

/** Classic card carousel — put matching files in /public */
const CLASSIC_CARD_IMAGES = [
  { name: "classic-card-1", src: "/chooser-classic-1.JPG" },
  { name: "classic-card-2", src: "/chooser-classic-2.JPG" },
] as const;

/** Colorful card carousel — put matching files in /public */
const COLORFUL_CARD_IMAGES = [
  { name: "colorful-card-1", src: "/chooser-colorful-1.JPG" },
  { name: "colorful-card-2", src: "/chooser-colorful-2.JPG" },
] as const;

function buildLoopSlides(
  images: ReadonlyArray<{ name: string; src: string }>,
) {
  if (images.length <= 1) return [...images];
  return [images[images.length - 1], ...images, images[0]];
}

function BookFlowCard({
  flow,
  images,
  title,
  description,
  badge,
  createLabel,
  onSelect,
}: {
  flow: BookFlow;
  images: ReadonlyArray<{ name: string; src: string }>;
  title: string;
  description: string;
  badge: string;
  createLabel: string;
  onSelect: (flow: BookFlow) => void;
}) {
  const { t } = useLanguage();
  const touchStartX = useRef<number | null>(null);
  const isTransitioning = useRef(false);
  const loopSlides = useMemo(() => buildLoopSlides(images), [images]);
  const hasLoop = images.length > 1;
  const firstRealIndex = 1;

  const [positionIndex, setPositionIndex] = useState(firstRealIndex);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const displayIndex = hasLoop
    ? positionIndex === 0
      ? images.length - 1
      : positionIndex === loopSlides.length - 1
        ? 0
        : positionIndex - 1
    : 0;

  const snapWithoutTransition = useCallback((index: number) => {
    setTransitionEnabled(false);
    setPositionIndex(index);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
        isTransitioning.current = false;
      });
    });
  }, []);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "transform") return;
      if (!hasLoop) {
        isTransitioning.current = false;
        return;
      }
      if (positionIndex === 0) {
        snapWithoutTransition(images.length);
        return;
      }
      if (positionIndex === loopSlides.length - 1) {
        snapWithoutTransition(firstRealIndex);
        return;
      }
      isTransitioning.current = false;
    },
    [
      hasLoop,
      images.length,
      loopSlides.length,
      positionIndex,
      snapWithoutTransition,
    ],
  );

  const goNext = useCallback(() => {
    if (!hasLoop || isTransitioning.current) return;
    isTransitioning.current = true;
    setPositionIndex((index) => index + 1);
  }, [hasLoop]);

  const goPrev = useCallback(() => {
    if (!hasLoop || isTransitioning.current) return;
    isTransitioning.current = true;
    setPositionIndex((index) => index - 1);
  }, [hasLoop]);

  const goToIndex = useCallback(
    (targetIndex: number) => {
      if (!hasLoop) return;
      if (targetIndex === displayIndex) return;
      if ((displayIndex + 1) % images.length === targetIndex) goNext();
      else goPrev();
    },
    [displayIndex, goNext, goPrev, hasLoop, images.length],
  );

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 32) return;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  const clearTouch = () => {
    touchStartX.current = null;
  };

  const navButtonClass =
    "absolute top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-dark-gray opacity-0 shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition hover:bg-white pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 md:flex";

  return (
    <article className="col-span-1 row-span-3 grid min-w-0 grid-rows-subgrid overflow-hidden rounded-[1.25rem] border border-gray-200 bg-white shadow-[0_8px_24px_rgba(105,52,48,0.08)]">
      <div className="group relative w-full shrink-0 overflow-hidden bg-[#F7F6F2] aspect-[8/7] md:aspect-[8/5]">
        <div
          className="absolute inset-0 overflow-hidden touch-pan-y"
          aria-label={title}
          dir="ltr"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={clearTouch}
        >
          <div
            className={cn(
              "flex h-full w-full ease-out",
              transitionEnabled && "transition-transform duration-300",
            )}
            style={{
              transform: `translateX(-${(hasLoop ? positionIndex : 0) * 100}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {(hasLoop ? loopSlides : images).map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="relative h-full w-full shrink-0"
              >
                <img
                  src={image.src}
                  alt=""
                  className="pointer-events-none h-full w-full object-cover select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className={cn(navButtonClass, "left-2")}
              aria-label={`${title} — ${t("upload.chooser.previousImage")}`}
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className={cn(navButtonClass, "right-2")}
              aria-label={`${title} — ${t("upload.chooser.nextImage")}`}
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </>
        ) : null}

        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
          {images.map((image, index) => (
            <button
              key={image.name}
              type="button"
              aria-label={`${title} ${index + 1}`}
              aria-current={displayIndex === index ? "true" : undefined}
              onClick={() => goToIndex(index)}
              className="rounded-full p-1"
            >
              <span
                className={cn(
                  "block rounded-full bg-white shadow-sm transition-all",
                  displayIndex === index
                    ? "h-1.5 w-4 opacity-100"
                    : "h-1.5 w-1.5 opacity-70",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pb-2 pt-2.5 sm:px-3.5 md:px-4 md:pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="font-body-bold text-base text-dark-gray">{title}</p>
          <span className="rounded-full bg-[#F3EEE8] px-2 py-0.5 font-body text-xs leading-none text-medium-gray">
            {badge}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-line font-body text-[13px] leading-snug text-medium-gray md:text-sm">
          {description}
        </p>
      </div>

      <div className="flex items-end px-3 pb-2.5 pt-2.5 sm:px-3.5 md:px-4 md:pb-3">
        <button
          type="button"
          onClick={() => onSelect(flow)}
          className="w-full cursor-pointer rounded-lg bg-primary-orange px-3.5 py-1.5 font-body-bold text-[15px] text-white transition hover:bg-[#d49a7e]"
        >
          {createLabel}
        </button>
      </div>
    </article>
  );
}

export function UploadBookFlowChooser({ onSelect }: UploadBookFlowChooserProps) {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";
  const previewEnabled = isAiPreviewEnabled();
  const [hasPreviousSessions, setHasPreviousSessions] = useState(false);

  return (
    <section
      className="mx-auto w-full max-w-3xl"
      dir={isHe ? "rtl" : "ltr"}
      aria-label={t("upload.chooser.ariaLabel")}
    >
      <h1 className="text-center font-heading text-2xl text-dark-gray md:text-3xl">
        {t("upload.chooser.title")}
      </h1>
      <p className="mt-2 text-center font-body text-sm text-medium-gray md:text-base">
        {t("upload.chooser.subtitle")}
      </p>

      {previewEnabled ? (
        <div className="mt-8 mb-2">
          <PreviousPreviewSessions
            onVisibleChange={setHasPreviousSessions}
            compact
          />
        </div>
      ) : null}

      {hasPreviousSessions ? (
        <p className="mb-4 mt-6 text-center font-body-bold text-sm text-dark-gray">
          {t("upload.chooser.titleNew")}
        </p>
      ) : null}

      <div className="mx-auto mt-6 grid min-w-0 max-w-2xl grid-cols-2 gap-x-3 sm:gap-x-4 [grid-template-rows:auto_auto_auto]">
        <BookFlowCard
          flow="classic"
          images={CLASSIC_CARD_IMAGES}
          title={t("upload.chooser.classicTitle")}
          description={t("upload.chooser.classicDescription")}
          badge={t("upload.chooser.classicBadge")}
          createLabel={t("upload.chooser.create")}
          onSelect={onSelect}
        />
        <BookFlowCard
          flow="colorful"
          images={COLORFUL_CARD_IMAGES}
          title={t("upload.chooser.colorfulTitle")}
          description={t("upload.chooser.colorfulDescription")}
          badge={t("upload.chooser.colorfulBadge")}
          createLabel={t("upload.chooser.create")}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}
