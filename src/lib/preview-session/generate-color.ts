import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import type { StyleType } from "@/components/style-selector";
import {
  CARTOON_COLOR_PROMPT,
  COLOR_SYSTEM_INSTRUCTION,
  PENCIL_COLOR_PROMPT,
  WATERCOLOR_COLOR_PROMPT,
} from "@/lib/prompts/constants";
import { toGenerationError } from "./generate-bw";
import {
  logGeminiRequest,
  logGeminiResponse,
  logPreviewGenerationFailure,
  type PreviewGenerationContext,
} from "./generation-log";

const COLOR_MODEL = "gemini-2.5-flash-image";
const MAX_RETRIES = 2;

const STYLE_PROMPTS: Record<StyleType, string> = {
  pencil: PENCIL_COLOR_PROMPT,
  cartoon: CARTOON_COLOR_PROMPT,
  watercolor: WATERCOLOR_COLOR_PROMPT,
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

async function downloadImageAsBase64(
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download source image (${response.status})`);
  }
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { base64: buffer.toString("base64"), mimeType };
}

async function generateWithGemini(
  imageUrl: string,
  prompt: string,
  generationContext?: PreviewGenerationContext,
): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured");
    logPreviewGenerationFailure(
      "color",
      { model: COLOR_MODEL, stage: "config" },
      error,
      generationContext,
    );
    throw error;
  }

  const { base64, mimeType } = await downloadImageAsBase64(imageUrl);
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = COLOR_SYSTEM_INSTRUCTION;

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
          systemInstruction,
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
      const classified = toGenerationError(error);
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
      if (classified.code === "safety" || attempt === MAX_RETRIES) {
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
): Promise<Buffer> {
  if (isMockGenerationEnabled()) {
    return createMockColorImage(imageUrl);
  }

  const prompt = resolveColorPrompt(style);
  return generateWithGemini(imageUrl, prompt, generationContext);
}
