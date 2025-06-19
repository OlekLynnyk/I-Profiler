'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { PACKAGE_LIMITS, isValidPackageType, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export function useUserPlan() {
  const [plan, setPlan] = useState<ValidPackageType>('Freemium');
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(PACKAGE_LIMITS.Freemium.dailyGenerations);

  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = createBrowserSupabaseClient<Database>();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_limits')
        .select('plan, used_today, daily_limit')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        console.warn('⚠️ user_limits not found or error', error);
        return;
      }

      const currentPlan = isValidPackageType(data.plan) ? data.plan : 'Freemium';
      const maxDaily = data.daily_limit ?? PACKAGE_LIMITS[currentPlan].dailyGenerations;

      setPlan(currentPlan);
      setUsed(data.used_today ?? 0);
      setLimit(maxDaily);
    };

    fetchPlan();
  }, []);

  return {
    plan,
    used,
    limits: { dailyGenerations: limit },
    hasReachedLimit: used >= limit,
    progress: Math.min((used / limit) * 100, 100),
  };
}
