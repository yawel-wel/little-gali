import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import type { StyleType } from "@/components/style-selector";
import {
  CARTOON_COLOR_PROMPT,
  COLORFUL_BOOK_PROMPT,
  GENERATION_SYSTEM_INSTRUCTION,
  PENCIL_COLOR_PROMPT,
  PENS_COLOR_PROMPT,
  WATERCOLOR_COLOR_PROMPT,
} from "@/lib/prompts/constants";
import { classifyGenerationError, shouldStopGeminiRetry } from "./generation-errors";
import {
  logGeminiRequest,
  logGeminiResponse,
  logPreviewGenerationFailure,
  type PreviewGenerationContext,
} from "./generation-log";
import { downloadImageAsBase64ForGemini } from "./prepare-gemini-input";

const COLOR_MODEL = "gemini-2.5-flash-image";
const MAX_RETRIES = 2;

let _geminiClient: GoogleGenAI | undefined;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (!_geminiClient) _geminiClient = new GoogleGenAI({ apiKey });
  return _geminiClient;
}

const STYLE_PROMPTS: Record<StyleType, string> = {
  pencil: PENCIL_COLOR_PROMPT,
  cartoon: CARTOON_COLOR_PROMPT,
  watercolor: WATERCOLOR_COLOR_PROMPT,
  colorful: COLORFUL_BOOK_PROMPT,
  pens: PENS_COLOR_PROMPT,
};

function resolveColorPrompt(style: StyleType): string {
  const prompt = STYLE_PROMPTS[style];
  if (!prompt) {
    throw new Error(
      `Color generation prompt for style "${style}" is not configured.`,
    );
  }
  return prompt;
}

function isMockGenerationEnabled(): boolean {
  return process.env.MOCK_AI_GENERATION === "true";
}

async function createMockColorImage(sourceUrl: string): Promise<Buffer> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error("Failed to download source image for mock generation");
  }
  const sourceBuffer = Buffer.from(await response.arrayBuffer());
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
): Promise<Buffer> {
  let ai: GoogleGenAI;
  try {
    ai = getGeminiClient();
  } catch (error) {
    logPreviewGenerationFailure(
      "color",
      { model: COLOR_MODEL, stage: "config" },
      error,
      generationContext,
    );
    throw error;
  }

  const { base64, mimeType } = prefetched ?? await downloadImageAsBase64ForGemini(imageUrl);
  // Would be sent to the API as systemInstruction (disabled for prompt testing).
  const systemInstruction = GENERATION_SYSTEM_INSTRUCTION;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let geminiStartedAt = Date.now();
    try {
      logGeminiRequest(
        "color",
        {
          model: COLOR_MODEL,
          systemInstruction,
          userPrompt: prompt,
          attempt: attempt + 1,
        },
        generationContext,
      );

      geminiStartedAt = Date.now();
      const response = await ai.models.generateContent({
        model: COLOR_MODEL,
        config: {
          topP: 1,
          responseModalities: ["IMAGE", "TEXT"],
          // systemInstruction, // would send GENERATION_SYSTEM_INSTRUCTION (disabled for prompt testing)
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
              model: COLOR_MODEL,
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
          model: COLOR_MODEL,
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
): Promise<Buffer> {
  if (isMockGenerationEnabled()) {
    return createMockColorImage(imageUrl);
  }

  const prompt = resolveColorPrompt(style);
  return generateWithGemini(imageUrl, prompt, generationContext, prefetched);
}

export { downloadImageAsBase64ForGemini } from "./prepare-gemini-input";
