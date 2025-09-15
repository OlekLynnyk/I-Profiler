// app/api/internal/reset-monthly/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import dayjs from 'dayjs';
import { env } from '@/env.server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

type LimitsRow = {
  user_id: string;
  plan: string;
  monthly_reset_at: string | null;
};

type SubRow = {
  user_id: string;
  status: string | null;
  current_period_start: string | null; // ← сверяемся с началом оплаченного периода (кэш из БД)
  stripe_subscription_id: string | null; // ← нужен, чтобы проверить оплату в Stripe
};

// Локальный тип, чтобы не ругались типы Stripe у Invoice
type InvoiceWithPI = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
};

const CHUNK = 200;

// Проверяем, что расчёт/оплата по подписке реально завершены (как в вебхуке)
async function isPaymentSettledForSubId(subId: string): Promise<boolean> {
  try {
    const fresh = await stripe.subscriptions.retrieve(subId, {
      expand: ['latest_invoice.payment_intent'],
    });

    const li = fresh.latest_invoice as string | Stripe.Invoice | null | undefined;
    if (!li) return false;

    let invoice: InvoiceWithPI;

    if (typeof li === 'string') {
      // latest_invoice — это id, добираем инвойс и расширяем payment_intent
      invoice = (await stripe.invoices.retrieve(li, {
        expand: ['payment_intent'],
      })) as InvoiceWithPI;
    } else {
      // latest_invoice уже объект; мог быть расширен expand'ом выше
      invoice = li as InvoiceWithPI;
    }

    const total = (invoice.total ?? invoice.amount_due ?? 0) || 0;
    if (invoice.status === 'paid' || total <= 0) return true;

    const piRef = invoice.payment_intent as string | Stripe.PaymentIntent | null | undefined;
    if (!piRef) return false;

    const pi =
      typeof piRef === 'string'
        ? await stripe.paymentIntents.retrieve(piRef)
        : (piRef as Stripe.PaymentIntent);

    return pi.status === 'succeeded';
  } catch (e) {
    // Не мешаем Stripe: при ошибке считаем, что не settled, и просто пропускаем
    console.warn('⚠️ isPaymentSettledForSubId: failed to verify', subId, e);
    return false;
  }
}

// 🔐 Только с секретом
export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (secret !== `Bearer ${env.SYNC_SECRET_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerClientForApi();

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

    // 2) Подтягиваем подписки одной пачкой (включая stripe_subscription_id)
    const userIds = paidLimits.map((r) => r.user_id);
    const { data: subs, error: subsError } = await supabase
      .from('user_subscription')
      .select('user_id, status, current_period_start, stripe_subscription_id')
      .in('user_id', userIds);

    if (subsError) {
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    const subMap = new Map<string, SubRow>();
    for (const s of subs ?? []) {
      subMap.set(s.user_id, {
        user_id: s.user_id,
        status: s.status ?? null,
        current_period_start: s.current_period_start ?? null,
        stripe_subscription_id: (s as any).stripe_subscription_id ?? null,
      });
    }

    type MonthlyUpdate = { user_id: string; used_monthly: number; monthly_reset_at: string };
    const updates: MonthlyUpdate[] = [];

    // 3) Fallback-аудит: если monthly_reset_at < current_period_start — сбрасываем,
    // НО только после подтверждения оплаты в Stripe (settled)
    for (const l of paidLimits) {
      const sub = subMap.get(l.user_id);
      if (!sub) continue;

      const startIso = sub.current_period_start;
      if (sub.status !== 'active' || !startIso) continue;

      const startMs = dayjs(startIso).valueOf();
      const alreadyResetForThisPeriod =
        !!l.monthly_reset_at && dayjs(l.monthly_reset_at).valueOf() >= startMs;
      if (alreadyResetForThisPeriod) continue;

      const subId = sub.stripe_subscription_id;
      if (!subId) {
        // Нет связи со Stripe — пропускаем, чтобы не мешать Stripe
        continue;
      }

      const settled = await isPaymentSettledForSubId(subId);
      if (!settled) continue;

      updates.push({
        user_id: l.user_id,
        used_monthly: 0,
        monthly_reset_at: startIso, // фиксируем начало текущего периода (как и раньше)
      });
    }

    // 4) Применяем обновления
    for (const u of updates) {
      const { error: updErr } = await supabase
        .from('user_limits')
        .update({
          used_monthly: u.used_monthly,
          monthly_reset_at: u.monthly_reset_at,
        })
        .eq('user_id', u.user_id);

      if (updErr) {
        console.warn('⚠️ reset-monthly update failed for', u.user_id, updErr);
      } else {
        totalUpdated += 1;
      }
    }

    if (paidLimits.length < CHUNK) break;
    offset += CHUNK;
  }

  return NextResponse.json({ success: true, updated: totalUpdated });
}
