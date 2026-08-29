import { randomUUID } from "crypto";
import type { StyleType } from "@/components/style-selector";
import { nextColorVersionForStyle } from "./cloudinary-paths";
import { uploadCleanAndWatermarkedOutputs } from "./upload-preview-outputs";
import {
  allSlotsHaveColorForStyle,
  BOOK_SLOT_INDEX,
  getDefaultColorStyle,
  getPreviewColorStyles,
  getColorCandidateForStyle,
  slotHasColorPreviewForStyle,
  syncColorPreviewForSlots,
  syncColorPreviewToStyle,
} from "./color-by-style";
import { isPreviewSingleColorStyleEnabled } from "@/lib/feature-flags";
import {
  dequeuePendingColorRegen,
  enqueuePendingColorRegen,
  slotNeedsAllStylesColorRegen,
} from "./pending-color-regen";
import { generateColorImageBuffer, downloadImageAsBase64ForGemini } from "./generate-color";
import { toGenerationError } from "./generate-bw";
import {
  colorGenerationClaimKey,
  releaseGenerationClaim,
  tryClaimGeneration,
} from "./generation-claim";
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
  options?: { dedupeInitialSuccess?: boolean },
): void {
  const existingCandidates = slot.colorCandidates ?? [];
  const candidatesWithCurrent =
    slot.colorPreview &&
    !existingCandidates.some((item) => item.id === slot.colorPreview?.id)
      ? [...existingCandidates, slot.colorPreview]
      : existingCandidates;

  // Initial pipeline races can finish twice for the same style; keep one success.
  if (
    options?.dedupeInitialSuccess &&
    candidate.previewUrl &&
    !candidate.error
  ) {
    const alreadyHaveSuccess = candidatesWithCurrent.some(
      (item) =>
        item.kind === "color" &&
        (item.style ?? "pencil") === (candidate.style ?? "pencil") &&
        item.sourceUrl === candidate.sourceUrl &&
        Boolean(item.previewUrl) &&
        !item.error,
    );
    if (alreadyHaveSuccess) {
      if (
        activateAsPreview ||
        !slot.colorPreview ||
        slot.colorPreview.style === candidate.style ||
        !slot.colorPreview.previewUrl
      ) {
        const existing = candidatesWithCurrent.find(
          (item) =>
            item.kind === "color" &&
            (item.style ?? "pencil") === (candidate.style ?? "pencil") &&
            item.sourceUrl === candidate.sourceUrl &&
            Boolean(item.previewUrl) &&
            !item.error,
        );
        if (existing) {
          slot.colorPreview = existing;
        }
      }
      return;
    }
  }

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

/**
 * Builds a color candidate. For initial generation, acquires a Redis claim first
 * so concurrent workers cannot bill Gemini twice for the same slot+style+source.
 * Returns null when another worker already owns the claim (caller must skip).
 */
async function buildColorPreview(
  sessionId: string,
  slotIndex: number,
  sourceUrl: string,
  style: StyleType,
  version: number,
  trigger: PreviewGenerationTrigger,
  prefetched?: { base64: string; mimeType: string },
): Promise<PreviewCandidate | null> {
  const claimKey =
    trigger === "initial"
      ? colorGenerationClaimKey(sessionId, slotIndex, style, sourceUrl)
      : null;

  if (claimKey) {
    const claimed = await tryClaimGeneration(claimKey);
    if (!claimed) {
      return null;
    }
  }

  try {
    // Final check after claim — peer may have saved success between filter and claim.
    if (trigger === "initial") {
      const latest = await loadPreviewSession(sessionId);
      const slot = latest?.slots[slotIndex];
      if (slot && slotHasColorPreviewForStyle(slot, style)) {
        const existing = getColorCandidateForStyle(slot, style);
        if (existing?.previewUrl && !existing.error) {
          return null;
        }
      }
    }

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
  } finally {
    if (claimKey) {
      await releaseGenerationClaim(claimKey);
    }
  }
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
  try {
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
      if (candidate) {
        appendSlotColorCandidate(
          slot,
          candidate,
          activateNewPreview && Boolean(candidate.previewUrl),
          { dedupeInitialSuccess: trigger === "initial" },
        );
      }
      slot.colorInFlight = false;
      if (!slotNeedsAllStylesColorRegen(slot)) {
        dequeuePendingColorRegen(latest, index);
      }
    });

    const billed = results.filter(
      (candidate): candidate is PreviewCandidate => Boolean(candidate),
    );
    const succeeded = billed.filter((candidate) => candidate.previewUrl).length;
    const failed = billed.filter((candidate) => candidate.error).length;
    if (slotsToGenerate.length === allSlotIndexesForSession(session).length) {
      logPreviewGenerationSummary(
        "color",
        {
          sessionId,
          style,
          succeeded,
          failed,
          total: billed.length,
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
      results: billed,
      context: analyticsContextFromSession(latest),
    });
    await savePreviewSession(latest);
    return latest;
  } catch (error) {
    const latest = await loadPreviewSession(sessionId);
    if (latest) {
      for (const { index } of slotsToGenerate) {
        const slot = latest.slots[index];
        if (slot) {
          slot.colorInFlight = false;
        }
      }
      await savePreviewSession(latest);
    }
    throw error;
  }
}

