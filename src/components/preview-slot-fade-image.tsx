"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useRef, useState } from "react";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

const RETRY_DELAYS_MS = [2000, 5000, 10000];

type PreviewSlotFadeImageProps = {
  src: string;
  alt: string;
  className?: string;
  onLoadError?: (src: string) => void;
};

export function PreviewSlotFadeImage({
  src,
  alt,
  className,
  onLoadError,
}: PreviewSlotFadeImageProps) {
  const [visibleSrc, setVisibleSrc] = useState(src);
  const [opacity, setOpacity] = useState(1);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFailedSrc(null);
    retryCountRef.current = 0;
    if (retryTimeoutRef.current !== null) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (src === visibleSrc) {
      return;
    }
    setOpacity(0);
    const timeout = window.setTimeout(() => {
      setVisibleSrc(src);
      setOpacity(1);
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [src, visibleSrc]);

  // Clean up retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  if (failedSrc === visibleSrc) {
    return null;
  }

  const handleError = () => {
    const attempt = retryCountRef.current;
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay !== undefined) {
      retryCountRef.current += 1;
      retryTimeoutRef.current = setTimeout(() => {
        // Force a reload by appending/toggling a cache-bust param
        const bust = `_retry=${attempt + 1}`;
        const sep = visibleSrc.includes("?") ? "&" : "?";
        setVisibleSrc(visibleSrc.split("?_retry=")[0].split("&_retry=")[0] + sep + bust);
      }, delay);
    } else {
      setFailedSrc(visibleSrc);
      Sentry.logger.warn("preview.image_load_failed", { imageUrl: visibleSrc });
      onLoadError?.(visibleSrc);
    }
  };

  return (
    <img
      src={visibleSrc}
      alt={alt}
      onError={handleError}
      className={cn(
        SENTRY_REPLAY_BLOCK_USER_IMAGE,
        "h-full w-full object-cover transition-opacity duration-[400ms] ease-in-out",
        className,
      )}
      style={{ opacity }}
    />
  );
}
