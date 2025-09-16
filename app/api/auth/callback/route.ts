import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'nodejs'; // не edge
export const dynamic = 'force-dynamic'; // без кэша

const OAUTH_STATE_COOKIE = 'oauth_state';
const RETURN_TO_COOKIE = 'return_to';
const SUCCESS_REDIRECT = '/auth/callback'; // оставляю как в текущей архитектуре

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';
  const url = new URL(req.url, base);

  // Поддерживаем оба сценария
  const code = url.searchParams.get('code'); // PKCE
  const token = url.searchParams.get('token'); // email verify/magic link
  const verifyType = url.searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'magiclink'
    | 'invite'
    | 'email_change'
    | null;

  // ВАЖНО: у тебя cookies() -> Promise, значит ждём
  const jar = await cookies();

  // Куда возвращать пользователя (приоритет: query next -> cookie -> fallback)
  const next = url.searchParams.get('next') || jar.get(RETURN_TO_COOKIE)?.value || SUCCESS_REDIRECT;

  // Проверка state — только для PKCE-кейса
  if (code) {
    const state = url.searchParams.get('state') ?? '';
    const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
    if (expectedState && expectedState !== state) {
      const res = NextResponse.redirect(new URL('/auth/callback?error=invalid_state', url), 303);
      res.cookies.delete(OAUTH_STATE_COOKIE);
      res.cookies.delete(RETURN_TO_COOKIE);
      return res;
    }
  } else if (!token || !verifyType) {
    // Ни code, ни token — нечего обменивать
    return NextResponse.redirect(new URL('/auth/callback?error=missing_code_or_token', url), 303);
  }

  // Оставляю твой паттерн с jar (минимум изменений)
  const supabase = createRouteHandlerClient({ cookies: async () => jar });

  let error: { message: string } | null = null;

  if (code) {
    // PKCE: обмен кода на сессию
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    // Email verify / magic link: подтверждение токена
    const { error: vErr } = await supabase.auth.verifyOtp({
      token_hash: token!,
      type: verifyType!,
    });
    error = vErr ?? null;
  }

  const res = NextResponse.redirect(
    error
      ? new URL(`/auth/callback?error=${encodeURIComponent(error.message)}`, url)
      : new URL(next, url),
    303
  );

  res.headers.set('Cache-Control', 'no-store');
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(RETURN_TO_COOKIE);

  return res;
}
