// app/api/internal/sync-subscriptions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClientForApi } from '@/lib/supabase/server';
import { syncSubscriptionWithSupabase } from '@/lib/subscription';
import { env } from '@/env.server';

export async function GET(req: NextRequest) {
  // 🔐 Неразрушающая защита:
  // - если заголовок есть и неверный → 401
  // - если заголовка нет → пропускаем (back-compat, НОЛЬ регрессии)
  const auth = req.headers.get('authorization');
  if (auth && auth !== `Bearer ${env.SYNC_SECRET_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createServerClientForApi();

    // как было: листинг подписок
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });

    let processed = 0;

    // ⬇️ ЗАМЕНЁННЫЙ БЛОК ЦИКЛА
    for (const subscription of subscriptions.data) {
      const customerId = subscription.customer as string;

      // 1) Пытаемся найти по существующему маппингу
      let userId: string | null = null;
      const { data: mapRow, error: mapErr } = await supabase
        .from('user_subscription')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (mapErr) {
        console.warn('⚠️ map lookup error:', mapErr);
      } else {
        userId = mapRow?.user_id ?? null;
      }

      // 2) Fallback: customer.metadata.user_id
      if (!userId) {
        try {
          const customer = (await stripe.customers.retrieve(customerId)) as any;
          const metaUserId = (customer?.metadata?.user_id as string) || null;
          if (metaUserId) userId = metaUserId;

          // 3) Fallback по email → profiles.email == customer.email
          if (!userId && customer?.email) {
            const email = String(customer.email).toLowerCase().trim();
            const { data: profile, error: emailErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .maybeSingle();

            if (emailErr) {
              console.warn('⚠️ profiles lookup by email failed:', emailErr);
            } else if (profile?.id) {
              userId = profile.id;
            }
          }
        } catch (e) {
          console.warn('⚠️ retrieve customer failed:', e);
        }
      }

      if (userId) {
        // Guard: профиль должен существовать, иначе пропускаем (убирает FK ошибки в user_limits)
        const { data: profileRow, error: profileErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (profileErr) {
          console.warn('profiles lookup failed:', profileErr);
          continue;
        }
        if (!profileRow?.id) {
          console.warn(`skip customer=${customerId}: profile missing for user_id=${userId}`);
          continue;
        }

        const now = new Date().toISOString();
        const { error: upsertErr } = await supabase
          .from('user_subscription')
          .upsert(
            { user_id: userId, stripe_customer_id: customerId, created_at: now, updated_at: now },
            { onConflict: 'user_id' }
          );
        if (upsertErr) {
          console.warn('upsert user_subscription failed:', upsertErr);
          continue;
        }

        await syncSubscriptionWithSupabase(supabase, userId, subscription);
        processed++;
        continue;
      }

      console.warn(
        `⚠️ Не удалось связать customer=${customerId} ни по маппингу, ни по метаданным/email`
      );
    }
    // ⬆️ КОНЕЦ ЗАМЕНЁННОГО БЛОКА

    console.info(`✅ Обработано подписок: ${processed}`);
    return NextResponse.json({ success: true, processed });
  } catch (err) {
    console.error('❌ Ошибка в sync-subscriptions:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
