// app/api/subscription/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { isValidPackageType } from '@/types/plan';

type SubscriptionDTO = {
  plan: string;
  status: string;
  nextBillingDate: string;
  trialEndDate: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: string;
  packageType: string;
};

type SubscriptionRow = {
  plan: string | null;
  status: string | null;
  package_type: string | null;
  subscription_ends_at: string | null;
  current_period_start: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_customer_id: string | null;
  cancel_at_period_end: boolean | null;
};

// Локальный компактный тип, чтобы безопасно прочитать нужные поля из ответа Stripe
type StripeSubLike = {
  current_period_end?: number | null;
  trial_end?: number | null;
  cancel_at_period_end?: boolean | null;
  default_payment_method?: string | Stripe.PaymentMethod | null;
  default_source?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    // 1) Авторизация
    const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
    }

    const supabase = await createServerClientForApi();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Supabase auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2) Читаем централизованные данные из БД (жёсткая типизация результата)
    const { data: sub, error: subError } = await supabase
      .from('user_subscription')
      .select(
        [
          'plan',
          'package_type',
          'status',
          'subscription_ends_at',
          'current_period_start',
          'stripe_subscription_id',
          'stripe_price_id',
          'stripe_customer_id',
          'cancel_at_period_end',
        ].join(', ')
      )
      .eq('user_id', user.id)
      .maybeSingle<SubscriptionRow>();

    if (subError) {
      console.error('❌ Subscription fetch error:', subError);
      return NextResponse.json({ error: 'Failed to fetch user_subscription' }, { status: 500 });
    }

    // Фоллбек: записи нет — Freemium/inactive
    if (!sub) {
      const dto: SubscriptionDTO = {
        plan: 'Freemium',
        packageType: 'Freemium',
        status: 'inactive',
        nextBillingDate: '',
        trialEndDate: '',
        cancelAtPeriodEnd: false,
        paymentMethod: 'N/A',
      };
      return NextResponse.json(dto);
    }

    // 3) База — источник истины
    const pkgRaw = sub.package_type ?? '';
    const packageType = isValidPackageType(pkgRaw) ? pkgRaw : 'Freemium';
    const planForUi = sub.plan ?? packageType ?? 'Freemium';
    const status = sub.status ?? 'inactive';
    const nextBillingDateFromDb = sub.subscription_ends_at ?? '';

    let nextBillingDate = nextBillingDateFromDb || '';
    let trialEndDate = '';
    let cancelAtPeriodEnd =
      typeof sub.cancel_at_period_end === 'boolean' ? sub.cancel_at_period_end : false;
    let paymentMethod = 'N/A';

    // 4) Обогащение Stripe (опционально, без ломки поведения)
    if (sub.stripe_subscription_id) {
      try {
        const resp = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        // безопасное чтение нужных полей
        const s = resp as unknown as StripeSubLike;

        if (typeof s.current_period_end === 'number') {
          nextBillingDate = new Date(s.current_period_end * 1000).toISOString().split('T')[0];
        }
        if (typeof s.trial_end === 'number' && s.trial_end > 0) {
          trialEndDate = new Date(s.trial_end * 1000).toISOString().split('T')[0];
        }
        cancelAtPeriodEnd = Boolean(s.cancel_at_period_end);

        // Платёжный метод
        const pmId =
          (typeof s.default_payment_method === 'string'
            ? s.default_payment_method
            : (s.default_payment_method as Stripe.PaymentMethod | null)?.id) ||
          (typeof s.default_source === 'string' ? s.default_source : null);

        if (pmId) {
          try {
            const pm = await stripe.paymentMethods.retrieve(pmId);
            if ('card' in pm && pm.card) {
              paymentMethod = `${pm.card.brand} •••• ${pm.card.last4}`;
            }
          } catch (pmErr) {
            console.warn('⚠️ Failed to fetch payment method:', pmErr);
          }
        }
      } catch (stripeErr) {
        // Stripe может быть недоступен — остаёмся на БД-значениях
        console.warn('⚠️ Stripe enrichment failed, using DB values:', stripeErr);
      }
    }

    const dto: SubscriptionDTO = {
      plan: planForUi,
      packageType,
      status,
      nextBillingDate,
      trialEndDate,
      cancelAtPeriodEnd,
      paymentMethod,
    };

    return NextResponse.json(dto);
  } catch (error) {
    console.error('❌ API /api/subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
