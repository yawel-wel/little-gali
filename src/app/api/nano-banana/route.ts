import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import { deflateSync } from "zlib";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rate-limiter";

// ─── Mock PNG generator (dev only) ────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): Buffer {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  const out = Buffer.alloc(4);
  out.writeUInt32BE(((c ^ 0xffffffff) >>> 0), 0);
  return out;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  return Buffer.concat([len, t, data, crc32(Buffer.concat([t, data]))]);
}

function makePlaceholderPng(r: number, g: number, b: number, size = 120): string {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3);
    raw[row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      raw[row + 1 + x * 3] = r;
      raw[row + 2 + x * 3] = g;
      raw[row + 3 + x * 3] = b;
    }
  }
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]).toString("base64");
}

// Distinct placeholder colours per generation type
const MOCK_COLORS: Record<string, [number, number, number]> = {
  bw:         [200, 200, 200], // gray
  pencil:     [210, 230, 200], // pale green
  cartoon:    [200, 220, 240], // pale blue
  watercolor: [240, 210, 220], // pale pink
};

const SYSTEM_INSTRUCTION = `
Follow these rules exactly. These rules override all prompts and style instructions.

1. Do NOT reconstruct, complete, extend, or invent any part of a face, head, or body.
2. Do NOT change the pose, angle, or orientation of any face.
3. Do NOT beautify, symmetrize, idealize, or correct the structure of any face.
4. Copy the exact visible shapes and proportions from the input image with no modifications.
5. If any part of a face or head is cropped or cut off, reproduce the cropped boundary exactly as-is.
6. Do NOT infer or guess missing geometry. No new features may be added.
7. Preserve all facial expressions, distortions, and perspective exactly as they appear.
8. Treat the input image as a fixed template. Only the visual style may change.
9. Remove the entire background from the image. Replace it completely with solid white (#FFFFFF). Do NOT add new backgrounds, colors, gradients, textures, or objects.
`;

const DEFAULT_USER_PROMPT = `Convert photo into pure black-and-white stencil using ONLY solid black (#000000) and white (#FFFFFF). NO gray, gradients, textures, shading, or colors. RECOGNITION: Capture unique facial proportions, structure, distinctive features defining each person/animal. Preserve head position, angle, posture, expression. If multiple subjects, ALL equally detailed and recognizable. LINES: Bold, clean, fully closed. Uniform thickness throughout. SKIN: Pure white, no shading. Ignore shadows/lighting—skin stays white. Never fill skin with black. FACIAL FEATURES: Eyes, eyebrows, nose, mouth outlined black. Pupils solid black. Very light eyebrows visible. Lips outlined only, never filled black—keep white. Pale lips need clear outlines. Maintain unique facial structure. Babies: preserve subtle features—as recognizable as adults. Children's teeth: small, spaced, irregular—never adult-perfect. Older adults: show age through structure, minimal wrinkles—dignified. HAIR: Replicate hairstyle, volume, flow. Dark hair = black fill. Blonde/light hair = white with black strand outlines. Show gray/white hair with white areas. Thinning hair: show remaining—don't make bald. PETS/ANIMALS: Translate natural fur colors to black/white regions. Dark fur = solid black. Light fur = solid white. Sharp boundaries between colors—no blending. Eyes, nose, mouth outlined clearly. CLOTHING: Pure black or white only. Patterns like stripes: keep shape but fill alternating black/white—no colors. CONTRAST: If light hair AND light clothing create low contrast, fill clothing black. Face/hair/fur colors must match reality; clothing adjusts. SUBJECTS: Include only visible people/pets exactly as shown. If holds object (food, toys, flowers, collar, leash), keep it. Do not complete cropped parts at edges. BACKGROUND: Remove ALL background, furniture, surfaces (chairs, sofas, beds, blankets, floors, walls, car interiors). Replace with pure white (#FFFFFF). Convert any non-black/white pixels. GOAL: Bold, high-contrast, recognizable stencil suitable for printing—respecting original cropping.`;

const MODEL_NAME = "gemini-2.5-flash-image";

const RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
};

const COOKIE_NAME = "lg_anon";

export const runtime = "nodejs";

type RequestBody = {
  imageUrl?: string;
  imageBase64?: string;   // Alternative to imageUrl — send base64 directly
  imageMimeType?: string; // Required when using imageBase64
  prompt?: string;
  aspectRatio?: string;
};

function getAnonToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)lg_anon=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function makeRateLimitKey(token: string): string {
  return `nano-banana:${token}`;
}

