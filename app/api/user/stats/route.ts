// app/api/user/stats/route.ts
import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Пока возвращаем фиктивные данные
  return NextResponse.json({
    requestsToday: 0,
    requestsThisWeek: 0,
    planLimit: 10,
  });
}
