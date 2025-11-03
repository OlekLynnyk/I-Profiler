// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/env.server';
import { logUserAction } from '@/lib/logger';
import type Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

const appUrl = env.NEXT_PUBLIC_APP_URL;
if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL is not defined');

// Локальный тип: расширяем Invoice полем payment_intent (из-за несовпадения версий типов)
type InvoiceWithPI = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null;
};

export async function POST(req: NextRequest) {
  // --- Аутентификация: сначала Bearer, если не сработал — fallback к cookie-сессии ---
  const hdr = req.headers.get('authorization');
  const bearer = hdr?.startsWith('Bearer ') ? hdr.slice(7).trim() : '';

  const supabaseSvc = await createServerClientForApi(); // серверный клиент для работы с БД
  let user: { id: string; email?: string | null } | null = null;

  // 1) Пытаемся удостовериться по переданному access_token
  if (bearer) {
    try {
      const { data, error } = await supabaseSvc.auth.getUser(bearer);
      if (!error && data?.user) user = data.user as any;
    } catch (e) {
      console.warn('auth.getUser(bearer) failed', e);
    }
  }

  // 2) Фоллбек: если токен не прошёл (или отсутствует) — читаем юзера из куков
  if (!user) {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore as any });
      const { data } = await supabase.auth.getUser();
      if (data?.user) user = data.user as any;
    } catch (e) {
      console.warn('auth.getUser(cookies) failed', e);
    }
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId, confirm } = await req.json().catch(() => ({}));
  console.log('🧾 Received priceId:', priceId);
  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid priceId' }, { status: 400 });
  }

  // 1) читаем статус и customer_id
  const { data: subData, error: subCheckError } = await supabaseSvc
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

      const { error: upsertError } = await supabaseSvc.from('user_subscription').upsert(
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

  // 3) активная платная → апгрейд действующей подписки (через update)
  if (isActivePaid) {
    try {
      try {
        const portal = await stripe.billingPortal.sessions.create({
          customer: customerId!,
          return_url: `${appUrl}/`,
        });

        await logUserAction({
          userId: user.id,
          action: 'stripe:billing_portal_redirect_from_buy',
          metadata: {
            fromPrice: subData?.stripe_price_id ?? null,
            requestedPrice: priceId,
            customerId,
          },
        });

        return NextResponse.json({ portalUrl: portal.url, url: portal.url }, { status: 200 });
      } catch (portalErr) {
        console.warn('⚠️ Billing Portal not available, falling back to upgrade flow:', portalErr);
        // не возвращаем ответ — продолжаем исполнение СУЩЕСТВУЮЩЕЙ логики апгрейда ниже
      }

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

      // --- PREVIEW STEP (Basil): показываем сумму перед апдейтом; пока НИЧЕГО не списываем ---
      if (!confirm) {
        const upcoming = await stripe.invoices.createPreview({
          customer: customerId!,
          subscription: currentSubId,
          subscription_details: {
            items: [{ id: currentItemId, price: priceId, quantity: 1 }],
            proration_behavior: 'always_invoice',
          },
        });

        const total = (upcoming.total ?? upcoming.amount_due ?? 0) || 0;
        const currency = (upcoming.currency ?? 'eur').toUpperCase();
        const prorationLines = (upcoming.lines?.data ?? []).filter((l: any) => l.proration);
        const prorationAmount = prorationLines.reduce(
          (s: number, l: any) => s + (l.amount ?? 0),
          0
        );

        const confirmUrl = `${appUrl}/settings/subscription?confirm=1&price=${priceId}`;
        return NextResponse.json(
          {
            requiresConfirmation: true,
            url: confirmUrl,
            preview: {
              total,
              currency,
              prorationAmount,
              lines: prorationLines.map((l: any) => ({
                description: l.description,
                amount: l.amount,
              })),
            },
          },
          { status: 200 }
        );
      }
      // --- END PREVIEW STEP ---

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

      // Всегда получаем полноценный invoice-объект
      let invoice: InvoiceWithPI | null = null;
      if (latestInvoiceRaw) {
        invoice =
          typeof latestInvoiceRaw === 'string'
            ? ((await stripe.invoices.retrieve(latestInvoiceRaw)) as InvoiceWithPI)
            : (latestInvoiceRaw as InvoiceWithPI);
      }

      // Попробуем получить PI (если есть)
      let paymentIntent: Stripe.PaymentIntent | null = null;
      if (invoice?.payment_intent) {
        paymentIntent =
          typeof invoice.payment_intent === 'string'
            ? await stripe.paymentIntents.retrieve(invoice.payment_intent)
            : (invoice.payment_intent as Stripe.PaymentIntent);
      }

      // Сумма к оплате: если 0 (кредит/нулевой прорейт) — апгрейд можно считать завершённым
      const total = (invoice?.total ?? invoice?.amount_due ?? 0) || 0;

      // ✅ Случай 1: нулевая сумма ИЛИ инвойс уже оплачен → апгрейд завершён
      if (invoice?.status === 'paid' || total <= 0) {
        await logUserAction({
          userId: user.id,
          action: 'stripe:subscription_upgraded',
          metadata: {
            fromPrice: subData?.stripe_price_id ?? null,
            toPrice: priceId,
            subscriptionId: updated.id,
            paymentIntentId: paymentIntent?.id ?? null,
            invoiceId: invoice?.id ?? null,
          },
        });

        return NextResponse.json(
          {
            ok: true,
            kind: 'upgraded',
            subscriptionId: updated.id,
            url: `${appUrl}/?billing=updated`,
          },
          { status: 200 }
        );
      }

      if (paymentIntent) {
        const status = paymentIntent.status;

        if (status === 'requires_action') {
          let hostedInvoiceUrl: string | null = null;
          try {
            if (invoice?.hosted_invoice_url) {
              hostedInvoiceUrl = invoice.hosted_invoice_url;
            } else if (updated.latest_invoice) {
              const inv =
                typeof updated.latest_invoice === 'string'
                  ? await stripe.invoices.retrieve(updated.latest_invoice)
                  : (updated.latest_invoice as Stripe.Invoice);
              hostedInvoiceUrl = inv.hosted_invoice_url ?? null;
            }
          } catch {}

          await logUserAction({
            userId: user.id,
            action: 'stripe:subscription_upgrade_requires_action',
            metadata: {
              fromPrice: subData?.stripe_price_id ?? null,
              toPrice: priceId,
              subscriptionId: updated.id,
              paymentIntentId: paymentIntent.id,
              hostedInvoiceUrl,
            },
          });

          return NextResponse.json(
            {
              kind: 'upgraded_requires_action',
              requiresAction: true,
              clientSecret: paymentIntent.client_secret,
              subscriptionId: updated.id,
              hostedInvoiceUrl,
              url: hostedInvoiceUrl ?? `${appUrl}/?billing=processing`,
            },
            { status: 402 }
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

          // ➜ сразу в Billing Portal (фронт это уже поддерживает)
          const portal = await stripe.billingPortal.sessions.create({
            customer: customerId!, // у тебя он уже определён выше
            return_url: `${appUrl}/`,
          });

          return NextResponse.json(
            { portalUrl: portal.url, url: portal.url, subscriptionId: updated.id },
            { status: 402 }
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
              url: `${appUrl}/?billing=processing`,
            },
            { status: 402 }
          );
        }

        // успех по PI
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

      await logUserAction({
        userId: user.id,
        action: 'stripe:subscription_upgrade_requires_payment_method',
        metadata: {
          fromPrice: subData?.stripe_price_id ?? null,
          toPrice: priceId,
          subscriptionId: updated.id,
          paymentIntentId: paymentIntent?.id ?? null,
          invoiceId: invoice?.id ?? null,
        },
      });

      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId!,
        return_url: `${appUrl}/`,
      });

      return NextResponse.json(
        { portalUrl: portal.url, subscriptionId: updated.id },
        { status: 402 }
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