function freezeStyleStripThumbnailsIfNeeded(session: PreviewSession): void {
  if (isPreviewSingleColorStyleEnabled()) {
    return;
  }
  if (session.frozenStyleStripThumbnails) {
    return;
  }
  const bookSlot = session.slots[BOOK_SLOT_INDEX];
  if (!bookSlot) {
    return;
  }
  const frozen: Partial<Record<StyleType, FrozenStyleStripThumbnail>> = {};
  for (const style of getPreviewColorStyles()) {
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

  const stylesToGenerate = getPreviewColorStyles().filter(
    (style) => !slotHasColorPreviewForStyle(slot, style),
  );

  if (stylesToGenerate.length === 0) {
    dequeuePendingColorRegen(session, slotIndex);
    const activeStyle = session.selectedColorStyle ?? getDefaultColorStyle();
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
      if (candidate) {
        appendSlotColorCandidate(latestSlot, candidate, false, {
          dedupeInitialSuccess: trigger === "initial",
        });
      }
    }
    latestSlot.colorInFlight = false;
  }

  dequeuePendingColorRegen(latest, slotIndex);
  const activeStyle = latest.selectedColorStyle ?? getDefaultColorStyle();
  syncColorPreviewForSlots(latest, activeStyle, [slotIndex]);

  const billed = results
    .map(({ candidate }) => candidate)
    .filter((candidate): candidate is PreviewCandidate => Boolean(candidate));
  const succeeded = billed.filter((candidate) => candidate.previewUrl).length;
  const failed = billed.filter((candidate) => candidate.error).length;
  logPreviewGenerationSummary(
    "color",
    {
      sessionId,
      slot: slotIndex,
      bundle: "all_styles_slot",
      succeeded,
      failed,
      total: billed.length,
      trigger,
    },
    { sessionId, slot: slotIndex, trigger, side: "color" },
  );
  trackGenerationStepDuration({
    generation_type: "booklet_regen",
    startedAt,
    results: billed,
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
    for (const style of getPreviewColorStyles()) {
      if (!slotHasColorPreviewForStyle(slot, style)) {
        tasks.push({ index, style });
      }
    }
  }

  if (tasks.length === 0) {
    syncColorPreviewToStyle(session, getDefaultColorStyle());
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

  // Re-check after save — another worker may have finished while we prepared.
  const fresh = await loadPreviewSession(sessionId);
  if (!fresh) return null;
  const tasksStillNeeded = tasks.filter(({ index, style }) => {
    const slot = fresh.slots[index];
    return Boolean(slot) && !slotHasColorPreviewForStyle(slot, style);
  });

  if (tasksStillNeeded.length === 0) {
    syncColorPreviewToStyle(fresh, getDefaultColorStyle());
    freezeStyleStripThumbnailsIfNeeded(fresh);
    for (const index of indexesWithWork) {
      const slot = fresh.slots[index];
      if (slot) slot.colorInFlight = false;
    }
    await savePreviewSession(fresh);
    return fresh;
  }

  // Pre-fetch each slot's image once, then share across style tasks for that slot.
  const prefetchedByIndex = new Map<number, { base64: string; mimeType: string }>();
  const indexesStillNeeded = new Set(tasksStillNeeded.map((task) => task.index));
  await Promise.all(
    [...indexesStillNeeded].map(async (index) => {
      const slot = fresh.slots[index];
      if (!slot?.originalUrl) return;
      try {
        prefetchedByIndex.set(index, await downloadImageAsBase64ForGemini(slot.originalUrl));
      } catch {
        // If prefetch fails, individual tasks will retry the download themselves.
      }
    }),
  );

  const results = await Promise.all(
    tasksStillNeeded.map(({ index, style }) => {
      const slot = fresh.slots[index];
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
    if (!slot || !candidate) continue;
    appendSlotColorCandidate(slot, candidate, false, {
      dedupeInitialSuccess: true,
    });
  }

  for (const index of indexesWithWork) {
    const slot = latest.slots[index];
    if (slot) {
      slot.colorInFlight = false;
    }
  }

  const billed = results
    .map(({ candidate }) => candidate)
    .filter((candidate): candidate is PreviewCandidate => Boolean(candidate));
  const succeeded = billed.filter((candidate) => candidate.previewUrl).length;
  const failed = billed.filter((candidate) => candidate.error).length;
  logPreviewGenerationSummary(
    "color",
    {
      sessionId,
      bundle: "initial",
      succeeded,
      failed,
      total: billed.length,
      trigger: "initial",
    },
    { sessionId, trigger: "initial", side: "color" },
  );
  trackGenerationStepDuration({
    generation_type: "booklet_color",
    startedAt,
    results: billed,
    context: analyticsContextFromSession(latest),
  });

  syncColorPreviewToStyle(latest, getDefaultColorStyle());
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

/** Color-only booklet flow: all slots in default style; dual mode also thumbs pencil on slot 0. */
export async function runColorfulBookColorGeneration(
  sessionId: string,
): Promise<PreviewSession | null> {
  const session = await loadPreviewSession(sessionId);
  if (!session) return null;

  const indexes = allSlotIndexesForSession(session);
  const defaultStyle = getDefaultColorStyle();
  const singleStyle = isPreviewSingleColorStyleEnabled();

  for (const index of indexes) {
    const slot = session.slots[index];
    if (slot) {
      slot.inFlight = false;
      slot.colorInFlight = true;
    }
  }
  session.selectedColorStyle = defaultStyle;
  session.phase = "bw_approved";
  await savePreviewSession(session);

  // All default-style slots first (primary product images).
  let updated = await runColorGeneration(sessionId, defaultStyle, indexes, {
    trigger: "initial",
  });
  if (!updated) return null;

  // Dual mode: one pencil preview (slot 0) for the style-switcher button.
  if (
    !singleStyle &&
    !slotHasColorPreviewForStyle(updated.slots[BOOK_SLOT_INDEX], "pencil")
  ) {
    updated = await runColorGeneration(
      sessionId,
      "pencil",
      [BOOK_SLOT_INDEX],
      { trigger: "initial" },
    );
    if (!updated) return null;
  }

  syncColorPreviewToStyle(updated, defaultStyle);
  freezeStyleStripThumbnailsIfNeeded(updated);
  updated.phase = "bw_approved";
  updated.selectedColorStyle = defaultStyle;
  updated.generationStatus = allSlotsHaveColorForStyle(updated, defaultStyle)
    ? "complete"
    : "failed";
  if (updated.generationStatus === "complete") {
    updated.initializationError = undefined;
  }
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
