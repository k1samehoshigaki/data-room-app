import { NextRequest, NextResponse } from "next/server";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(req: NextRequest) {
  const { token } = (await req.json()) as { token: string };
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
