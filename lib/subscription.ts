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

  return data.status === 'active' && new Date(data.subscription_ends_at) > new Date();
}

/**
 * Получает пакет подписки пользователя.
 * Работает в любом окружении, требует SupabaseClient.
 */
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
    return 'Freemium'; // fallback
  }

  return data.package_type;
}

export function mapStripeToPlan(subscription: Stripe.Subscription): SubscriptionPlanPayload | null {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id;

  const s = subscription as unknown as {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };

  const periodStart = s.current_period_start ?? null;
  const periodEnd = s.current_period_end ?? null;

  const plan = priceId ? PRICE_TO_PACKAGE[priceId] : undefined;

  if (!priceId || !plan || !isValidPackageType(plan) || !periodStart || !periodEnd) {
    return null;
  }

  return {
    plan,
    priceId,
    periodStart: new Date(periodStart * 1000).toISOString(),
    periodEnd: new Date(periodEnd * 1000).toISOString(),
    status: mapStripeStatus(subscription.status),
  };
}

export async function syncSubscriptionWithSupabase(
  supabase: SupabaseClient<Database>,
  userId: string,
  subscription: Stripe.Subscription
): Promise<{ plan: ValidPackageType; status: 'active' | 'incomplete' | 'canceled' }> {
  const mapped = mapStripeToPlan(subscription);

  // единая "метка времени" для created_at/updated_at
  const now = new Date().toISOString();

  if (!mapped || mapped.status !== 'active') {
    // Безопасный фоллбек — фиксируем Freemium и лимиты
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

  const { error } = await supabase.from('user_subscription').upsert(
    {
      user_id: userId,
      // ⚠️ created_at обязателен в Insert типе — даём значение для новых строк
      created_at: now,
      updated_at: now,

      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: mapped.priceId,

      status: mapped.status,
      subscription_ends_at: mapped.periodEnd,
      current_period_start: mapped.periodStart,

      plan: mapped.plan,
      package_type: mapped.plan,
      active: true,
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;

  await updateUserLimits(supabase, mapped.plan, userId);
  return { plan: mapped.plan, status: mapped.status };
}
