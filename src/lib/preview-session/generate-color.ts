import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import type { StyleType } from "@/components/style-selector";
import {
  getFramedArtPencilPrompt,
  getFramedArtWatercolorPrompt,
  getImageModel,
  getPencilColorPrompt,
  getPensColorPrompt,
  getWatercolorColorPrompt,
} from "@/lib/prompts/constants";
import { classifyGenerationError, shouldStopGeminiRetry } from "./generation-errors";
import {
  logGeminiRequest,
  logGeminiResponse,
  logPreviewGenerationFailure,
  type PreviewGenerationContext,
} from "./generation-log";
import { fetchStorageBuffer } from "@/lib/storage/objects";
import { downloadImageAsBase64ForGemini } from "./prepare-gemini-input";

const MAX_RETRIES = 2;

export type ColorGenerationProduct = "book" | "framed_art";

/** Color image model, from prompts/models.json. */
function getColorImageModel(product: ColorGenerationProduct): string {
  return getImageModel(product === "framed_art" ? "framedArt" : "color");
}

let _geminiClient: GoogleGenAI | undefined;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (!_geminiClient) _geminiClient = new GoogleGenAI({ apiKey });
  return _geminiClient;
}

/** Prompt per booklet style (prompts/*.txt). `cartoon` was dropped and has no prompt. */
const STYLE_PROMPTS: Partial<Record<StyleType, () => string>> = {
  pencil: getPencilColorPrompt,
  watercolor: getWatercolorColorPrompt,
  pens: getPensColorPrompt,
  /** Legacy alias of `pens`. */
  colorful: getPensColorPrompt,
};

/** Framed-art prompts; styles not listed use STYLE_PROMPTS. */
const FRAMED_ART_STYLE_PROMPTS: Partial<Record<StyleType, () => string>> = {
  pencil: getFramedArtPencilPrompt,
  watercolor: getFramedArtWatercolorPrompt,
};

function resolveColorPrompt(
  style: StyleType,
  product: ColorGenerationProduct,
): string {
  const getPrompt =
    (product === "framed_art" ? FRAMED_ART_STYLE_PROMPTS[style] : undefined) ??
    STYLE_PROMPTS[style];
  if (!getPrompt) {
    throw new Error(
      `Color generation prompt for style "${style}" is not configured.`,
    );
  }
  return getPrompt();
}

function isMockGenerationEnabled(): boolean {
  return process.env.MOCK_AI_GENERATION === "true";
}

async function createMockColorImage(sourceUrl: string): Promise<Buffer> {
  const { buffer: sourceBuffer } = await fetchStorageBuffer(sourceUrl);
  return sharp(sourceBuffer)
    .modulate({ saturation: 1.35, brightness: 1.05 })
    .png()
    .toBuffer();
}

async function generateWithGemini(
  imageUrl: string,
  prompt: string,
  generationContext?: PreviewGenerationContext,
  prefetched?: { base64: string; mimeType: string },
  product: ColorGenerationProduct = "book",
): Promise<Buffer> {
  const colorModel = getColorImageModel(product);
  let ai: GoogleGenAI;
  try {
    ai = getGeminiClient();
  } catch (error) {
    logPreviewGenerationFailure(
      "color",
      { model: colorModel, stage: "config" },
      error,
      generationContext,
    );
    throw error;
  }

  let source;
  try {
    source =
      prefetched ?? (await downloadImageAsBase64ForGemini(imageUrl));
  } catch (error) {
    logPreviewGenerationFailure(
      "color",
      { model: colorModel, stage: "download" },
      error,
      generationContext,
    );
    throw error;
  }
  const { base64, mimeType } = source;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let geminiStartedAt = Date.now();
    try {
      logGeminiRequest(
        "color",
        {
          model: colorModel,
          userPrompt: prompt,
          attempt: attempt + 1,
        },
        generationContext,
      );

      geminiStartedAt = Date.now();
      const response = await ai.models.generateContent({
        model: colorModel,
        config: {
          topP: 1,
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64,
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
        ],
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          logGeminiResponse(
            "color",
            {
              model: colorModel,
              attempt: attempt + 1,
              durationMs: Date.now() - geminiStartedAt,
              outcome: "success",
            },
            generationContext,
          );
          return Buffer.from(part.inlineData.data, "base64");
        }
      }

      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`safety blocked: ${blockReason}`);
      }

      const finishReason = response.candidates?.[0]?.finishReason;
      throw new Error(
        finishReason
          ? `Gemini response did not include an image (finishReason=${finishReason})`
          : "Gemini response did not include an image",
      );
    } catch (error) {
      lastError = error;
      const classified = classifyGenerationError(error);
      logPreviewGenerationFailure(
        "color",
        {
          model: colorModel,
          stage: "gemini",
          attempt: attempt + 1,
          code: classified.code,
          durationMs: Date.now() - geminiStartedAt,
        },
        error,
        generationContext,
      );
      if (shouldStopGeminiRetry(classified) || attempt === MAX_RETRIES) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to generate image");
}

export async function generateColorImageBuffer(
  imageUrl: string,
  style: StyleType,
  generationContext?: PreviewGenerationContext,
  prefetched?: { base64: string; mimeType: string },
  product: ColorGenerationProduct = "book",
): Promise<Buffer> {
  if (isMockGenerationEnabled()) {
    return createMockColorImage(imageUrl);
  }

  const prompt = resolveColorPrompt(style, product);
  return generateWithGemini(
    imageUrl,
    prompt,
    generationContext,
    prefetched,
    product,
  );
}

export { downloadImageAsBase64ForGemini } from "./prepare-gemini-input";
