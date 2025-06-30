// app/api/user/log-generation/route.ts
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

  const { data: limits, error: limitsError } = await supabase
    .from('user_limits')
    .select('used_today, daily_limit, limit_reset_at, used_monthly, monthly_limit, monthly_reset_at')
    .eq('user_id', userId)
    .maybeSingle();

  const now = new Date();

  if (!limits || limitsError) {
    const nextMonthlyReset = new Date();
    nextMonthlyReset.setUTCDate(now.getUTCDate() + 28);

    const initResult = await supabase.from('user_limits').insert([{
      user_id: userId,
      plan: 'Freemium',
      used_today: 1,
      used_monthly: 1,
      daily_limit: 10,
      monthly_limit: 100,
      limit_reset_at: now.toISOString(),
      monthly_reset_at: nextMonthlyReset.toISOString(),
      active: false,
    }]);

    if (initResult.error) {
      return NextResponse.json({ error: 'Failed to initialize limits' }, { status: 500 });
    }

    return NextResponse.json({ success: true, initialized: true });
  }

  const shouldResetDaily = now > new Date(limits.limit_reset_at || now);
  const shouldResetMonthly = now > new Date(limits.monthly_reset_at || now);

  const usedToday = shouldResetDaily ? 0 : limits.used_today || 0;
  const usedMonthly = shouldResetMonthly ? 0 : limits.used_monthly || 0;

  if (usedToday >= (limits.daily_limit || 0)) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 403 });
  }

  if (usedMonthly >= (limits.monthly_limit || 0)) {
    return NextResponse.json({ error: 'Monthly limit reached' }, { status: 403 });
  }

  const nextDailyReset = new Date();
  nextDailyReset.setUTCHours(0, 0, 0, 0);
  nextDailyReset.setUTCDate(now.getUTCDate() + 1);

  const nextMonthlyReset = new Date();
  nextMonthlyReset.setUTCDate(now.getUTCDate() + 28);

  const { error: updateError } = await supabase
    .from('user_limits')
    .update({
      used_today: usedToday + 1,
      used_monthly: usedMonthly + 1,
      limit_reset_at: shouldResetDaily ? nextDailyReset.toISOString() : limits.limit_reset_at,
      monthly_reset_at: shouldResetMonthly ? nextMonthlyReset.toISOString() : limits.monthly_reset_at,
      updated_at: now.toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update limits' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
