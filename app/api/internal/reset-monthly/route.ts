import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import dayjs from 'dayjs';
import { env } from '@/env.server';

// Вытаскиваем period_end (в секундах) из payload Stripe invoice.payment_succeeded
function extractPeriodEndSeconds(payload: any): number | null {
  // Стандартное место у invoice
  const p1 = payload?.data?.object?.period_end;
  if (typeof p1 === 'number') return p1;

  // Часто period_end лежит в первой линии подписки
  const p2 = payload?.data?.object?.lines?.data?.[0]?.period?.end;
  if (typeof p2 === 'number') return p2;

  // Иногда в объекте подписки
  const p3 = payload?.data?.object?.subscription?.current_period_end;
  if (typeof p3 === 'number') return p3;

  return null;
}

// 🔐 Безопасность: только если секрет верен
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${env.SYNC_SECRET_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerClientForApi();

  // 📥 Берём лимиты (все пользователи)
  const { data: limitsData, error: limitsError } = await supabase
    .from('user_limits')
    .select('user_id, plan, monthly_reset_at');

  if (limitsError || !limitsData) {
    return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 });
  }

  type MonthlyUpdate = { user_id: string; monthly_reset_at: string; used_monthly: number };
  const updates: MonthlyUpdate[] = [];

  for (const user of limitsData) {
    const { user_id, plan, monthly_reset_at } = user;

    // 1) Freemium: по политике — никогда не сбрасываем
    if (plan === 'Freemium') continue;

    // 2) Платные: сбрасываем ТОЛЬКО при подтверждённой оплате по invoice.payment_succeeded
    const { data: log, error: logErr } = await supabase
      .from('billing_logs')
      .select('created_at, payload')
      .eq('user_id', user_id)
      .eq('event_type', 'invoice.payment_succeeded')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logErr || !log) {
      // Нет подтверждённой оплаты — ничего не делаем
      continue;
    }

    const periodEndSec = extractPeriodEndSeconds(log.payload);
    if (!periodEndSec) {
      // Не смогли распарсить период — перестрахуемся: не сбрасываем
      continue;
    }

    const paidPeriodEndIso = dayjs.unix(periodEndSec).toISOString();

    // Сбрасываем только если это НОВЫЙ оплаченный период
    const hasResetPoint = !!monthly_reset_at;
    const isNewPaidPeriod =
      !hasResetPoint || dayjs(paidPeriodEndIso).isAfter(dayjs(monthly_reset_at!));

    if (isNewPaidPeriod) {
      updates.push({
        user_id,
        used_monthly: 0,
        monthly_reset_at: paidPeriodEndIso,
      });
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
