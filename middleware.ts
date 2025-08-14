import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const isReturningFromCheckout = req.nextUrl.searchParams.get('checkout') === 'success';
  let {
    data: { session },
  } = await supabase.auth.getSession();

  // ⏳ Если Stripe вернул, но session ещё не установлена — ждём ДО 5 сек
  if (!session && isReturningFromCheckout) {
    console.warn('[middleware] Stripe return: session not ready yet — delaying');
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      ({
        data: { session },
      } = await supabase.auth.getSession());

      if (session) {
        console.info('[middleware] Session available after retry');
        break;
      }
    }
  }

  // ❌ Если сессия всё ещё отсутствует — НЕ редиректим, просто продолжаем
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
