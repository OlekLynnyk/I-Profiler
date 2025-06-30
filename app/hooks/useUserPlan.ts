'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { PACKAGE_LIMITS, isValidPackageType, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export function useUserPlan(refreshToken?: number) {
  const [plan, setPlan] = useState<ValidPackageType>('Freemium');
  const [usedDaily, setUsedDaily] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(PACKAGE_LIMITS.Freemium.dailyGenerations);
  const [usedMonthly, setUsedMonthly] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(PACKAGE_LIMITS.Freemium.requestsPerMonth);
  const [limitResetAt, setLimitResetAt] = useState<Date | null>(null);

  const fetchPlan = useCallback(async () => {
    const supabase = createBrowserSupabaseClient<Database>();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_limits')
      .select('plan, used_today, daily_limit, used_monthly, monthly_limit, limit_reset_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('⚠️ user_limits not found or error', error);
      return;
    }

    const currentPlan = isValidPackageType(data.plan) ? data.plan : 'Freemium';

    setPlan(currentPlan);
    setUsedDaily(data.used_today ?? 0);
    setDailyLimit(data.daily_limit ?? PACKAGE_LIMITS[currentPlan].dailyGenerations);
    setUsedMonthly(data.used_monthly ?? 0);
    setMonthlyLimit(data.monthly_limit ?? PACKAGE_LIMITS[currentPlan].requestsPerMonth);
    setLimitResetAt(data.limit_reset_at ? new Date(data.limit_reset_at) : null);
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan, refreshToken]);

  const hasReachedDailyLimit =
    dailyLimit > 0 && usedDaily >= dailyLimit;

  const hasReachedMonthlyLimit =
    monthlyLimit > 0 && usedMonthly >= monthlyLimit;

  return {
    plan,
    used: usedDaily,
    limits: {
      dailyGenerations: dailyLimit,
      monthlyGenerations: monthlyLimit,
    },
    hasReachedLimit: hasReachedDailyLimit || hasReachedMonthlyLimit,
    hasReachedDailyLimit,
    hasReachedMonthlyLimit,
    limitResetAt,
    progress:
      dailyLimit > 0
        ? Math.min((usedDaily / dailyLimit) * 100, 100)
        : 0,
    refetch: fetchPlan,
  };
}
