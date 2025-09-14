// app/api/internal/reset-monthly/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import dayjs from 'dayjs';
import { env } from '@/env.server';

type LimitsRow = {
  user_id: string;
  plan: string;
  monthly_reset_at: string | null;
};

type SubRow = {
  user_id: string;
  status: string | null;
  subscription_ends_at: string | null;
};

const CHUNK = 200;

// 🔐 Только с секретом
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${env.SYNC_SECRET_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerClientForApi();
  const nowMs = dayjs().valueOf();

  let offset = 0;
  let totalUpdated = 0;

  while (true) {
    // 1) Активные, не Freemium — партиями
    const { data: limitsData, error: limitsError } = await supabase
      .from('user_limits')
      .select('user_id, plan, monthly_reset_at')
      .eq('active', true)
      .neq('plan', 'Freemium')
      .order('user_id', { ascending: true })
      .range(offset, offset + CHUNK - 1);

    if (limitsError) {
      return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 });
    }
    if (!limitsData || limitsData.length === 0) break;

    const paidLimits: LimitsRow[] = limitsData;

    // 2) Подтягиваем подписки одной пачкой
    const userIds = paidLimits.map((r) => r.user_id);
    const { data: subs, error: subsError } = await supabase
      .from('user_subscription')
      .select('user_id, status, subscription_ends_at')
      .in('user_id', userIds);

    if (subsError) {
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    const subMap = new Map<string, SubRow>();
    for (const s of subs ?? []) {
      subMap.set(s.user_id, {
        user_id: s.user_id,
        status: s.status ?? null,
        subscription_ends_at: s.subscription_ends_at ?? null,
      });
    }

    type MonthlyUpdate = { user_id: string; used_monthly: number; monthly_reset_at: string };
    const updates: MonthlyUpdate[] = [];

    // 3) Сброс ровно при наступлении subscription_ends_at, один раз за период
    for (const l of paidLimits) {
      const sub = subMap.get(l.user_id);
      if (!sub) continue;

      const endsAtIso = sub.subscription_ends_at;
      if (sub.status !== 'active' || !endsAtIso) continue;

      const endsAtMs = dayjs(endsAtIso).valueOf();
      const due = nowMs >= endsAtMs;

      const alreadyResetForThisPeriod =
        l.monthly_reset_at && dayjs(l.monthly_reset_at).valueOf() >= endsAtMs;

      if (due && !alreadyResetForThisPeriod) {
        updates.push({
          user_id: l.user_id,
          used_monthly: 0,
          monthly_reset_at: endsAtIso, // фиксируем ПРОШЕДШИЙ рубеж
        });
      }
    }

    // 4) Применяем обновления
    for (const u of updates) {
      await supabase
        .from('user_limits')
        .update({
          used_monthly: u.used_monthly,
          monthly_reset_at: u.monthly_reset_at,
        })
        .eq('user_id', u.user_id);
    }

    totalUpdated += updates.length;

    if (paidLimits.length < CHUNK) break;
    offset += CHUNK;
  }

  return NextResponse.json({ success: true, updated: totalUpdated });
}
