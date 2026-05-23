import { NextRequest, NextResponse } from "next/server";
import { requirePreviewSession } from "@/lib/preview-session/auth";
import { savePreviewSession, toPublicView } from "@/lib/preview-session/store";
import type { StyleType } from "@/components/style-selector";

export const runtime = "nodejs";

const STYLES: StyleType[] = ["cartoon", "pencil", "watercolor"];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requirePreviewSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json()) as { style?: StyleType };
  if (!body.style || !STYLES.includes(body.style)) {
    return NextResponse.json({ error: "Invalid style" }, { status: 400 });
  }

  const session = auth.session;
  if (session.phase !== "bw_approved" && session.phase !== "style_selected") {
    return NextResponse.json({ error: "Approve B&W before choosing style" }, { status: 409 });
  }

  session.selectedColorStyle = body.style;
  session.phase = "style_selected";
  await savePreviewSession(session);
  return NextResponse.json({ session: toPublicView(session) });
}
