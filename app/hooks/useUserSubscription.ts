import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { PackageType } from '@/types/plan';
import { getPackageFromServer, hasActiveSubscription } from '@/lib/subscription';

type SubscriptionData = {
  plan: PackageType;
  status: 'active' | 'inactive';
  next_billing_date: string | null;
  trial_end_date: string | null;
  cancel_at_period_end: boolean;
  payment_method: string | null;
  package_type: string;
};

export function useUserSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const supabase = createPagesBrowserClient();

        const plan = await getPackageFromServer(supabase);
        const isActive = await hasActiveSubscription(supabase);

        setData({
          plan,
          status: isActive ? 'active' : 'inactive',
          next_billing_date: null,
          trial_end_date: null,
          cancel_at_period_end: false,
          payment_method: null,
          package_type: 'Freemium',
        });
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
