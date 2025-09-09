// app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { syncSubscriptionWithSupabase } from '@/lib/subscription';
import { logUserAction } from '@/lib/logger';
import { env } from '@/env.server';

export const runtime = 'nodejs'; // keep raw body for Stripe signature verification
export const dynamic = 'force-dynamic'; // webhooks must not be cached

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
}

type InvoiceWithPI = Stripe.Invoice & { payment_intent?: string | Stripe.PaymentIntent | null };

export async function POST(req: Request) {
  // 1) Сначала читаем сырое тело и проверяем подпись — без побочных действий до этого
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook verification failed:', (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  // 2) Только после верификации — инициализируем БД и проверим идемпотентность
  const supabase = await createServerClientForApi();

  const already = await supabase
    .from('billing_logs')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (already.data?.id) {
    console.log('ℹ️ Duplicate webhook, skipping:', event.id);
    return NextResponse.json({ message: 'OK (duplicate)' });
  }

  try {
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
        await handleCheckoutCompleted(session, supabase); // ✅ основная правка шага 2
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

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        let subscriptionId = (invoice.subscription as string) || null;

        // Fallback: у инвойса нет subscriptionId → пробуем найти по customer
        if (!subscriptionId) {
          const customerId = (invoice.customer as string) || extractCustomerId(event);

          if (customerId) {
            try {
              const list = await stripe.subscriptions.list({
                customer: customerId,
                status: 'all',
                limit: 1, // самый свежий
              });
              if (list.data[0]) {
                subscriptionId = list.data[0].id;
              }
            } catch (e) {
              console.warn(
                '⚠️ invoice.paid fallback: failed to list subscriptions for customer=',
                customerId,
                e
              );
            }
          }
        }

        if (!subscriptionId) {
          console.warn('⚠️ invoice.paid: cannot resolve subscriptionId, invoice:', invoice.id);
          break;
        }

        const fresh = await stripe.subscriptions.retrieve(subscriptionId);
        await handleSubscriptionChange(fresh, supabase);

        try {
          const customerId = fresh.customer as string;
          await logUserAction({
            userId: (fresh.metadata?.user_id as string) ?? 'unknown',
            action: 'stripe:invoice_paid_sync',
            metadata: {
              subscriptionId,
              invoiceId: invoice.id,
              status: fresh.status,
              customerId,
            },
          });
        } catch {}

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Error handling webhook:', err);

    await logBillingEvent({
      supabase,
      eventType: (event as any)?.type ?? 'unknown',
      payload: (event as any)?.data?.object,
      status: 'error',
      errorMessage: (err as Error).message,
      customerId: extractCustomerId(event),
      stripe_event_id: event.id,
    });

    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
  }

  return NextResponse.json({ message: 'OK' });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  console.log('✅ Webhook: checkout.session.completed');

  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.warn('⚠️ Missing metadata.user_id or subscriptionId');
    return;
  }

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
  console.log('ℹ️ Webhook: checkout.session.expired');

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.warn('⚠️ checkout.session.expired: metadata.user_id is missing');
    return;
  }

  const { error } = await supabase
    .from('user_subscription')
    .update({ stripe_customer_id: null })
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Failed to clear stripe_customer_id:', error);
  } else {
    console.log(`ℹ️ stripe_customer_id cleared for user_id=${userId}`);
    await logUserAction({
      userId,
      action: 'stripe:webhook_checkout_expired',
      metadata: {},
    });
  }
}

async function isPaymentSettledForChange(sub: Stripe.Subscription): Promise<boolean> {
  // Работаем на свежем объекте с развёрнутыми связями, чтобы не ошибиться из-за пустого latest_invoice
  const fresh = await stripe.subscriptions.retrieve(sub.id, {
    expand: ['latest_invoice.payment_intent'],
  });

  const li = fresh.latest_invoice as string | Stripe.Invoice | null | undefined;
  if (!li) {
    // Нет latest_invoice → считаем расчёт не завершённым, ждём события invoice.*
    return false;
  }

  const invoice: InvoiceWithPI =
    typeof li === 'string'
      ? ((await stripe.invoices.retrieve(li)) as InvoiceWithPI)
      : (li as InvoiceWithPI);

  // Нулевой итог (кредит/купон/прорейтинг) — доступа можно давать сразу
  const total = (invoice.total ?? invoice.amount_due ?? 0) || 0;
  if (invoice.status === 'paid' || total <= 0) return true;

  // Если есть PI — ждём успешного списания
  const piRef = invoice.payment_intent as string | Stripe.PaymentIntent | null | undefined;
  if (piRef) {
    const pi =
      typeof piRef === 'string'
        ? await stripe.paymentIntents.retrieve(piRef)
        : (piRef as Stripe.PaymentIntent);
    return pi.status === 'succeeded';
  }

  // Инвойс есть, итог положительный, PI нет или не успешен → ещё не оплачено
  return false;
}

