import { NextRequest, NextResponse } from "next/server";
import type { StyleType } from "@/components/style-selector";
import { requireFramedArtSession } from "@/lib/framed-art/auth";
import { FRAMED_ART_STYLES } from "@/lib/framed-art/parse-style-param";
import { saveFramedArtSession, toPublicView } from "@/lib/framed-art/store";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const auth = await requireFramedArtSession(sessionId);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => ({}))) as { style?: StyleType };
  const style = body.style;
  if (!style || !FRAMED_ART_STYLES.includes(style)) {
    return NextResponse.json({ error: "Invalid style" }, { status: 400 });
  }

  auth.session.selectedStyle = style;
  await saveFramedArtSession(auth.session);

  return NextResponse.json({ session: toPublicView(auth.session) });
}
