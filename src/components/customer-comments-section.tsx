"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useInView } from "framer-motion";
import MuiButton from "@mui/material/Button";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";

const COMMENT_COUNT = 42;
const INITIAL_MOBILE_COUNT = 12;
const DESKTOP_INITIAL_ROWS = 4;

// Static slight tilts — applied as a fixed rotation, not animated
const OFFSETS: { rotate: number }[] = [
  { rotate: -2 },
  { rotate: 1.5 },
  { rotate: -1 },
  { rotate: 2.5 },
  { rotate: -1.5 },
  { rotate: 1 },
  { rotate: -2.5 },
  { rotate: 0.5 },
  { rotate: 2 },
  { rotate: -1 },
  { rotate: 1.5 },
  { rotate: -2 },
  { rotate: 0 },
  { rotate: 2 },
  { rotate: -1.5 },
  { rotate: 1 },
  { rotate: -2.5 },
  { rotate: 2 },
  { rotate: -1 },
  { rotate: 1.5 },
  { rotate: -2 },
  { rotate: 0.5 },
  { rotate: 2.5 },
  { rotate: -1.5 },
  { rotate: 1 },
  { rotate: -2 },
  { rotate: 0.5 },
  { rotate: 2 },
  { rotate: -1.5 },
  { rotate: 1.5 },
  { rotate: -2.5 },
  { rotate: 0 },
  { rotate: 2 },
  { rotate: -1 },
  { rotate: 1.5 },
  { rotate: -2 },
  { rotate: 0.5 },
  { rotate: 2.5 },
  { rotate: -1.5 },
  { rotate: 1 },
  { rotate: -2 },
  { rotate: 0.5 },
];

/**
 * Mobile stagger: left column fills top-to-bottom, then right column.
 * 0.09s between items so it feels responsive but not rushed.
 */
function getMobileDelay(i: number, total: number): number {
  const STEP = 0.09;
  const halfN = Math.ceil(total / 2);
  const col = i < halfN ? 0 : 1;
  const row = col === 0 ? i : i - halfN;
  return (row * 2 + col) * STEP;
}

/**
 * Desktop stagger: all cards in the same visual row appear together.
 * 0.12s between rows gives a calm, elegant cascade.
 */
function getDesktopDelay(i: number, numCols: number, total: number): number {
  const STEP = 0.12;
  const colSize = Math.ceil(total / numCols);
  const row = i % colSize;
  return row * STEP;
}

function getNumCols(width: number): number {
  if (width >= 1024) return 5;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
}

// Desktop-only hover: subtle scale + richer shadow, no bounce
const desktopHover = {
  scale: 1.02,
  boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
  transition: { duration: 0.25, ease: "easeOut" },
};

export function CustomerCommentsSection() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return window.innerWidth < 640;
  });
  const [numCols, setNumCols] = useState<number>(() => {
    if (typeof window === "undefined") return 5;
    return getNumCols(window.innerWidth);
  });
  const [showAll, setShowAll] = useState(false);
  // Tracks when the initial batch has finished entering — used to lock those
  // items with initial={false} so they can never be reset by a re-render.
  const [initialAnimated, setInitialAnimated] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setNumCols(getNumCols(window.innerWidth));
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, amount: 0.05 });

  useEffect(() => {
    if (isInView) setInitialAnimated(true);
  }, [isInView]);

  const desktopInitialCount = Math.min(DESKTOP_INITIAL_ROWS * numCols, COMMENT_COUNT);
  const initialCount = isMobile === true ? INITIAL_MOBILE_COUNT : desktopInitialCount;
  const showButton = !showAll && initialCount < COMMENT_COUNT;

  // Slide-up distance: slightly softer on mobile
  const slideY = isMobile === true ? 15 : 20;

  return (
    <section
      className="pt-8 pb-16 lg:pt-10 lg:pb-24 bg-warm-cream"
      aria-labelledby="customer-comments-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-10 lg:mb-16">
          <Title
            as="h2"
            id="customer-comments-heading"
            highlightText={t("home.customerComments.titleHighlight")}
            size="lg"
            className="mb-4"
          >
            {t("home.customerComments.title")}
          </Title>
        </div>

        <div className="max-w-6xl mx-auto">
          {/*
           * Container 1 — always-visible items (12 on mobile, 4 rows on desktop).
           * Fade + slide-up on scroll-in, row-by-row stagger.
           * Once locked, these items are immune to any future re-renders.
           */}
          <div
            ref={gridRef}
            className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3"
          >
            {Array.from({ length: initialCount }, (_, i) => {
              const num = i + 1;
              const rotate = OFFSETS[i % OFFSETS.length].rotate;
              const locked = initialAnimated;

              const initial = prefersReducedMotion || locked
                ? false
                : { opacity: 0, y: slideY };

              const animate = prefersReducedMotion
                ? undefined
                : locked || isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: slideY };

              const transition = locked
                ? { duration: 0 }
                : {
                    duration: 0.7,
                    ease: "easeOut" as const,
                    delay:
                      isMobile === true
                        ? getMobileDelay(i, INITIAL_MOBILE_COUNT)
                        : getDesktopDelay(i, numCols, initialCount),
                  };

              return (
                <motion.div
                  key={num}
                  style={{ rotate }}
                  initial={initial}
                  animate={animate}
                  transition={transition}
                  whileHover={isMobile ? undefined : desktopHover}
                  className="rounded-xl overflow-hidden shadow-md mb-3 break-inside-avoid"
                >
                  <Image
                    src={`/comment-${num}.jpeg`}
                    alt={`${t("home.customerComments.imageAlt")} ${num}`}
                    width={0}
                    height={0}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/*
           * Container 2 — revealed items (mounts when showAll).
           * Same fade + slide-up style, staggered row-by-row.
           * Only these new cards animate — Container 1 is untouched.
           */}
          {showAll && initialCount < COMMENT_COUNT && (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
              {Array.from({ length: COMMENT_COUNT - initialCount }, (_, j) => {
                const i = initialCount + j;
                const num = i + 1;
                const rotate = OFFSETS[i % OFFSETS.length].rotate;
                const revealedCount = COMMENT_COUNT - initialCount;

                const delay = isMobile === true
                  ? getMobileDelay(j, revealedCount)
                  : getDesktopDelay(j, numCols, revealedCount);

                return (
                  <motion.div
                    key={num}
                    style={{ rotate }}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: slideY }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.7, ease: "easeOut", delay }
                    }
                    whileHover={isMobile ? undefined : desktopHover}
                    className="rounded-xl overflow-hidden shadow-md mb-3 break-inside-avoid"
                  >
                    <Image
                      src={`/comment-${num}.jpeg`}
                      alt={`${t("home.customerComments.imageAlt")} ${num}`}
                      width={0}
                      height={0}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Show more button */}
        {showButton && (
          <div className="flex justify-center mt-8">
            <MuiButton
              variant="contained"
              color="primary"
              onClick={() => setShowAll(true)}
              sx={{
                px: { xs: 2.5, sm: 4 },
                py: { xs: 0.75, sm: 1.5 },
                fontFamily: "var(--font-assistant)",
                fontWeight: 700,
                fontSize: { xs: "0.8rem", sm: "1rem" },
                textTransform: "none",
              }}
            >
              {t("home.customerComments.showMore")}
            </MuiButton>
          </div>
        )}
      </div>
    </section>
  );
}