async function handleSubscriptionChange(
  incoming: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  const customerId = incoming.customer as string;

  // 0) Самый точный источник — метадата самой подписки (если есть)
  let userId: string | null = (incoming.metadata?.user_id as string | undefined) ?? null;

  // 1) По текущему маппингу в БД
  if (!userId) {
    const { data, error } = await supabase
      .from('user_subscription')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();

    if (error) {
      console.error('❌ Lookup error by customerId:', customerId, error);
    }
    if (data?.user_id) {
      userId = data.user_id;
    }
  }

  // 2) Fallback: из customer.metadata.user_id (и восстановить маппинг)
  if (!userId) {
    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
      const metaUserId = (customer.metadata?.user_id as string) || null;

      if (metaUserId) {
        userId = metaUserId;

        const now = new Date().toISOString();
        const { error: upsertErr } = await supabase.from('user_subscription').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            created_at: now,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        );
        if (upsertErr) {
          console.error(
            '❌ Failed to upsert user_subscription while restoring mapping:',
            upsertErr
          );
        }
      }
    } catch (e) {
      console.error('❌ Failed to retrieve Stripe Customer for fallback mapping:', e);
    }
  }

  // 3) ✅ Fallback по e-mail (strict match) — последний шанс для легаси
  if (!userId) {
    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
      const email = customer.email?.toLowerCase().trim();
      if (email) {
        // предпочтительно: profiles(email) – публичная таблица вашего приложения
        const { data: u, error: emailErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (emailErr) {
          console.error('❌ Email fallback query failed:', emailErr);
        }

        if (u?.id) {
          userId = u.id;
          const now = new Date().toISOString();

          // восстановим маппинг
          const { error: upsertErr } = await supabase.from('user_subscription').upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              created_at: now,
              updated_at: now,
            },
            { onConflict: 'user_id' }
          );
          if (upsertErr) {
            console.error('❌ Upsert after email fallback failed:', upsertErr);
          }

          // и зафиксируем его в Stripe для будущих событий
          try {
            await stripe.customers.update(customerId, {
              metadata: { ...(customer.metadata ?? {}), user_id: userId },
            });
          } catch (e) {
            console.warn('⚠️ Failed to update customer metadata.user_id after email fallback', e);
          }
        }
      }
    } catch (e) {
      console.error('❌ Email fallback: failed to retrieve customer', e);
    }
  }

  if (!userId) {
    console.error('❌ Could not resolve user_id for customerId=', customerId, ' — skipping sync.');
    return;
  }

  const canSyncNow = await isPaymentSettledForChange(incoming);
  if (!canSyncNow) {
    console.log('⏳ Defer sync until payment settles', {
      subscriptionId: incoming.id,
      reason: 'invoice_not_paid_or_missing',
      incomingLatestInvoice:
        typeof incoming.latest_invoice === 'string'
          ? incoming.latest_invoice
          : ((incoming.latest_invoice as any)?.id ?? null),
    });
    return;
  }

  const fresh = await stripe.subscriptions.retrieve(incoming.id, {
    expand: ['latest_invoice.payment_intent'],
  });

  await syncSubscriptionWithSupabase(supabase, userId, fresh);

  await logUserAction({
    userId,
    action: 'stripe:webhook_subscription_change',
    metadata: {
      subscriptionId: incoming.id,
      customerId,
      status: fresh.status,
    },
  });

  console.log('✅ Subscription synced via webhook', {
    userId,
    status: fresh.status,
    price: fresh.items?.data?.[0]?.price?.id,
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
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('❌ Failed to insert billing_logs:', error);
  }
}
