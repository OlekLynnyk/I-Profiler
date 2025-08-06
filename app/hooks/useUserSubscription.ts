import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export function useUserSubscription() {
  const [data, setData] = useState<null | {
    plan: string;
    status: string;
    nextBillingDate: string;
    trialEndDate: string;
    cancelAtPeriodEnd: boolean;
    paymentMethod: string;
    packageType: string;
  }>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      const supabase = createPagesBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError('Missing access token');
        setIsLoading(false);
        return;
      }

      try {
        // Step 1: Ensure user_subscription exists
        await fetch('/api/user/init', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        // Step 2: Load subscription data
        const res = await fetch('/api/subscription', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }

        const result = await res.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return { data, isLoading, error };
}
