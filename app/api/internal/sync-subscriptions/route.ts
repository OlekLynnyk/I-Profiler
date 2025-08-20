// app/api/internal/sync-subscriptions/route.ts

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { syncSubscriptionWithSupabase } from '@/lib/subscription';

export async function GET() {
  const supabase = await createServerClientForApi();

  // При необходимости расширить пагинацию (starting_after) — пока берём 100
  const subscriptions = await stripe.subscriptions.list({ limit: 100 });

  for (const subscription of subscriptions.data) {
    const customerId = subscription.customer as string;

    // Находим нашего пользователя по stripe_customer_id
    const { data, error } = await supabase
      .from('user_subscription')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (error || !data?.user_id) {
      console.warn(`⚠️ Не найден user_id для customer=${customerId}`);
      continue;
    }

    // Синхронизуем единым сервисом (он сам решит: активный план или Freemium)
    await syncSubscriptionWithSupabase(supabase, data.user_id, subscription);
  }

  return NextResponse.json({ success: true });
}
