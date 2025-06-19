import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // ✅ Пытаемся получить лимиты
  const { data: limits, error: limitsError } = await supabase
    .from('user_limits')
    .select('used_today, daily_limit, limit_reset_at')
    .eq('user_id', userId)
    .maybeSingle();

  // 🛠 Если лимитов нет — инициализируем прямо здесь
  if (!limits || limitsError) {
    const initResult = await supabase.from('user_limits').insert([{
      user_id: userId,
      plan: 'Freemium',
      used_today: 1,
      daily_limit: 10,
      limit_reset_at: new Date().toISOString(),
      active: false,
    }]);

    if (initResult.error) {
      return NextResponse.json({ error: 'Failed to auto-create limits' }, { status: 500 });
    }

    return NextResponse.json({ success: true, initialized: true });
  }

  // ⏳ Проверка на ресет
  const now = new Date();
  const resetAt = limits.limit_reset_at ? new Date(limits.limit_reset_at) : now;
  const shouldReset = now > resetAt;
  const updatedUsage = shouldReset ? 1 : (limits.used_today ?? 0) + 1;

  if (!shouldReset && limits.used_today >= limits.daily_limit) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 403 });
  }

  const nextReset = new Date();
  nextReset.setUTCHours(0, 0, 0, 0);
  nextReset.setUTCDate(now.getUTCDate() + 1);

  const { error: updateError } = await supabase
    .from('user_limits')
    .update({
      used_today: updatedUsage,
      limit_reset_at: shouldReset ? nextReset.toISOString() : limits.limit_reset_at,
      updated_at: now.toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
