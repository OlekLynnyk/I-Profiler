import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import dayjs from 'dayjs';

// 🔐 Безопасность: только если секрет верен
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${process.env.SYNC_SECRET_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerClientForApi();
  const now = dayjs();

  // 📥 Получаем лимиты
  const { data: limitsData, error: limitsError } = await supabase
    .from('user_limits')
    .select('user_id, plan, monthly_reset_at');

  if (limitsError || !limitsData) {
    return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 });
  }

  // 📥 Получаем подписки
  const { data: subsData, error: subsError } = await supabase
    .from('user_subscription')
    .select('user_id, subscription_ends_at');

  if (subsError || !subsData) {
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }

  // 🧠 Готовим обновления
  const updates = [];

  for (const user of limitsData) {
    if (!user.monthly_reset_at) continue;

    const resetAt = dayjs(user.monthly_reset_at);
    const isFreemium = user.plan === 'Freemium';
    const sub = subsData.find((s) => s.user_id === user.user_id);

    if (isFreemium && now.diff(resetAt, 'day') >= 28) {
      updates.push({
        user_id: user.user_id,
        used_monthly: 0,
        monthly_reset_at: now.toISOString(),
      });
    }

    if (!isFreemium && sub) {
      const subEnd = dayjs(sub.subscription_ends_at ?? '');
      if (subEnd.isValid() && subEnd.isAfter(resetAt)) {
        updates.push({
          user_id: user.user_id,
          used_monthly: 0,
          monthly_reset_at: subEnd.toISOString(),
        });
      }
    }
  }

  // 💾 Пишем обновления
  for (const u of updates) {
    await supabase
      .from('user_limits')
      .update({
        used_monthly: u.used_monthly,
        monthly_reset_at: u.monthly_reset_at,
      })
      .eq('user_id', u.user_id);
  }

  return NextResponse.json({ success: true, updated: updates.length });
}
