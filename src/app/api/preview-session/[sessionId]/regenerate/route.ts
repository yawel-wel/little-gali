import { NextRequest, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import {
  readIdempotentResponse,
  writeIdempotentResponse,
} from "@/lib/preview-session/idempotency";
import { runSlotGeneration } from "@/lib/preview-session/generation-runner";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as {
    slotIndex?: number;
    idempotencyKey?: string;
  };
  const slotIndex = body.slotIndex;
  const idempotencyKey = body.idempotencyKey;

  if (
    typeof slotIndex !== "number" ||
    slotIndex < 0 ||
    slotIndex > 4 ||
    !idempotencyKey
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const cached = await readIdempotentResponse(sessionId, idempotencyKey);
  if (cached) {
    return NextResponse.json({ session: cached });
  }

  const session = auth.session;
  if (session.phase !== "bw_review") {
    return NextResponse.json({ error: "Session is not in B&W review" }, { status: 409 });
  }
  if (session.changeCreditsRemaining <= 0) {
    return NextResponse.json({ error: "No change credits remaining" }, { status: 409 });
  }

  const slot = session.slots[slotIndex];
  if (!slot || slot.inFlight) {
    return NextResponse.json({ error: "Slot is busy" }, { status: 409 });
  }

  session.changeCreditsRemaining -= 1;
  slot.pendingIdempotencyKey = idempotencyKey;
  await savePreviewSession(session);

  const updated = await runSlotGeneration(session, slotIndex, slot.originalUrl);
  const view = toPublicView(updated);
  await writeIdempotentResponse(sessionId, idempotencyKey, view);
  return NextResponse.json({ session: view });
}
