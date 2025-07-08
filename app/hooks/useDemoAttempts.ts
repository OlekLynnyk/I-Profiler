'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { PACKAGE_LIMITS, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export function useDemoAttempts(): {
  demoAttempts: number;
  packageType: ValidPackageType;
  limitReached: boolean;
} {
  const [demoAttempts, setDemoAttempts] = useState(0);
  const [packageType, setPackageType] = useState<ValidPackageType>('Freemium');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserSupabaseClient<Database>({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      });

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      console.log('👤 Текущий userId:', userId); // ← Добавлено для проверки

      if (!userId) return;

      const { data, error } = await supabase
        .from('user_limits')
        .select('used_today, plan, daily_limit')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return;

      const currentPlan = (data.plan ?? 'Freemium') as ValidPackageType;
      setPackageType(currentPlan);
      setDemoAttempts(data.used_today ?? 0);
    };

    fetchData();
  }, []);

  const limit = PACKAGE_LIMITS[packageType].dailyGenerations;

  return {
    demoAttempts,
    packageType,
    limitReached: demoAttempts >= limit,
  };
}

