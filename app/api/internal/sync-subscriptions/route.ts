import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { syncSubscriptionWithSupabase } from '@/lib/subscription';

export async function GET() {
  try {
    const supabase = await createServerClientForApi();

    const subscriptions = await stripe.subscriptions.list({ limit: 100 });

    for (const subscription of subscriptions.data) {
      const customerId = subscription.customer as string;

      const { data, error } = await supabase
        .from('user_subscription')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (error || !data?.user_id) {
        console.warn(`⚠️ Не найден user_id для customer=${customerId}`);
        continue;
      }

      await syncSubscriptionWithSupabase(supabase, data.user_id, subscription);
    }

    console.info(`✅ Обработано подписок: ${subscriptions.data.length}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка в sync-subscriptions:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
