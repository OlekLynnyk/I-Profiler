import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { updateUserLimits } from '@/lib/updateUserLimits';
import { isValidPackageType } from '@/types/plan';

export async function GET() {
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

    const isInactive = !['active', 'trialing'].includes(subscription.status);

    if (isInactive) {
      console.log(`🔁 Подписка неактивна. Переводим user_id=${data.user_id} на Freemium`);

      await supabase
        .from('user_subscription')
        .update({
          status: 'canceled',
          package_type: 'Freemium',
          plan: 'Freemium',
          stripe_subscription_id: null,
          stripe_price_id: 'freemium',
          subscription_ends_at: null,
        })
        .eq('user_id', data.user_id);

      await updateUserLimits(supabase, 'Freemium');
    }
  }

  return NextResponse.json({ success: true });
}
