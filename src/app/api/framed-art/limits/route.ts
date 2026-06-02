import { NextRequest, NextResponse } from "next/server";
import { assertFramedArtEnabled } from "@/lib/framed-art/auth";
import { peekFramedUploadLimit } from "@/lib/framed-art/upload-limits";
import { getRequestIp, hashClientIp } from "@/lib/preview-session/hash";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const disabled = assertFramedArtEnabled();
  if (disabled) return disabled;

  const ipHash = hashClientIp(getRequestIp(request));
  const { remaining, limit } = await peekFramedUploadLimit(ipHash);

  return NextResponse.json({ remaining, limit });
}
