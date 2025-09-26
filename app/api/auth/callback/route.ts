// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OAUTH_STATE_COOKIE = 'oauth_state';
const RETURN_TO_COOKIE = 'return_to';
const SUCCESS_REDIRECT = '/auth/callback';

function finalize(res: NextResponse) {
  res.headers.set('Cache-Control', 'no-store');
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(RETURN_TO_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jar = await cookies(); // ⬅️ ключевая правка: await

  const next = url.searchParams.get('next') || jar.get(RETURN_TO_COOKIE)?.value || SUCCESS_REDIRECT;

  const code = url.searchParams.get('code'); // PKCE
  const token = url.searchParams.get('token') ?? url.searchParams.get('token_hash'); // email link
  const verifyType = url.searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'magiclink'
    | 'invite'
    | 'email_change'
    | null;

  if (!code && (!token || !verifyType)) {
    return finalize(
      NextResponse.redirect(new URL('/auth/callback?error=missing_code_or_token', url), 303)
    );
  }

  if (code) {
    const state = url.searchParams.get('state') ?? '';
    const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
    if (expectedState && expectedState !== state) {
      return finalize(
        NextResponse.redirect(new URL('/auth/callback?error=invalid_state', url), 303)
      );
    }
  }

  // соблюдаем твою архитектуру: auth-helpers + cookies: async () => jar
  const supabase = createRouteHandlerClient({ cookies: async () => jar });

  let error: { message: string } | null = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    const { error: vErr } = await supabase.auth.verifyOtp({
      token_hash: token!,
      type: verifyType!,
    });
    error = vErr ?? null;
  }

  const dest = error ? `/auth/callback?error=${encodeURIComponent(error.message)}` : next;

  return finalize(NextResponse.redirect(new URL(dest, url), 303));
}

// Почтовые клиенты часто делают HEAD-prefetch — отвечаем редиректом без потребления токена
export async function HEAD(req: NextRequest) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(url, 303);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
