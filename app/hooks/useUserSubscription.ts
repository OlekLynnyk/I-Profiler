import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { PackageType } from '@/types/plan';

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
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const res = await fetch('/api/subscription', {
          method: 'GET',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to load subscription');

        const json = await res.json();
        const plan = (json.plan ?? 'Freemium') as PackageType;
        const isActive =
          typeof json.isActive === 'boolean' ? json.isActive : (json.status as string) === 'active';

        setData({
          plan,
          status: isActive ? 'active' : 'inactive',
          next_billing_date: json.nextBillingDate ?? null,
          trial_end_date: json.trialEndDate ?? null,
          cancel_at_period_end: Boolean(json.cancelAtPeriodEnd),
          payment_method: json.paymentMethod ?? null,
          // пока не active — явно показываем Freemium
          package_type: isActive ? (json.packageType ?? plan) : 'Freemium',
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
