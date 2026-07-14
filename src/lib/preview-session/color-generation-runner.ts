import { randomUUID } from "crypto";
import type { StyleType } from "@/components/style-selector";
import { nextColorVersionForStyle } from "./cloudinary-paths";
import { uploadCleanAndWatermarkedOutputs } from "./upload-preview-outputs";
import {
  allSlotsHaveColorForStyle,
  BOOK_SLOT_INDEX,
  DEFAULT_COLOR_STYLE,
  PREVIEW_COLOR_STYLES,
  getColorCandidateForStyle,
  slotHasColorPreviewForStyle,
  syncColorPreviewForSlots,
  syncColorPreviewToStyle,
} from "./color-by-style";
import {
  dequeuePendingColorRegen,
  enqueuePendingColorRegen,
  slotNeedsAllStylesColorRegen,
} from "./pending-color-regen";
import { generateColorImageBuffer, downloadImageAsBase64ForGemini } from "./generate-color";
import { toGenerationError } from "./generate-bw";
import {
  logPreviewGenerationFailure,
  logPreviewGenerationSuccess,
  logPreviewGenerationSummary,
  type PreviewGenerationContext,
  type PreviewGenerationTrigger,
} from "./generation-log";
import { maybeLogProhibitedContentEvent } from "./prohibited-content-log";
import { analyticsContextFromSession } from "@/lib/analytics-context";
import { trackGenerationStepDuration } from "@/lib/analytics-server";
import { loadPreviewSession, savePreviewSession } from "./store";
import type {
  FrozenStyleStripThumbnail,
  PreviewCandidate,
  PreviewSession,
} from "./types";

export {
  dequeuePendingColorRegen,
  enqueuePendingColorRegen,
  slotNeedsAllStylesColorRegen,
} from "./pending-color-regen";

const ALL_SLOT_INDEXES = [0, 1, 2, 3, 4] as const;

function allSlotIndexesForSession(session: PreviewSession): number[] {
  return session.slots.map((_, index) => index);
}

function appendSlotColorCandidate(
  slot: PreviewSession["slots"][number],
  candidate: PreviewCandidate,
  activateAsPreview = false,
): void {
  const existingCandidates = slot.colorCandidates ?? [];
  const candidatesWithCurrent =
    slot.colorPreview &&
    !existingCandidates.some((item) => item.id === slot.colorPreview?.id)
      ? [...existingCandidates, slot.colorPreview]
      : existingCandidates;
  slot.colorCandidates = [
    ...candidatesWithCurrent.filter((item) => item.id !== candidate.id),
    candidate,
  ];
  if (
    activateAsPreview ||
    !slot.colorPreview ||
    slot.colorPreview.style === candidate.style ||
    !slot.colorPreview.previewUrl
  ) {
    slot.colorPreview = candidate;
  }
}

async function buildColorPreview(
  sessionId: string,
  slotIndex: number,
  sourceUrl: string,
  style: StyleType,
  version: number,
  trigger: PreviewGenerationTrigger,
  prefetched?: { base64: string; mimeType: string },
): Promise<PreviewCandidate> {
  const generationContext: PreviewGenerationContext = {
    sessionId,
    slot: slotIndex,
    trigger,
    side: "color",
    style,
  };
  const candidateId = randomUUID();
  const candidate: PreviewCandidate = {
    id: candidateId,
    kind: "color",
    style,
    sourceUrl,
    version,
    createdAt: new Date().toISOString(),
  };

  try {
    const cleanBuffer = await generateColorImageBuffer(
      sourceUrl,
      style,
      generationContext,
      prefetched,
    );
    const { cleanUpload, previewUpload } = await uploadCleanAndWatermarkedOutputs(
      cleanBuffer,
      sessionId,
      "color",
      slotIndex,
      version,
      style,
    );
    candidate.cleanUrl = cleanUpload.secureUrl;
    candidate.cleanPublicId = cleanUpload.publicId;
    candidate.previewUrl = previewUpload.secureUrl;
    candidate.previewPublicId = previewUpload.publicId;
    logPreviewGenerationSuccess(
      "color",
      {
        sessionId,
        slot: slotIndex,
        style,
        candidateId,
        trigger,
      },
      generationContext,
    );
  } catch (error) {
    candidate.error = toGenerationError(error);
    logPreviewGenerationFailure(
      "color",
      {
        sessionId,
        slot: slotIndex,
        style,
        candidateId,
        code: candidate.error.code,
        trigger,
      },
      error,
      generationContext,
    );
    maybeLogProhibitedContentEvent({
      sessionId,
      slotIndex,
      side: "color",
      candidateId,
      sourceUrl,
      trigger,
      style,
      error,
      errorCode: candidate.error.code,
    });
  }

  return candidate;
}

