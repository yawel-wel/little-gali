import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Lightweight endpoint to warm the serverless runtime early
  return NextResponse.json({ ok: true });
}
