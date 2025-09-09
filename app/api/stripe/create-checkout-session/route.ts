// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/env.server';
import { logUserAction } from '@/lib/logger';
import type Stripe from 'stripe';

const appUrl = env.NEXT_PUBLIC_APP_URL;
if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL is not defined');

// Локальный тип: расширяем Invoice полем payment_intent (из-за несовпадения версий типов)
type InvoiceWithPI = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
};

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Missing access token' }, { status: 401 });

  const supabase = await createServerClientForApi();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { priceId } = await req.json().catch(() => ({}));
  console.log('🧾 Received priceId:', priceId);
  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid priceId' }, { status: 400 });
  }

  // 1) читаем статус и customer_id
  const { data: subData, error: subCheckError } = await supabase
    .from('user_subscription')
    .select('status, plan, stripe_customer_id, stripe_subscription_id, stripe_price_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (subCheckError) {
    console.error('❌ Failed to check user_subscription:', subCheckError);
    return NextResponse.json({ error: 'Subscription check failed' }, { status: 500 });
  }

  const isFreemium = subData?.plan === 'Freemium';
  const isActivePaid = subData?.status === 'active' && !isFreemium;

  // 2) гарантируем customerId
  let customerId: string | undefined = subData?.stripe_customer_id ?? undefined;

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch (e: any) {
      if (e?.code === 'resource_missing') customerId = undefined;
      else {
        console.error('❌ Stripe customer fetch failed:', e);
        return NextResponse.json({ error: 'Stripe customer fetch failed' }, { status: 500 });
      }
    }
  }

  if (!customerId) {
    try {
      const existing = await stripe.customers.list({ email: user.email ?? undefined, limit: 1 });
      const existingCustomer = existing.data?.[0];
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { user_id: user.id },
        });
        customerId = customer.id;
      }

      const { error: upsertError } = await supabase.from('user_subscription').upsert(
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
      console.error('❌ Stripe customer handling error:', e);
      return NextResponse.json({ error: 'Stripe customer handling failed' }, { status: 500 });
    }
  }

  // 3) активная платная → апгрейд действующей подписки, без портала (SCA-safe)
  if (isActivePaid) {
    try {
      // если уже на этом же price — менять нечего
      if (subData?.stripe_price_id === priceId) {
        return NextResponse.json(
          { error: 'Subscription already on this price', reason: 'no_change' },
          { status: 409 }
        );
      }

      const currentSubId = subData?.stripe_subscription_id;
      if (!currentSubId) {
        return NextResponse.json(
          { error: 'No active subscription id found', reason: 'missing_subscription_id' },
          { status: 409 }
        );
      }

      // получаем текущую подписку и обновляем первый item на новый price
      const currentSub = await stripe.subscriptions.retrieve(currentSubId);
      const currentItemId = currentSub.items?.data?.[0]?.id;
      if (!currentItemId) {
        return NextResponse.json(
          { error: 'No subscription item to update', reason: 'missing_item' },
          { status: 500 }
        );
      }

      // опциональная идемпотентность из заголовка клиента
      const idempotencyKey = req.headers.get('x-idempotency-key') ?? undefined;

      const updated = await stripe.subscriptions.update(
        currentSubId,
        {
          items: [{ id: currentItemId, price: priceId, quantity: 1 }],
          proration_behavior: 'always_invoice',
          payment_behavior: 'pending_if_incomplete',
          expand: ['latest_invoice.payment_intent'],
        },
        idempotencyKey ? { idempotencyKey } : undefined
      );

      // ── разбор статуса платежа (прорейт/доплата)
      const latestInvoiceRaw = updated.latest_invoice as string | Stripe.Invoice | null | undefined;

      let paymentIntent: Stripe.PaymentIntent | null = null;
      if (latestInvoiceRaw && typeof latestInvoiceRaw !== 'string') {
        const inv = latestInvoiceRaw as InvoiceWithPI;
        const piField = inv.payment_intent;

        if (piField) {
          paymentIntent =
            typeof piField === 'string'
              ? await stripe.paymentIntents.retrieve(piField)
              : (piField as Stripe.PaymentIntent);
        }
      }

      if (paymentIntent) {
        const status = paymentIntent.status;

        if (status === 'requires_action') {
          await logUserAction({
            userId: user.id,
            action: 'stripe:subscription_upgrade_requires_action',
            metadata: {
              fromPrice: subData?.stripe_price_id ?? null,
              toPrice: priceId,
              subscriptionId: updated.id,
              paymentIntentId: paymentIntent.id,
            },
          });

          return NextResponse.json(
            {
              kind: 'upgraded_requires_action',
              requiresAction: true,
              clientSecret: paymentIntent.client_secret,
              subscriptionId: updated.id,
            },
            { status: 200 }
          );
        }

        if (status === 'requires_payment_method') {
          await logUserAction({
            userId: user.id,
            action: 'stripe:subscription_upgrade_requires_payment_method',
            metadata: {
              fromPrice: subData?.stripe_price_id ?? null,
              toPrice: priceId,
              subscriptionId: updated.id,
              paymentIntentId: paymentIntent.id,
            },
          });

          // карта недействительна/отклонена → фронту показать обновление PM
          return NextResponse.json(
            {
              error: 'payment_method_required',
              message: 'A valid payment method is required to complete the upgrade.',
              subscriptionId: updated.id,
            },
            { status: 402 } // Payment Required
          );
        }

        // иные промежуточные статусы: processing/requires_confirmation → считаем принятым
        if (status === 'processing' || status === 'requires_confirmation') {
          await logUserAction({
            userId: user.id,
            action: 'stripe:subscription_upgrade_processing',
            metadata: {
              fromPrice: subData?.stripe_price_id ?? null,
              toPrice: priceId,
              subscriptionId: updated.id,
              paymentIntentId: paymentIntent.id,
              status,
            },
          });

          return NextResponse.json(
            {
              ok: true,
              kind: 'upgraded_processing',
              subscriptionId: updated.id,
              url: `${appUrl}/account?billing=processing`,
            },
            { status: 200 }
          );
        }

        // успех
        if (status === 'succeeded') {
          await logUserAction({
            userId: user.id,
            action: 'stripe:subscription_upgraded',
            metadata: {
              fromPrice: subData?.stripe_price_id ?? null,
              toPrice: priceId,
              subscriptionId: updated.id,
              paymentIntentId: paymentIntent.id,
            },
          });

          return NextResponse.json(
            {
              ok: true,
              kind: 'upgraded',
              subscriptionId: updated.id,
              url: `${appUrl}/account?billing=updated`,
            },
            { status: 200 }
          );
        }
      }

      // кейс без платежа (нет доплаты/прорейт нулевой) — просто успех
      await logUserAction({
        userId: user.id,
        action: 'stripe:subscription_upgraded_no_payment_intent',
        metadata: {
          fromPrice: subData?.stripe_price_id ?? null,
          toPrice: priceId,
          subscriptionId: updated.id,
        },
      });

      return NextResponse.json(
        {
          ok: true,
          kind: 'upgraded',
          subscriptionId: updated.id,
          url: `${appUrl}/account?billing=updated`,
        },
        { status: 200 }
      );
    } catch (e: any) {
      console.error('❌ Stripe upgrade error:', e);
      const msg = e?.message || 'Stripe upgrade failed';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // 4) новый Checkout для пользователей без платной подписки
  try {
    console.log('📤 Stripe create-checkout-session →', {
      mode: 'subscription',
      customer: customerId,
      priceId,
      userId: user.id,
      success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?checkout=cancel`,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId!,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?checkout=cancel`,
      metadata: { user_id: user.id },
      client_reference_id: user.id,
      payment_method_collection: 'always',
      subscription_data: { metadata: { user_id: user.id } },
    });

    await logUserAction({
      userId: user.id,
      action: 'stripe:checkout_session_created',
      metadata: { priceId, customerId, sessionId: session.id },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error('❌ Stripe checkout session error:', {
      message: e?.message,
      code: e?.code,
      raw: e?.raw,
    });
    const msg = e?.message || 'Stripe checkout session failed';
    const isNoSuchPrice = typeof msg === 'string' && msg.toLowerCase().includes('no such price');
    return NextResponse.json({ error: msg }, { status: isNoSuchPrice ? 400 : 500 });
  }
}
