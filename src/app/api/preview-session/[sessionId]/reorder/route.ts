import { NextRequest, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { isValidDisplayOrder } from "@/lib/preview-session/display-order";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as {
    displayOrder?: number[];
  };

  if (!isValidDisplayOrder(body.displayOrder)) {
    return NextResponse.json({ error: "Invalid display order" }, { status: 400 });
  }

  const session = auth.session;
  if (session.phase !== "bw_review") {
    return NextResponse.json(
      { error: "Page order can only be changed during B&W review" },
      { status: 409 },
    );
  }

  session.displayOrder = body.displayOrder;
  await savePreviewSession(session);

  return NextResponse.json({ session: toPublicView(session) });
}