export function clearSlotColorPreview(
  session: PreviewSession,
  slotIndex: number,
): void {
  const slot = session.slots[slotIndex];
  if (!slot) return;
  slot.colorCandidates = [];
  slot.colorPreview = undefined;
  slot.colorInFlight = false;
}

export async function runSlotColorGeneration(
  sessionId: string,
  slotIndex: number,
  style: StyleType,
  options?: { trigger?: PreviewGenerationTrigger },
): Promise<PreviewSession | null> {
  const updated = await runColorGeneration(sessionId, style, [slotIndex], options);
  return updated;
}

export async function runColorGeneration(
  sessionId: string,
  style: StyleType,
  slotIndexes: number[],
  options?: { trigger?: PreviewGenerationTrigger },
): Promise<PreviewSession | null> {
  const trigger = options?.trigger ?? "initial";
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  const uniqueIndexes = [...new Set(slotIndexes)].filter(
    (index) => index >= 0 && index < session.slots.length,
  );
  const forceGenerate = trigger === "regenerate";
  const slotsToGenerate = uniqueIndexes
    .map((index) => ({ index, slot: session.slots[index] }))
    .filter(
      (entry): entry is { index: number; slot: PreviewSession["slots"][number] } =>
        Boolean(entry.slot) &&
        (forceGenerate || !slotHasColorPreviewForStyle(entry.slot, style)),
    );

  if (slotsToGenerate.length === 0) {
    syncColorPreviewToStyle(session, style);
    await savePreviewSession(session);
    return session;
  }

  for (const { slot } of slotsToGenerate) {
    slot.colorInFlight = true;
  }
  await savePreviewSession(session);

  const startedAt = Date.now();
  const results = await Promise.all(
    slotsToGenerate.map(({ slot, index }) => {
      const version = nextColorVersionForStyle(slot, style);
      return buildColorPreview(
        sessionId,
        index,
        slot.originalUrl,
        style,
        version,
        trigger,
      );
    }),
  );

  const latest = await loadPreviewSession(sessionId);
  if (!latest) return null;

  const activateNewPreview = trigger === "regenerate";
  slotsToGenerate.forEach(({ index }, resultIndex) => {
    const slot = latest.slots[index];
    if (!slot) return;
    const candidate = results[resultIndex];
    appendSlotColorCandidate(
      slot,
      candidate,
      activateNewPreview && Boolean(candidate.previewUrl),
    );
    slot.colorInFlight = false;
    if (!slotNeedsAllStylesColorRegen(slot)) {
      dequeuePendingColorRegen(latest, index);
    }
  });

  const succeeded = results.filter((candidate) => candidate.previewUrl).length;
  const failed = results.filter((candidate) => candidate.error).length;
  if (slotsToGenerate.length === allSlotIndexesForSession(session).length) {
    logPreviewGenerationSummary(
      "color",
      {
        sessionId,
        style,
        succeeded,
        failed,
        total: results.length,
        trigger,
      },
      { sessionId, trigger, side: "color", style },
    );
  }

  if (uniqueIndexes.length === allSlotIndexesForSession(latest).length) {
    syncColorPreviewToStyle(latest, style);
  } else {
    syncColorPreviewForSlots(latest, style, uniqueIndexes);
  }
  trackGenerationStepDuration({
    generation_type: trigger === "initial" ? "booklet_color" : "booklet_regen",
    startedAt,
    results,
    context: analyticsContextFromSession(latest),
  });
  await savePreviewSession(latest);
  return latest;
}

