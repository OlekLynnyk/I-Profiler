import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Критический шаг: этот вызов не только читает сессию,
  // но и обновляет/устанавливает httpOnly куки после редиректа.
  await supabase.auth.getSession();

  return res; // обязательно вернуть тот же res, чтобы куки попали в ответ
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
