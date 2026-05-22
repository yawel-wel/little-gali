"use client";

import type { StyleType } from "@/components/style-selector";
import { getColorCandidateForStyleFromPublicSlot } from "@/lib/preview-session/color-by-style";
import { displayPosition } from "@/lib/preview-session/display-order";
import type { PreviewSessionPublicView } from "@/lib/preview-session/types";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { cn } from "@/lib/utils";

export type PreviewVersionEntry = {
  slotIndex: number;
  pageNum: number;
  candidateId: string;
  previewUrl?: string;
  errorCode?: string;
  createdAt: string;
};

type BuildVersionEntriesOptions = {
  session: PreviewSessionPublicView;
  displayedBookSide: "bw" | "color";
  activeColorStyle: StyleType;
  getColorVersionsForStyle: (
    slot: PreviewSessionPublicView["slots"][number],
    style: StyleType,
  ) => PreviewSessionPublicView["slots"][number]["candidates"];
};

export function buildPreviewVersionEntries({
  session,
  displayedBookSide,
  activeColorStyle,
  getColorVersionsForStyle,
}: BuildVersionEntriesOptions): PreviewVersionEntry[] {
  const entries: PreviewVersionEntry[] = [];

  for (const slot of session.slots) {
    const pageNum = displayPosition(slot.index, session.displayOrder);
    const activeColorCandidate =
      displayedBookSide === "color"
        ? getColorCandidateForStyleFromPublicSlot(slot, activeColorStyle)
        : undefined;
    const activeVersionId =
      displayedBookSide === "bw"
        ? slot.activeCandidateId
        : activeColorCandidate?.id;

    const candidates =
      displayedBookSide === "bw"
        ? slot.candidates
        : getColorVersionsForStyle(slot, activeColorStyle);

    for (const candidate of candidates) {
      if (candidate.id === activeVersionId || !candidate.previewUrl) {
        continue;
      }
      entries.push({
        slotIndex: slot.index,
        pageNum,
        candidateId: candidate.id,
        previewUrl: candidate.previewUrl,
        errorCode: candidate.error?.code,
        createdAt: candidate.createdAt,
      });
    }
  }

  return entries.sort(
    (a, b) =>
      a.pageNum - b.pageNum ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

type PreviewSlotVersionsStripProps = {
  entries: PreviewVersionEntry[];
  displayedBookSide: "bw" | "color";
  isSlotColorBusy: (slotIndex: number) => boolean;
  isSubmitting: boolean;
  onSelectCandidate: (slotIndex: number, candidateId: string) => void;
  title: string;
};

export function PreviewSlotVersionsStrip({
  entries,
  displayedBookSide,
  isSlotColorBusy,
  isSubmitting,
  onSelectCandidate,
  title,
}: PreviewSlotVersionsStripProps) {
  if (entries.length === 0) {
    return null;
  }

  const byPage = new Map<number, PreviewVersionEntry[]>();
  for (const entry of entries) {
    const list = byPage.get(entry.pageNum) ?? [];
    list.push(entry);
    byPage.set(entry.pageNum, list);
  }

  return (
    <div className="mt-4 w-full border-t border-gray-100 pt-4">
      <p className="mb-3 text-center font-body-bold text-sm text-dark-gray">
        {title}
      </p>
      <div className="flex flex-col gap-4">
        {[...byPage.entries()]
          .sort(([a], [b]) => a - b)
          .map(([pageNum, pageEntries]) => (
            <div key={pageNum} className="flex flex-col items-center gap-2">
              <p className="font-body text-xs text-dark-gray/80">{pageNum}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {pageEntries.map((entry) => (
                  <button
                    key={entry.candidateId}
                    type="button"
                    disabled={
                      !entry.previewUrl ||
                      (displayedBookSide === "color" &&
                        (isSlotColorBusy(entry.slotIndex) || isSubmitting))
                    }
                    onClick={() =>
                      onSelectCandidate(entry.slotIndex, entry.candidateId)
                    }
                    className="cursor-pointer overflow-hidden rounded-md border-2 border-transparent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {entry.previewUrl ? (
                      <img
                        src={entry.previewUrl}
                        alt=""
                        className={cn(
                          SENTRY_REPLAY_BLOCK_USER_IMAGE,
                          "h-16 w-14 object-cover",
                        )}
                      />
                    ) : (
                      <div className="flex h-16 w-14 items-center justify-center bg-gray-100 px-1 text-[10px]">
                        {entry.errorCode === "safety" ? "!" : "?"}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