function freezeStyleStripThumbnailsIfNeeded(session: PreviewSession): void {
  if (session.frozenStyleStripThumbnails) {
    return;
  }
  const bookSlot = session.slots[BOOK_SLOT_INDEX];
  if (!bookSlot) {
    return;
  }
  const frozen: Partial<Record<StyleType, FrozenStyleStripThumbnail>> = {};
  for (const style of PREVIEW_COLOR_STYLES) {
    const candidate = getColorCandidateForStyle(bookSlot, style);
    if (candidate?.previewUrl) {
      frozen[style] = {
        previewUrl: candidate.previewUrl,
        candidateId: candidate.id,
      };
    }
  }
  if (Object.keys(frozen).length > 0) {
    session.frozenStyleStripThumbnails = frozen;
  }
}

export async function runSlotAllStylesColorGeneration(
  sessionId: string,
  slotIndex: number,
  options?: { trigger?: PreviewGenerationTrigger },
): Promise<PreviewSession | null> {
  const trigger = options?.trigger ?? "regenerate";
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  const slot = session.slots[slotIndex];
  if (!slot) return null;

  const stylesToGenerate = PREVIEW_COLOR_STYLES.filter(
    (style) => !slotHasColorPreviewForStyle(slot, style),
  );

  if (stylesToGenerate.length === 0) {
    dequeuePendingColorRegen(session, slotIndex);
    const activeStyle = session.selectedColorStyle ?? DEFAULT_COLOR_STYLE;
    syncColorPreviewForSlots(session, activeStyle, [slotIndex]);
    await savePreviewSession(session);
    return session;
  }

  slot.colorInFlight = true;
  await savePreviewSession(session);

  const startedAt = Date.now();
  const results = await Promise.all(
    stylesToGenerate.map(async (style) => {
      const latestForUrl = await loadPreviewSession(sessionId);
      const sourceUrl =
        latestForUrl?.slots[slotIndex]?.originalUrl ?? slot.originalUrl;
      const slotForVersion = latestForUrl?.slots[slotIndex] ?? slot;
      const version = nextColorVersionForStyle(slotForVersion, style);
      const candidate = await buildColorPreview(
        sessionId,
        slotIndex,
        sourceUrl,
        style,
        version,
        trigger,
      );
      return { style, candidate };
    }),
  );

  const latest = await loadPreviewSession(sessionId);
  if (!latest) return null;

  const latestSlot = latest.slots[slotIndex];
  if (latestSlot) {
    for (const { candidate } of results) {
      appendSlotColorCandidate(latestSlot, candidate);
    }
    latestSlot.colorInFlight = false;
  }

  dequeuePendingColorRegen(latest, slotIndex);
  const activeStyle = latest.selectedColorStyle ?? DEFAULT_COLOR_STYLE;
  syncColorPreviewForSlots(latest, activeStyle, [slotIndex]);

  const succeeded = results.filter(({ candidate }) => candidate.previewUrl).length;
  const failed = results.filter(({ candidate }) => candidate.error).length;
  logPreviewGenerationSummary(
    "color",
    {
      sessionId,
      slot: slotIndex,
      bundle: "all_styles_slot",
      succeeded,
      failed,
      total: results.length,
      trigger,
    },
    { sessionId, slot: slotIndex, trigger, side: "color" },
  );
  trackGenerationStepDuration({
    generation_type: "booklet_regen",
    startedAt,
    results: results.map(({ candidate }) => candidate),
    context: analyticsContextFromSession(latest),
  });

  await savePreviewSession(latest);
  return latest;
}

type InitialColorBundleTask = {
  index: number;
  style: StyleType;
};

