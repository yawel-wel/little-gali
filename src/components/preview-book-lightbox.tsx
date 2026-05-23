"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

export interface PreviewBookLightboxSlide {
  pageNumber: number;
  imageUrl: string;
  alt: string;
}

interface PreviewBookLightboxProps {
  open: boolean;
  slides: PreviewBookLightboxSlide[];
  initialIndex?: number;
  onClose: () => void;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
}

function getWrappedStep(from: number, to: number, length: number): number {
  if (length <= 1) {
    return 0;
  }

  const forward = (to - from + length) % length;
  const backward = (from - to + length) % length;

  if (forward === 0) {
    return 0;
  }

  return forward <= backward ? 1 : -1;
}

export function PreviewBookLightbox({
  open,
  slides,
  initialIndex = 0,
  onClose,
  closeLabel,
  previousLabel,
  nextLabel,
}: PreviewBookLightboxProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [imageAspectRatios, setImageAspectRatios] = useState<
    Record<string, number>
  >({});
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveIndex(initialIndex);
    setDirection(0);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (activeIndex >= slides.length) {
      setActiveIndex(Math.max(0, slides.length - 1));
    }
  }, [activeIndex, open, slides.length]);

  const goToIndex = useCallback(
    (index: number) => {
      setActiveIndex((current) => {
        if (index === current || slides.length === 0) {
          return current;
        }
        setDirection(getWrappedStep(current, index, slides.length));
        return index;
      });
    },
    [slides.length],
  );

  const goToPrevious = useCallback(() => {
    if (slides.length <= 1) {
      return;
    }
    setDirection(-1);
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    if (slides.length <= 1) {
      return;
    }
    setDirection(1);
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        goToPrevious();
        return;
      }
      if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [goToNext, goToPrevious, onClose, open]);

  const activeSlide = slides[activeIndex] ?? slides[0];
  const activeImageAspectRatio =
    (activeSlide && imageAspectRatios[activeSlide.imageUrl]) ?? 72 / 84;
  const overlayTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const };
  const imageTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
  const imageVariants = {
    enter: (step: number) => ({
      x: step > 0 ? "100%" : step < 0 ? "-100%" : 0,
    }),
    center: {
      x: 0,
    },
    exit: (step: number) => ({
      x: step > 0 ? "-100%" : step < 0 ? "100%" : 0,
    }),
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    const endX = event.changedTouches[0]?.clientX;
    if (startX === null || endX === undefined) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 40) {
      return;
    }

    if (deltaX < 0) {
      goToNext();
      return;
    }

    goToPrevious();
  };

  const navButtonClass =
    "absolute top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-dark-gray shadow-[0_1px_4px_rgba(0,0,0,0.1)] transition hover:bg-white/95";

  return (
    <AnimatePresence>
      {open && slides.length > 0 && activeSlide ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#F9F7EE] px-4 py-6 sm:px-6 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label={activeSlide.alt}
          dir="ltr"
        >
          <motion.div
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={panelTransition}
            className="flex max-h-[min(92vh,720px)] w-full max-w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:max-w-[26rem] md:max-w-[28rem]"
          >
            <div className="relative flex min-h-[min(58vh,520px)] flex-1 flex-col bg-[#EAE6E1] px-3 pb-4 pt-3 sm:min-h-[min(60vh,560px)] sm:px-4 sm:pb-5 sm:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-2 top-2 z-30 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-dark-gray shadow-[0_1px_4px_rgba(0,0,0,0.1)] transition hover:bg-white/95"
                aria-label={closeLabel}
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>

              {slides.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className={cn(navButtonClass, "left-2 sm:left-3")}
                    aria-label={previousLabel}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className={cn(navButtonClass, "right-2 sm:right-3")}
                    aria-label={nextLabel}
                  >
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </>
              ) : null}

              <div className="flex flex-1 items-center justify-center px-8 sm:px-10">
                <div
                  className="relative w-full overflow-hidden rounded-xl bg-[#EAE6E1]"
                  style={{
                    aspectRatio: activeImageAspectRatio,
                    maxHeight: "min(48vh, 480px)",
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                      key={`${activeIndex}-${activeSlide.imageUrl}`}
                      src={activeSlide.imageUrl}
                      alt={activeSlide.alt}
                      onLoad={(event) => {
                        const { naturalWidth, naturalHeight } =
                          event.currentTarget;
                        if (!naturalWidth || !naturalHeight) {
                          return;
                        }

                        setImageAspectRatios((current) => ({
                          ...current,
                          [activeSlide.imageUrl]: naturalWidth / naturalHeight,
                        }));
                      }}
                      custom={direction}
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={imageTransition}
                      className={cn(
                        SENTRY_REPLAY_BLOCK_USER_IMAGE,
                        "absolute inset-0 h-full w-full object-contain",
                      )}
                    />
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="shrink-0 bg-white px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex justify-center gap-2 overflow-x-auto hide-scrollbar">
                  {slides.map((slide, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={`${slide.pageNumber}-${slide.imageUrl}`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        aria-label={slide.alt}
                        aria-current={isActive}
                        className={cn(
                          "h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 bg-[#EAE6E1] transition-colors cursor-pointer sm:h-12 sm:w-12",
                          isActive
                            ? "border-accent-burgundy"
                            : "border-transparent opacity-75 hover:opacity-100",
                        )}
                      >
                        <img
                          src={slide.imageUrl}
                          alt=""
                          className={cn(
                            SENTRY_REPLAY_BLOCK_USER_IMAGE,
                            "h-full w-full object-cover",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