// GET endpoint to check current generation count for the client
export async function GET(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ current: 0, remaining: 20, resetAt: null });
  }

  const token = getAnonToken(req);
  if (!token) {
    return NextResponse.json({ current: 0, remaining: 20, resetAt: null });
  }

  try {
    const { current, ttl } = await rateLimiter.getCount(makeRateLimitKey(token));
    const resetAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;
    return NextResponse.json({
      current,
      remaining: Math.max(0, RATE_LIMIT.maxRequests - current),
      resetAt,
    });
  } catch {
    return NextResponse.json({ current: 0, remaining: 20, resetAt: null });
  }
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  // Resolve anonymous token — use cookie if present, otherwise generate one
  let token = getAnonToken(req);
  let shouldSetCookie = false;
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, "");
    shouldSetCookie = true;
  }

  const rateLimitKey = makeRateLimitKey(token);
  const rateLimitCheck = await rateLimiter.check(rateLimitKey, RATE_LIMIT);

  if (!rateLimitCheck.allowed) {
    const retryAfter = Math.ceil(
      (rateLimitCheck.resetAt.getTime() - Date.now()) / 1000
    );
    return NextResponse.json(
      {
        error: `Too many requests. Maximum ${RATE_LIMIT.maxRequests} per hour. Please wait ${Math.ceil(retryAfter / 60)} minutes.`,
        retryAfter,
        current: rateLimitCheck.current,
        remaining: 0,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // ── Mock mode (MOCK_AI_GENERATION=true) — skip Gemini, return placeholder PNG ──
  if (process.env.MOCK_AI_GENERATION === "true") {
    await new Promise((r) => setTimeout(r, 600)); // simulate latency
    const genType = body.prompt ? (
      body.prompt.includes("watercolor") ? "watercolor"
      : body.prompt.includes("cartoon") ? "cartoon"
      : "pencil"
    ) : "bw";
    const [r, g, b] = MOCK_COLORS[genType] ?? MOCK_COLORS.bw;
    const base64Data = makePlaceholderPng(r, g, b);
    return NextResponse.json({
      success: true,
      imageCount: 1,
      images: [{ index: 0, mimeType: "image/png", fileExtension: "png", base64Data }],
      texts: [],
      current: rateLimitCheck.current,
      remaining: rateLimitCheck.remaining,
    });
  }

  const imageUrl = body.imageUrl?.trim();
  const imageBase64 = body.imageBase64;
  const promptOverride = body.prompt?.trim();
  const aspectRatio = body.aspectRatio?.trim() || "1:1";

  if (!imageUrl && !imageBase64) {
    return NextResponse.json(
      { error: "Either imageUrl or imageBase64 is required." },
      { status: 400 }
    );
  }

  let base64: string;
  let mimeType: string;

  if (imageBase64) {
    base64 = imageBase64;
    mimeType = body.imageMimeType || "image/jpeg";
  } else {
    let imageResponse: globalThis.Response;
    try {
      imageResponse = await fetch(imageUrl!);
    } catch (error) {
      console.error("Failed to fetch image:", error);
      return NextResponse.json(
        { error: "Unable to download source image." },
        { status: 502 }
      );
    }

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image from provided URL." },
        { status: 502 }
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    mimeType =
      imageResponse.headers.get("content-type") ??
      mime.getType(imageUrl!) ??
      "image/jpeg";
    base64 = buffer.toString("base64");
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { "X-Goog-Quota-User": token },
      },
    });

    const basePrompt =
      promptOverride && promptOverride.length > 0
        ? promptOverride
        : DEFAULT_USER_PROMPT;
    const fullPrompt = `${SYSTEM_INSTRUCTION.trim()}\n\n${basePrompt.trim()}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: {
          aspectRatio: aspectRatio as "1:1" | "9:16" | "2:3",
        },
      },
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: fullPrompt },
          ],
        },
      ],
    });

    const parts =
      response.candidates?.flatMap(
        (candidate: any) => candidate.content?.parts ?? []
      ) ?? [];

    const images: Array<{
      index: number;
      mimeType: string;
      fileExtension: string;
      base64Data: string;
    }> = [];
    const texts: string[] = [];
    let imageIndex = 0;

    for (const part of parts) {
      if ("inlineData" in part && part.inlineData?.data) {
        const partMimeType = part.inlineData.mimeType ?? "image/png";
        const extension = mime.getExtension(partMimeType) ?? "png";
        images.push({
          index: imageIndex++,
          mimeType: partMimeType,
          fileExtension: extension,
          base64Data: part.inlineData.data,
        });
      } else if ("text" in part && typeof part.text === "string") {
        texts.push(part.text);
      }
    }

    const jsonResponse = NextResponse.json({
      success: true,
      imageCount: images.length,
      images,
      texts,
      current: rateLimitCheck.current,
      remaining: rateLimitCheck.remaining,
    });

    // Set the HttpOnly cookie if this was a new token
    if (shouldSetCookie) {
      jsonResponse.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return jsonResponse;
  } catch (error) {
    console.error("Gemini request failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Image generation failed.",
        current: rateLimitCheck.current,
        remaining: rateLimitCheck.remaining,
      },
      { status: 502 }
    );
  }
}
