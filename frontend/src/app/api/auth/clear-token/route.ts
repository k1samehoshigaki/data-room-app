import { NextResponse } from 'next/server';

export async function POST() {
  const isProduction = process.env.NODE_ENV === 'production';
  const res = NextResponse.json({ ok: true });

  res.cookies.set('access_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  return res;
}