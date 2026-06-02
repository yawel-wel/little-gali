import { NextRequest, NextResponse } from "next/server";
import { requireFramedArtSession } from "@/lib/framed-art/auth";
import { toPublicView } from "@/lib/framed-art/store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requireFramedArtSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({ session: toPublicView(auth.session) });
}
