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

      if (!res.ok) {
        const errorText = await res.text();
        setError('Checkout failed. Try again.');
        return;
      }

      const { url } = await res.json();

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
    } catch (e) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return { handleCheckout, loading, error };
}
