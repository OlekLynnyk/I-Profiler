import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
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
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single();

  if (subError || !subRecord?.stripe_subscription_id) {
    console.error('❌ Subscription fetch error:', subError);
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  try {
    await stripe.subscriptions.update(subRecord.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true, message: 'Subscription will be canceled at period end' });
  } catch (err) {
    console.error('❌ Stripe cancel error:', err);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
