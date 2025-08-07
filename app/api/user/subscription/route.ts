// app/api/user/subscription/route.ts
import { NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  const supabase = await createServerClientForApi();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Из Supabase (используем только существующие поля!)
  const { data, error } = await supabase
    .from('user_subscription')
    .select('plan, stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      plan: 'Freemium',
      limit: 1000,
      used: 0,
    });
  }

  // Получаем статус из Stripe
  let stripeStatus: string | null = null;
  if (data.stripe_subscription_id) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(data.stripe_subscription_id);
      stripeStatus = stripeSub.status;
    } catch (err) {
      console.warn('⚠️ Stripe fetch failed:', err);
    }
  }

  return NextResponse.json({
    plan: data.plan ?? 'Freemium',
    limit: 1000,
    used: 0,
    stripeStatus: stripeStatus || null,
  });
}
