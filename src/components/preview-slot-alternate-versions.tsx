"use client";

import type { PreviewCandidate } from "@/lib/preview-session/types";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

type PreviewSlotAlternateVersionsProps = {
  versions: PreviewCandidate[];
  activeCandidateId: string | undefined;
  title: string;
  disabled?: boolean;
  onSelect: (candidateId: string) => void;
};

export function PreviewSlotAlternateVersions({
  versions,
  activeCandidateId,
  title,
  disabled = false,
  onSelect,
}: PreviewSlotAlternateVersionsProps) {
  if (versions.length <= 1) {
    return null;
  }

  return (
    <div
      className="w-full border-t border-[#E8E2DC] bg-white px-2.5 py-2 text-right"
      dir="rtl"
    >
      <p className="mb-1.5 w-full font-body text-[11px] text-dark-gray/70">
        {title}
      </p>
      <div className="flex w-full flex-wrap justify-start gap-1.5">
        {versions.map((candidate) => {
          const isActive = candidate.id === activeCandidateId;
          const thumbnail = candidate.previewUrl ? (
            <img
              src={candidate.previewUrl}
              alt=""
              className={cn(
                SENTRY_REPLAY_BLOCK_USER_IMAGE,
                "h-11 w-11 object-cover",
              )}
            />
          ) : null;

          if (isActive) {
            return (
              <div
                key={candidate.id}
                aria-current="true"
                className="overflow-hidden rounded-lg border-2 border-accent-burgundy bg-[#EAE6E1]"
              >
                {thumbnail}
              </div>
            );
          }

          return (
            <button
              key={candidate.id}
              type="button"
              disabled={disabled || !candidate.previewUrl}
              onClick={() => onSelect(candidate.id)}
              className={cn(
                "cursor-pointer overflow-hidden rounded-lg border-2 border-transparent bg-[#EAE6E1] transition-colors",
                "hover:border-accent-burgundy focus-visible:border-accent-burgundy focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {thumbnail}
            </button>
          );
        })}
      </div>
    </div>
  );
}
