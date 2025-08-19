'use client';

import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { getPackageFromServer } from '@/lib/subscription';
import { PACKAGE_LIMITS } from '@/types/plan';
import { isValidPackageType, ValidPackageType, PackageType } from '@/types/plan';
import type { Database } from '@/types/supabase';

export function usePackageLimits() {
  const [limits, setLimits] = useState(PACKAGE_LIMITS.Freemium);

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createPagesBrowserClient<Database>({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        });

        const pkg: PackageType = await getPackageFromServer(supabase);

        if (isValidPackageType(pkg)) {
          setLimits(PACKAGE_LIMITS[pkg]);
        } else {
          console.warn(`⚠️ Неизвестный тариф: ${pkg}, fallback: Freemium`);
          setLimits(PACKAGE_LIMITS.Freemium);
        }
      } catch (error) {
        console.error('❌ Ошибка при получении лимитов:', error);
        setLimits(PACKAGE_LIMITS.Freemium);
      }
    };

    fetch();
  }, []);

  return limits;
}
