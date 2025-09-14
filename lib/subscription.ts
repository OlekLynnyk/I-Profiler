// lib/subscription.ts

import { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import {
  PackageType,
  isValidPackageType,
  PRICE_TO_PACKAGE,
  SubscriptionPlanPayload,
  mapStripeStatus,
  ValidPackageType,
} from '@/types/plan';
import { Database } from '@/types/supabase';
import { updateUserLimits } from '@/lib/updateUserLimits';
import { stripe } from '@/lib/stripe';

export async function hasActiveSubscription(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const { data, error } = await supabase
    .from('user_subscription')
    .select('status, subscription_ends_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return false;
  return (
    data.status === 'active' &&
    !!data.subscription_ends_at &&
    new Date(data.subscription_ends_at) > new Date()
  );
}

export async function getPackageFromServer(supabase: SupabaseClient): Promise<PackageType> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return 'Freemium';

  const { data, error } = await supabase
    .from('user_subscription')
    .select('package_type')
    .eq('user_id', user.id)
    .single();

  if (error || !data || !isValidPackageType(data.package_type)) {
    return 'Freemium';
  }
  return data.package_type;
}

type SubscriptionWithPeriods = {
  current_period_start?: number | null;
  current_period_end?: number | null;
  current_period?: { start?: number | null; end?: number | null } | null;
};

function toIsoFromStripeTs(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'number') return new Date(v * 1000).toISOString();
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n) && n > 1_000_000_000) return new Date(n * 1000).toISOString();
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

export function mapStripeToPlan(subscription: Stripe.Subscription): SubscriptionPlanPayload | null {
  const items = subscription.items?.data ?? [];
  const matchedItem = items.find((it) => {
    const pid = it?.price?.id;
    return typeof pid === 'string' && !!PRICE_TO_PACKAGE[pid];
  });

  const priceId = matchedItem?.price?.id ?? null;
  const plan = priceId ? PRICE_TO_PACKAGE[priceId] : undefined;
  if (!priceId || !plan || !isValidPackageType(plan)) {
    return null;
  }

  const s = subscription as unknown as SubscriptionWithPeriods & {
    current_period?: { start?: any; end?: any } | null;
  };

  const periodStart = toIsoFromStripeTs(s.current_period_start ?? s.current_period?.start ?? null);
  const periodEnd = toIsoFromStripeTs(s.current_period_end ?? s.current_period?.end ?? null);

  return {
    plan,
    priceId,
    periodStart,
    periodEnd,
    status: mapStripeStatus(subscription.status),
  };
}

export async function syncSubscriptionWithSupabase(
  supabase: SupabaseClient<Database>,
  userId: string,
  subscription: Stripe.Subscription
): Promise<{ plan: ValidPackageType; status: 'active' | 'incomplete' | 'canceled' }> {
  const mapped = mapStripeToPlan(subscription);
  const now = new Date().toISOString();

  if (!mapped) {
    return { plan: 'Freemium', status: 'incomplete' };
  }

  if (mapped.status === 'canceled') {
    const { error } = await supabase
      .from('user_subscription')
      .update({
        status: 'canceled',
        package_type: 'Freemium',
        plan: 'Freemium',
        stripe_price_id: 'freemium',
        active: false,
        subscription_ends_at: null,
        updated_at: now,
      })
      .eq('user_id', userId);
    if (error) throw error;

    await updateUserLimits(supabase, 'Freemium', userId);
    return { plan: 'Freemium', status: 'canceled' };
  }

  if (mapped.status !== 'active') {
    await supabase
      .from('user_subscription')
      .update({ status: 'incomplete', updated_at: now })
      .eq('user_id', userId);
    return { plan: mapped.plan, status: 'incomplete' };
  }

  // ======================= [REPLACEMENT #1 START] =======================
  // Old block (try { ... } catch { ... }) replaced with the enhanced resolver
  let resolvedPeriodStart = mapped.periodStart;
  let resolvedPeriodEnd = mapped.periodEnd;

  try {
    const li = subscription.latest_invoice;

    if (!li) {
      return { plan: mapped.plan, status: 'incomplete' };
    }

    const invoice = typeof li === 'string' ? await stripe.invoices.retrieve(li) : (li as any);

    // Try to resolve period from the first invoice line if missing on subscription
    const line0 = (invoice?.lines?.data?.[0] as any) ?? null;
    if (!resolvedPeriodStart && line0?.period?.start != null) {
      resolvedPeriodStart = toIsoFromStripeTs(line0.period.start);
    }
    if (!resolvedPeriodEnd && line0?.period?.end != null) {
      resolvedPeriodEnd = toIsoFromStripeTs(line0.period.end);
    }

    const total = (invoice.total ?? invoice.amount_due ?? 0) || 0;
    const isZeroOrCredit = total <= 0;
    const isPaid = invoice.status === 'paid';

    if (!isPaid && !isZeroOrCredit) {
      const piRef = invoice.payment_intent as string | Stripe.PaymentIntent | null | undefined;
      if (piRef) {
        const pi =
          typeof piRef === 'string'
            ? await stripe.paymentIntents.retrieve(piRef)
            : (piRef as Stripe.PaymentIntent);

        if (pi.status !== 'succeeded') {
          return { plan: mapped.plan, status: 'incomplete' };
        }
      } else {
        return { plan: mapped.plan, status: 'incomplete' };
      }
    }
  } catch {
    return { plan: mapped.plan, status: 'incomplete' };
  }
  // ======================= [REPLACEMENT #1 END] =========================

  const { data: existing, error: readErr } = await supabase
    .from('user_subscription')
    .select('stripe_price_id, plan')
    .eq('user_id', userId)
    .maybeSingle();
  if (readErr) throw readErr;

  const planChanged =
    (existing?.stripe_price_id || null) !== mapped.priceId ||
    (existing?.plan || null) !== mapped.plan;

  const baseFields = {
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: mapped.priceId,
    status: mapped.status,
    // ======================= [REPLACEMENT #2 START] =======================
    subscription_ends_at: resolvedPeriodEnd ?? null,
    current_period_start: resolvedPeriodStart ?? null,
    // ======================= [REPLACEMENT #2 END] =========================
    cancel_at_period_end:
      typeof subscription.cancel_at_period_end === 'boolean'
        ? subscription.cancel_at_period_end
        : null,
    plan: mapped.plan,
    package_type: mapped.plan,
    active: true,
    updated_at: now,
  };

  if (!existing) {
    const { error: insertErr } = await supabase.from('user_subscription').insert({
      user_id: userId,
      created_at: now,
      ...baseFields,
    } as any);
    if (insertErr) throw insertErr;
  } else {
    const { error: updateErr } = await supabase
      .from('user_subscription')
      .update(baseFields as any)
      .eq('user_id', userId);
    if (updateErr) throw updateErr;
  }

  if (planChanged) {
    await updateUserLimits(supabase, mapped.plan, userId);
  }

  return { plan: mapped.plan, status: mapped.status };
}
