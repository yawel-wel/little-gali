"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  FRAMED_ART_ARTWORK_INSET_PERCENT,
  FRAMED_ART_FRAME_IMAGE,
} from "@/lib/framed-art/frame-layout";
import { cn } from "@/lib/utils";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";

export { FRAMED_ART_FRAME_IMAGE };

type FramedArtFrameMockupProps = {
  imageUrl?: string | null;
  className?: string;
  /** Max width of the mockup (default max-w-md). */
  maxWidthClassName?: string;
  isLoading?: boolean;
};

export function FramedArtFrameMockup({
  imageUrl,
  className,
  maxWidthClassName = "max-w-md",
  isLoading = false,
}: FramedArtFrameMockupProps) {
  const inset = `${FRAMED_ART_ARTWORK_INSET_PERCENT}%`;
  const size = `${100 - FRAMED_ART_ARTWORK_INSET_PERCENT * 2}%`;

  return (
    <div className={cn("mx-auto w-full", maxWidthClassName, className)}>
      <div className="relative w-full drop-shadow-[0_14px_32px_rgba(60,40,35,0.14)]">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={FRAMED_ART_FRAME_IMAGE}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 90vw, 448px"
            priority={Boolean(imageUrl)}
          />

          <div
            className="absolute z-10 overflow-hidden bg-white"
            style={{
              top: inset,
              left: inset,
              width: size,
              height: size,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={cn(
                  "h-full w-full object-cover",
                  SENTRY_REPLAY_BLOCK_USER_IMAGE,
                )}
              />
            ) : isLoading ? (
              <div className="flex h-full w-full items-center justify-center bg-[#f5f2eb]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-orange" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
