import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database } from '@/types/supabase';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!appUrl) {
  throw new Error('NEXT_PUBLIC_APP_URL is not defined');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { priceId } = await req.json().catch(() => ({}));
  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid priceId' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    data: subRecord,
    error: subError,
  } = await supabase
    .from('user_subscription')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let customerId = subRecord?.stripe_customer_id;

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch (e: any) {
      if (e.code === 'resource_missing') {
        customerId = undefined;
      } else {
        console.error('❌ Stripe customer fetch failed:', e);
        return NextResponse.json({ error: 'Stripe customer fetch failed' }, { status: 500 });
      }
    }
  }

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });

      customerId = customer.id;

      const { error: upsertError } = await supabase
        .from('user_subscription')
        .upsert(
          {
            user_id: user.id,
            stripe_customer_id: customerId,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (upsertError) {
        console.error('❌ Supabase upsert error:', upsertError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    } catch (e: any) {
      console.error('❌ Stripe customer creation error:', e);
      return NextResponse.json({ error: 'Stripe customer creation failed' }, { status: 500 });
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/workspace?checkout=success`,
      cancel_url: `${appUrl}/workspace?checkout=cancel`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('❌ Stripe checkout session error:', e);
    return NextResponse.json({ error: 'Stripe checkout session failed' }, { status: 500 });
  }
}
