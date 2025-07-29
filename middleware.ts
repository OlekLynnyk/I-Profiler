import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  // ⬇️ Инициализируем сессию и обновляем куки, если access_token протух
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.warn('❌ Supabase middleware session error:', error.message);
  }

  return res; // ⬅️ важно вернуть именно тот `res`, в который Supabase мог записать Set-Cookie
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
