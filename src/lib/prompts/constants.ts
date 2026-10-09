import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Prompts and models live in `prompts/` at the repo root: the single source of truth,
 * so local and production always generate with the same prompt and model.
 * No env overrides and no defaults: a missing or empty file fails loudly.
 * (The processing admin reads the same files for its Prompts page.)
 */
const PROMPTS_DIR = path.join(process.cwd(), "prompts");

const cache = new Map<string, string>();

function readPromptFile(fileName: string): string {
  const cached = cache.get(fileName);
  if (cached !== undefined) return cached;

  const filePath = path.join(PROMPTS_DIR, fileName);
  let text: string;
  try {
    text = readFileSync(filePath, "utf8").trim();
  } catch (error) {
    throw new Error(`Prompt file prompts/${fileName} could not be read: ${(error as Error).message}`);
  }
  if (!text) throw new Error(`Prompt file prompts/${fileName} is empty.`);
  cache.set(fileName, text);
  return text;
}

export const getBlackAndWhitePrompt = () => readPromptFile("bw.txt");
/** Single colorful style (`pens`), the live booklet color prompt. */
export const getPensColorPrompt = () => readPromptFile("color-pens.txt");
/** Two-style booklet mode, kept for rollback (NEXT_PUBLIC_PREVIEW_SINGLE_COLOR_STYLE=false). */
export const getPencilColorPrompt = () => readPromptFile("color-pencil.txt");
export const getWatercolorColorPrompt = () => readPromptFile("color-watercolor.txt");
export const getFramedArtPencilPrompt = () => readPromptFile("framed-pencil.txt");
export const getFramedArtWatercolorPrompt = () => readPromptFile("framed-watercolor.txt");

type ModelKey = "bw" | "color" | "framedArt";

export function getImageModel(key: ModelKey): string {
  const models = JSON.parse(readPromptFile("models.json")) as Partial<Record<ModelKey, unknown>>;
  const model = models[key];
  if (typeof model !== "string" || !model.trim()) {
    throw new Error(`Model "${key}" is missing in prompts/models.json.`);
  }
  return model.trim();
}

/**
 * Identifies the exact prompt text + model an image was generated with. Saved on each
 * generated image and sent to Shopify, so the processing admin can name the prompt
 * version (it computes the same value from git history; keep both copies identical).
 */
export function promptFingerprint(model: string, promptText: string): string {
  return createHash("sha256").update(`${model.trim()}\n${promptText.trim()}`).digest("hex").slice(0, 10);
}
