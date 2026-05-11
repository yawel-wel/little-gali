import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { buildNanoBananaSystemInstructionText } from "@/lib/gemini-nano-banana-system";
import { BLACK_AND_WHITE_PROMPT } from "@/lib/prompts/constants";
import type { GenerationError } from "./types";

const BW_MODEL = "gemini-2.5-flash-image";
const MAX_RETRIES = 2;

function isMockGenerationEnabled(): boolean {
  return process.env.MOCK_AI_GENERATION === "true";
}

function classifyGenerationError(error: unknown): GenerationError {
  const message =
    error instanceof Error ? error.message : "Unknown generation error";
  const lower = message.toLowerCase();
  if (
    lower.includes("safety") ||
    lower.includes("blocked") ||
    lower.includes("policy") ||
    lower.includes("harm")
  ) {
    return {
      code: "safety",
      message:
        "לא הצלחנו לעבד את התמונה. נסו תמונה אחרת עם פחות רגישות לפרטיות.",
    };
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return {
      code: "timeout",
      message: "העיבוד לקח יותר מדי זמן. נסו שוב בעוד רגע.",
    };
  }
  return {
    code: "generic",
    message: "משהו השתבש בזמן יצירת התמונה. נסו שוב.",
  };
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

async function generateWithGemini(imageUrl: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { base64, mimeType } = await downloadImageAsBase64(imageUrl);
  const ai = new GoogleGenAI({ apiKey });

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: BW_MODEL,
        config: {
          topP: 1,
          responseModalities: ["IMAGE", "TEXT"],
          systemInstruction: buildNanoBananaSystemInstructionText(true),
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
          return Buffer.from(part.inlineData.data, "base64");
        }
      }

      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`safety blocked: ${blockReason}`);
      }

      throw new Error("Gemini response did not include an image");
    } catch (error) {
      lastError = error;
      const classified = classifyGenerationError(error);
      if (classified.code === "safety" || attempt === MAX_RETRIES) {
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
): Promise<Buffer> {
  if (isMockGenerationEnabled()) {
    return createMockBwImage(imageUrl);
  }
  return generateWithGemini(imageUrl);
}

export function toGenerationError(error: unknown): GenerationError {
  return classifyGenerationError(error);
}
