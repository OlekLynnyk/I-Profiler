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

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Пытаемся распарсить JSON даже при !ok, чтобы показать текст ошибки с бэка
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        /* игнорируем, останется null */
      }

      if (!res.ok) {
        setError(json?.error ?? 'Checkout failed. Try again.');
        return;
      }

      // ✅ Новое: поддержка портала для активных подписок
      const portalUrl: string | undefined = json?.portalUrl;
      if (portalUrl) {
        if (userId) {
          await logUserAction({
            userId,
            action: 'stripe:billing_portal_redirect',
            metadata: { priceId },
          });
        }
        window.location.href = portalUrl;
        return;
      }

      // Старый путь: обычный Checkout Session
      const url: string | undefined = json?.url;
      if (userId) {
        await logUserAction({
          userId,
          action: 'stripe:checkout:initiate',
          metadata: { priceId },
        });
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