export async function runInitialParallelColorBundle(
  sessionId: string,
): Promise<PreviewSession | null> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  const tasks: InitialColorBundleTask[] = [];

  for (let index = 0; index < session.slots.length; index += 1) {
    const slot = session.slots[index];
    if (!slot) continue;
    for (const style of PREVIEW_COLOR_STYLES) {
      if (!slotHasColorPreviewForStyle(slot, style)) {
        tasks.push({ index, style });
      }
    }
  }

  if (tasks.length === 0) {
    syncColorPreviewToStyle(session, DEFAULT_COLOR_STYLE);
    freezeStyleStripThumbnailsIfNeeded(session);
    await savePreviewSession(session);
    return session;
  }

  const indexesWithWork = new Set(tasks.map((task) => task.index));
  for (const index of indexesWithWork) {
    const slot = session.slots[index];
    if (slot) {
      slot.colorInFlight = true;
    }
  }
  await savePreviewSession(session);

  const startedAt = Date.now();

  // Pre-fetch each slot's image once, then share across all 3 style tasks for that slot.
  const prefetchedByIndex = new Map<number, { base64: string; mimeType: string }>();
  await Promise.all(
    [...indexesWithWork].map(async (index) => {
      const slot = session.slots[index];
      if (!slot?.originalUrl) return;
      try {
        prefetchedByIndex.set(index, await downloadImageAsBase64ForGemini(slot.originalUrl));
      } catch {
        // If prefetch fails, individual tasks will retry the download themselves.
      }
    }),
  );

  const results = await Promise.all(
    tasks.map(({ index, style }) => {
      const slot = session.slots[index];
      if (!slot) {
        throw new Error(`Missing preview slot ${index}`);
      }
      const version = nextColorVersionForStyle(slot, style);
      return buildColorPreview(
        sessionId,
        index,
        slot.originalUrl,
        style,
        version,
        "initial",
        prefetchedByIndex.get(index),
      ).then((candidate) => ({ index, style, candidate }));
    }),
  );

  const latest = await loadPreviewSession(sessionId);
  if (!latest) return null;

  for (const { index, candidate } of results) {
    const slot = latest.slots[index];
    if (!slot) continue;
    appendSlotColorCandidate(slot, candidate);
  }

  for (const index of indexesWithWork) {
    const slot = latest.slots[index];
    if (slot) {
      slot.colorInFlight = false;
    }
  }

  const succeeded = results.filter(({ candidate }) => candidate.previewUrl).length;
  const failed = results.filter(({ candidate }) => candidate.error).length;
  logPreviewGenerationSummary(
    "color",
    {
      sessionId,
      bundle: "initial",
      succeeded,
      failed,
      total: results.length,
      trigger: "initial",
    },
    { sessionId, trigger: "initial", side: "color" },
  );
  trackGenerationStepDuration({
    generation_type: "booklet_color",
    startedAt,
    results: results.map(({ candidate }) => candidate),
    context: analyticsContextFromSession(latest),
  });

  syncColorPreviewToStyle(latest, DEFAULT_COLOR_STYLE);
  freezeStyleStripThumbnailsIfNeeded(latest);
  await savePreviewSession(latest);
  return latest;
}

export async function runParallelColorGeneration(
  sessionId: string,
  style: StyleType,
): Promise<PreviewSession | null> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  if (allSlotsHaveColorForStyle(session, style)) {
    syncColorPreviewToStyle(session, style);
    await savePreviewSession(session);
    return session;
  }

  return runColorGeneration(
    sessionId,
    style,
    allSlotIndexesForSession(session),
    {
      trigger: "initial",
    },
  );
}

/** Color-only booklet flow: generate a single style for every slot in parallel. */
export async function runColorfulBookColorGeneration(
  sessionId: string,
): Promise<PreviewSession | null> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  const style: StyleType = "colorful";
  const indexes = allSlotIndexesForSession(session);

  for (const index of indexes) {
    const slot = session.slots[index];
    if (slot) {
      slot.inFlight = false;
      slot.colorInFlight = true;
    }
  }
  session.selectedColorStyle = style;
  session.phase = "bw_approved";
  await savePreviewSession(session);

  const updated = await runColorGeneration(sessionId, style, indexes, {
    trigger: "initial",
  });
  if (!updated) return null;

  syncColorPreviewToStyle(updated, style);
  updated.phase = "bw_approved";
  updated.selectedColorStyle = style;
  updated.slots = updated.slots.map((slot) => ({
    ...slot,
    inFlight: false,
    colorInFlight: false,
  }));
  await savePreviewSession(updated);
  return updated;
}

export function getActiveColorCandidate(
  slot: PreviewSession["slots"][number],
  style: StyleType,
): PreviewCandidate | undefined {
  return getColorCandidateForStyle(slot, style);
}
