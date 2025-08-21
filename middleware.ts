import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const traceId = (globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const url = req.nextUrl;
  const path = url.pathname;

  // ❌ 0) Пропускаем стримы и Stripe
  const isBypassedPath = path.startsWith('/api/ai/') || path.startsWith('/api/stripe/');
  if (isBypassedPath) {
    const passthrough = NextResponse.next();
    passthrough.headers.set('x-trace-id', traceId);
    return passthrough;
  }

  // ✅ 1) Нормальный поток
  const res = NextResponse.next();
  res.headers.set('x-trace-id', traceId);

  const supabase = createMiddlewareClient({ req, res });

  // 💥 Обязательное обновление куков
  const isReturningFromCheckout = req.nextUrl.searchParams.get('checkout') === 'success';

  let {
    data: { session },
  } = await supabase.auth.getSession().catch(() => ({ data: { session: null } as any }));
  console.log('🧩 [middleware] Session ID:', session?.user?.id || 'No session');

  if (!session && isReturningFromCheckout) {
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      ({
        data: { session },
      } = await supabase.auth.getSession().catch(() => ({ data: { session: null } as any })));

      if (session) break;
    }
  }

  // 🔐 Защита приватных путей (например: /workspace)
  const protectedPaths = ['/workspace'];
  const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix));

  if (!session && isProtected) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
