import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const COOKIE_NAME = "lg_anon";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function GET() {
  const cookieStore = await cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;
  const isNew = !token;

  if (!token) {
    token = crypto.randomUUID().replace(/-/g, "");
  }

  const response = NextResponse.json({ token });

  if (isNew) {
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}
