import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { buildNanoBananaSystemInstructionText } from "@/lib/gemini-nano-banana-system";
import { BLACK_AND_WHITE_PROMPT } from "@/lib/prompts/constants";
import {
  classifyGenerationError,
  shouldStopGeminiRetry,
} from "./generation-errors";
import {
  logGeminiRequest,
  logGeminiResponse,
  logPreviewGenerationFailure,
  type PreviewGenerationContext,
} from "./generation-log";

const BW_MODEL = "gemini-2.5-flash-image";
const MAX_RETRIES = 2;

function isMockGenerationEnabled(): boolean {
  return process.env.MOCK_AI_GENERATION === "true";
}

async function createMockBwImage(sourceUrl: string): Promise<Buffer> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error("Failed to download source image for mock generation");
  }
  const sourceBuffer = Buffer.from(await response.arrayBuffer());
  return sharp(sourceBuffer)
    .grayscale()
    .threshold(170)
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
  generationContext?: PreviewGenerationContext,
): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured");
    logPreviewGenerationFailure(
      "bw",
      { model: BW_MODEL, stage: "config" },
      error,
      generationContext,
    );
    throw error;
  }

  const { base64, mimeType } = await downloadImageAsBase64(imageUrl);
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildNanoBananaSystemInstructionText(true);

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let geminiStartedAt = Date.now();
    try {
      logGeminiRequest(
        "bw",
        {
          model: BW_MODEL,
          systemInstruction,
          userPrompt: BLACK_AND_WHITE_PROMPT,
          attempt: attempt + 1,
        },
        generationContext,
      );

      geminiStartedAt = Date.now();
      const response = await ai.models.generateContent({
        model: BW_MODEL,
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
              { text: BLACK_AND_WHITE_PROMPT },
            ],
          },
        ],
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          logGeminiResponse(
            "bw",
            {
              model: BW_MODEL,
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
        "bw",
        {
          model: BW_MODEL,
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

export async function generateBwImageBuffer(
  imageUrl: string,
  generationContext?: PreviewGenerationContext,
): Promise<Buffer> {
  if (isMockGenerationEnabled()) {
    return createMockBwImage(imageUrl);
  }
  return generateWithGemini(imageUrl, generationContext);
}

export { classifyGenerationError as toGenerationError } from "./generation-errors";
