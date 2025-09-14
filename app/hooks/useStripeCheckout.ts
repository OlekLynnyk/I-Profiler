'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { logUserAction } from '@/lib/logger';

export function useStripeCheckout() {
  const supabase = createPagesBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      const token = data.session?.access_token;

      // 1) PREVIEW (Paid→Paid): сервер вернёт requiresConfirmation=true
      let res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {}

      if (!res.ok) {
        // На этом шаге не должно быть 402, но подстрахуемся
        if (json?.portalUrl) {
          window.location.href = json.portalUrl;
          return;
        }
        if (json?.requiresAction && (json?.hostedInvoiceUrl || json?.url)) {
          window.location.href = json.hostedInvoiceUrl || json.url;
          return;
        }
        setError(json?.error ?? 'Checkout failed. Try again.');
        return;
      }

      // 2) Если это апгрейд — показываем сумму и спрашиваем подтверждение
      if (json?.requiresConfirmation) {
        const total = json.preview?.total ?? 0;
        const currency = (json.preview?.currency ?? 'eur').toUpperCase();
        const ok = window.confirm(
          `С вашего счёта будет списано ${(total / 100).toFixed(2)} ${currency}. Продолжить?`
        );
        if (!ok) return;

        // 3) CONFIRM — апгрейд. Здесь возможны 200 (нулевой счёт) или 402 (доплата/ПМ/3DS)
        res = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          body: JSON.stringify({ priceId, confirm: true }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        try {
          json = await res.json();
        } catch {}

        // 402 → редирект в hostedInvoice или в Портал
        if (!res.ok) {
          if (json?.portalUrl) {
            window.location.href = json.portalUrl;
            return;
          }
          if (json?.requiresAction && (json?.hostedInvoiceUrl || json?.url)) {
            window.location.href = json.hostedInvoiceUrl || json.url;
            return;
          }
          setError(json?.error ?? 'Upgrade failed. Try again.');
          return;
        }

        // 200 с requiresAction (на всякий случай) → редирект
        if (json?.requiresAction && (json?.hostedInvoiceUrl || json?.url)) {
          window.location.href = json.hostedInvoiceUrl || json.url;
          return;
        }

        // 200 нулевой счёт → успех
        if (json?.url) {
          window.location.href = json.url;
          return;
        }
      }

      // 4) Free→Paid (Checkout Session): сервер вернёт session.url
      if (json?.portalUrl) {
        if (userId) {
          await logUserAction({
            userId,
            action: 'stripe:billing_portal_redirect',
            metadata: { priceId },
          });
        }
        window.location.href = json.portalUrl;
        return;
      }

      const url: string | undefined = json?.url;
      if (userId) {
        await logUserAction({ userId, action: 'stripe:checkout:initiate', metadata: { priceId } });
      }

      if (url) {
        window.location.href = url;
      } else {
        setError('Unexpected error. No redirect URL.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return { handleCheckout, loading, error };
}
