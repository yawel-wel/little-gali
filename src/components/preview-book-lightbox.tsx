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
    if (!window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

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

  return (
    <AnimatePresence>
      {open && slides.length > 0 && activeSlide ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 sm:px-6"
          style={{ backgroundColor: "#F9F7EE" }}
          role="dialog"
          aria-modal="true"
          aria-label={activeSlide.alt}
        >
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 6 }
            }
            transition={panelTransition}
            className="flex w-full max-w-[min(96vw,760px)] flex-col items-center gap-5"
          >
            <div className="flex w-full items-center justify-center gap-3 sm:gap-4" dir="ltr">
              {slides.length > 1 ? (
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-dark-gray shadow-sm transition hover:bg-white cursor-pointer"
                  aria-label={previousLabel}
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
                </button>
              ) : (
                <div className="h-10 w-10 shrink-0" aria-hidden />
              )}

              <div className="relative w-full max-w-[min(82vw,520px)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="group absolute right-2 top-2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full"
                  aria-label={closeLabel}
                >
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F9F7EE]/80 text-gray-700 shadow-sm backdrop-blur-[4px]">
                    <span className="absolute inset-0 rounded-full bg-[#F9F7EE] opacity-0 transition-opacity duration-150 ease-in group-hover:opacity-20 group-active:opacity-20" />
                    <X
                      className="relative h-[18px] w-[18px]"
                      strokeWidth={2.25}
                    />
                  </span>
                </button>

                <div
                  className="relative mx-auto w-full overflow-hidden rounded-lg bg-[#ebe6dc] shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
                  style={{
                    aspectRatio: activeImageAspectRatio,
                    maxHeight: "min(72vh, 900px)",
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

              {slides.length > 1 ? (
                <button
                  type="button"
                  onClick={goToNext}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-dark-gray shadow-sm transition hover:bg-white cursor-pointer"
                  aria-label={nextLabel}
                >
                  <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
                </button>
              ) : (
                <div className="h-10 w-10 shrink-0" aria-hidden />
              )}
            </div>

            {slides.length > 1 ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={panelTransition}
                className="w-full max-w-[min(92vw,560px)] overflow-x-auto hide-scrollbar"
              >
                <div className="flex justify-center gap-2 px-1 pb-1">
                  {slides.map((slide, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <motion.button
                        key={`${slide.pageNumber}-${slide.imageUrl}`}
                        type="button"
                        onClick={() => goToIndex(index)}
                        aria-label={slide.alt}
                        aria-current={isActive}
                        layout
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                        animate={{
                          opacity: isActive ? 1 : 0.78,
                          scale: isActive ? 1.03 : 1,
                        }}
                        transition={imageTransition}
                        className={cn(
                          "relative h-14 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-colors cursor-pointer bg-white sm:h-16 sm:w-14",
                          isActive
                            ? "border-primary-orange"
                            : "border-gray-200 hover:border-gray-300",
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
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
