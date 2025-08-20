import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/env.server';

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
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (subError || !subRecord?.stripe_customer_id) {
    return NextResponse.json({ error: 'Database error or customer not found' }, { status: 500 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subRecord.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/account`,
  });

  return NextResponse.json({ url: portalSession.url });
}
