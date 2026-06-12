"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsMobile } from "./use-is-mobile";

type Ease = readonly [number, number, number, number];

const visibleSection = { opacity: 1, y: 0 } as const;
const visibleImage = { opacity: 1, scale: 1 } as const;

/**
 * Desktop: fade in on scroll. Mobile / reduced-motion: visible immediately
 * (opacity-0 + whileInView is unreliable on iOS Safari).
 *
 * Animations stay off until after mount so SSR/hydration never paint sections
 * at opacity 0 (useIsMobile is false on the server snapshot).
 */
export function useScrollReveal(ease: Ease = [0.16, 1, 0.3, 1]) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const enabled = mounted && !prefersReducedMotion && !isMobile;

  const section = enabled
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.05 as const },
        transition: { duration: 0.6, ease },
      }
    : { initial: false as const, animate: visibleSection };

  const staggerContainer = (options?: {
    staggerDirection?: -1 | 1;
    amount?: number;
    staggerChildren?: number;
  }) => {
    const amount = options?.amount ?? 0.15;
    const staggerChildren = options?.staggerChildren ?? 0.15;
    const staggerDirection = options?.staggerDirection;

    const variants = {
      hidden: {},
      show: {
        transition: {
          staggerChildren,
          ...(staggerDirection !== undefined ? { staggerDirection } : {}),
        },
      },
    };

    return enabled
      ? {
          initial: "hidden" as const,
          whileInView: "show" as const,
          viewport: { once: true, amount },
          variants,
        }
      : {
          initial: false as const,
          animate: "show" as const,
          variants,
        };
  };

  const fadeInItem = enabled
    ? {
        variants: {
          hidden: { opacity: 0, y: 30 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease },
          },
        },
      }
    : {
        initial: false as const,
        variants: { hidden: visibleSection, show: visibleSection },
      };

  const imageReveal = enabled
    ? {
        initial: { scale: 0.95, opacity: 0 },
        whileInView: { scale: 1, opacity: 1 },
        viewport: { once: true, amount: 0.3 as const },
        transition: { duration: 0.6, ease },
      }
    : { initial: false as const, animate: visibleImage };

  return {
    enabled,
    section,
    staggerContainer,
    fadeInItem,
    imageReveal,
  };
}
