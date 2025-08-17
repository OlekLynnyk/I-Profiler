import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { DateTime } from 'luxon';

type UserLimit = {
  user_id: string;
  used_today: number;
  used_monthly: number | null;
  monthly_limit: number | null;
  daily_limit: number;
  limit_reset_at: string | null;
  timezone?: string | null;
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.SYNC_SECRET_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerClientForApi();

  const { data, error } = await supabase
    .from('user_limits')
    .select(
      'user_id, used_today, used_monthly, monthly_limit, daily_limit, limit_reset_at, timezone'
    )
    .eq('active', true);

  if (error || !data || !Array.isArray(data)) {
    return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 });
  }

  const users: UserLimit[] = data;
  const nowUtc = DateTime.utc();

  const updates: { user_id: string; used_today: number; limit_reset_at: string }[] = [];

  for (const user of users) {
    const { user_id, used_today, used_monthly, monthly_limit, limit_reset_at, timezone } = user;

    const usedMonthly = used_monthly ?? 0;
    const monthlyLimit = monthly_limit ?? 0;
    const userTz = timezone || 'UTC';

    const nowLocal = nowUtc.setZone(userTz);
    const lastResetLocal = limit_reset_at
      ? DateTime.fromISO(limit_reset_at, { zone: userTz })
      : DateTime.fromMillis(0); // fallback: давно не сбрасывалось

    const isNewDay = nowLocal.startOf('day') > lastResetLocal.startOf('day');
    const isAfterMidnight = nowLocal.hour === 0 && nowLocal.minute >= 1;
    const hasMonthlyLimitLeft = usedMonthly < monthlyLimit;

    if (isNewDay && isAfterMidnight && hasMonthlyLimitLeft) {
      updates.push({
        user_id,
        used_today: 0,
        limit_reset_at: nowUtc.toISO(),
      });
    }
  }

  for (const u of updates) {
    await supabase
      .from('user_limits')
      .update({
        used_today: u.used_today,
        limit_reset_at: u.limit_reset_at,
      })
      .eq('user_id', u.user_id);
  }

  return NextResponse.json({ success: true, updated: updates.length });
}
