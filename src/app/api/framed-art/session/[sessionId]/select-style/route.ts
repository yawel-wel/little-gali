import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { requireFramedArtSession } from "@/lib/framed-art/auth";
import { saveFramedArtSession, toPublicView } from "@/lib/framed-art/store";

export const runtime = "nodejs";

const STYLES: StyleType[] = ["cartoon", "pencil", "watercolor"];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requireFramedArtSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as { style?: StyleType };
  const style = body.style;
  if (!style || !STYLES.includes(style)) {
    return NextResponse.json({ error: "Invalid style" }, { status: 400 });
  }

  auth.session.selectedStyle = style;
  await saveFramedArtSession(auth.session);

  return NextResponse.json({ session: toPublicView(auth.session) });
}
