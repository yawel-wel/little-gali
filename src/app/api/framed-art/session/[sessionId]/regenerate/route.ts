import { NextRequest, NextResponse } from "next/server";
import { requireFramedArtSession } from "@/lib/framed-art/auth";
import { runFramedArtRegenerate } from "@/lib/framed-art/generation-runner";
import { toPublicView } from "@/lib/framed-art/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requireFramedArtSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  if (auth.session.regenerateUsed) {
    return NextResponse.json(
      { error: "Regenerate already used for this image" },
      { status: 409 },
    );
  }

  if (auth.session.inFlight) {
    return NextResponse.json(
      { error: "Generation in progress" },
      { status: 409 },
    );
  }

  const updated = await runFramedArtRegenerate(sessionId);
  if (!updated) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session: toPublicView(updated) });
}
