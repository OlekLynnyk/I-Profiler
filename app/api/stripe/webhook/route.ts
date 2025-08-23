// app/api/stripe/webhook/route.ts

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { syncSubscriptionWithSupabase } from '@/lib/subscription';
import { logUserAction } from '@/lib/logger';

import { env } from '@/env.server';

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const supabase = await createServerClientForApi();
  const rawBody = await req.text();
  const sig = (await headers()).get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    const already = await supabase
      .from('billing_logs')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (already.data?.id) {
      console.log('ℹ️ Duplicate webhook, skip:', event.id);
      return NextResponse.json({ message: '✅ OK (duplicate)' });
    }
  } catch (err) {
    console.error('❌ Webhook verification failed:', (err as Error).message);

    await logBillingEvent({
      supabase,
      eventType: 'webhook.error',
      payload: { rawBody },
      status: 'error',
      errorMessage: (err as Error).message,
    });

    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    // логируем факт получения события (идемпотентность добавим на шаге 5)
    await logBillingEvent({
      supabase,
      eventType: event.type,
      customerId: extractCustomerId(event),
      payload: event.data.object,
      status: 'success',
      stripe_event_id: event.id,
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabase);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session, supabase);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const incoming = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(incoming, supabase);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Error handling webhook:', err);

    await logBillingEvent({
      supabase,
      eventType: event?.type ?? 'unknown',
      payload: (event as any)?.data?.object,
      status: 'error',
      errorMessage: (err as Error).message,
      customerId: extractCustomerId(event),
      stripe_event_id: event.id,
    });

    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }

  return NextResponse.json({ message: '✅ OK' });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  console.log('✅ Webhook received for checkout.session.completed');

  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.warn('⚠️ Missing metadata.user_id or subscriptionId');
    return;
  }

  // Берём актуальную подписку из Stripe и синхронизируем единой функцией
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscriptionWithSupabase(supabase, userId, subscription);
  await logUserAction({
    userId,
    action: 'stripe:webhook_checkout_completed',
    metadata: {
      subscriptionId,
      customerId: subscription.customer,
      status: subscription.status,
    },
  });
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  console.log('ℹ️ Webhook received for checkout.session.expired');

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.warn('⚠️ checkout.session.expired: user_id отсутствует в metadata');
    return;
  }

  const { error } = await supabase
    .from('user_subscription')
    .update({ stripe_customer_id: null })
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Не удалось очистить stripe_customer_id:', error);
  } else {
    console.log(`ℹ️ stripe_customer_id очищен для user_id=${userId}`);
    await logUserAction({
      userId,
      action: 'stripe:webhook_checkout_expired',
      metadata: {},
    });
  }
}

async function handleSubscriptionChange(
  incoming: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  const customerId = incoming.customer as string;

  const { data, error } = await supabase
    .from('user_subscription')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error || !data?.user_id) {
    console.error('❌ Не найден user_id по customerId:', customerId);
    return;
  }

  // Защита от out-of-order: подтягиваем свежую подписку перед синком
  const fresh = await stripe.subscriptions.retrieve(incoming.id);
  await syncSubscriptionWithSupabase(supabase, data.user_id, fresh);
  await logUserAction({
    userId: data.user_id,
    action: 'stripe:webhook_subscription_change',
    metadata: {
      subscriptionId: incoming.id,
      customerId,
    },
  });
}

function extractCustomerId(event: Stripe.Event): string | undefined {
  const object = event.data?.object as any;
  return object?.customer ?? object?.customer_id ?? undefined;
}

async function logBillingEvent(params: {
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>;
  eventType: string;
  customerId?: string;
  userId?: string;
  payload: any;
  status: 'success' | 'error';
  errorMessage?: string;
  stripe_event_id?: string;
}) {
  const { supabase, eventType, customerId, userId, payload, status, errorMessage } = params;

  const { error } = await supabase.from('billing_logs').insert({
    event_type: eventType,
    stripe_customer_id: customerId ?? null,
    user_id: userId ?? null,
    payload,
    status,
    error_message: errorMessage ?? null,
    stripe_event_id: params.stripe_event_id ?? null,
  });

  if (error) {
    console.error('❌ Failed to insert billing_logs:', error);
  }
}
