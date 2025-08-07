import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
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

    const { data: subRecord, error: subError } = await supabase
      .from('user_subscription')
      .select('stripe_subscription_id, stripe_customer_id, package_type')
      .eq('user_id', user.id)
      .single();

    if (subError) {
      console.error('❌ Subscription fetch error:', subError);
      return NextResponse.json({ error: 'Failed to fetch user_subscription' }, { status: 500 });
    }

    // ✅ Fallback: freemium user (no subscription yet)
    if (!subRecord?.stripe_subscription_id) {
      return NextResponse.json({
        plan: 'Free',
        status: 'active',
        nextBillingDate: '',
        trialEndDate: '',
        cancelAtPeriodEnd: false,
        paymentMethod: 'N/A',
        packageType: subRecord?.package_type ?? 'Freemium',
      });
    }

    // ✅ Premium user with subscription
    const subscription = (await stripe.subscriptions.retrieve(
      subRecord.stripe_subscription_id
    )) as Stripe.Subscription;

    const plan = subscription.items.data[0]?.price.nickname || 'Unknown';
    const status = subscription.status;

    const nextBillingDate =
      'current_period_end' in subscription && typeof subscription.current_period_end === 'number'
        ? new Date(subscription.current_period_end * 1000).toISOString().split('T')[0]
        : '';

    const trialEndDate =
      'trial_end' in subscription && typeof subscription.trial_end === 'number'
        ? new Date(subscription.trial_end * 1000).toISOString().split('T')[0]
        : '';

    const cancelAtPeriodEnd = !!subscription.cancel_at_period_end;

    const paymentMethodId = (subscription.default_payment_method ||
      subscription.default_source) as string;
    let paymentMethod = 'N/A';

    if (paymentMethodId) {
      try {
        const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
        if ('card' in pm && pm.card) {
          paymentMethod = `${pm.card.brand} •••• ${pm.card.last4}`;
        }
      } catch (err) {
        console.warn('⚠️ Failed to fetch payment method:', err);
      }
    }

    return NextResponse.json({
      plan,
      status,
      nextBillingDate,
      trialEndDate,
      cancelAtPeriodEnd,
      paymentMethod,
      packageType: subRecord?.package_type ?? 'Freemium',
    });
  } catch (error) {
    console.error('❌ API /api/subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
