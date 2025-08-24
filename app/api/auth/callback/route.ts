import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'nodejs'; // не edge
export const dynamic = 'force-dynamic'; // без кэша

const OAUTH_STATE_COOKIE = 'oauth_state';
const RETURN_TO_COOKIE = 'return_to';
const SUCCESS_REDIRECT = '/auth/callback';

export async function GET(req: NextRequest) {
  // ✅ КЛЮЧЕВОЙ ФИКС: используем базовый абсолютный URL
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const url = new URL(req.url, base);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/callback?error=missing_code', url), 303);
  }

  const jar = await cookies();
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;

  if (expectedState && expectedState !== state) {
    const res = NextResponse.redirect(new URL('/auth/callback?error=invalid_state', url), 303);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.delete(RETURN_TO_COOKIE);
    return res;
  }

  const supabase = createRouteHandlerClient({ cookies: async () => jar });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  const res = NextResponse.redirect(
    error
      ? new URL(`/auth/callback?error=${encodeURIComponent(error.message)}`, url)
      : new URL(SUCCESS_REDIRECT, url),
    303
  );

  res.headers.set('Cache-Control', 'no-store');
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(RETURN_TO_COOKIE);

  return res;
}
