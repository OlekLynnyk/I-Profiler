'use client';

import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { getPackageFromServer } from '@/lib/subscription';
import { PACKAGE_LIMITS } from '@/types/plan';
import { isValidPackageType, ValidPackageType, PackageType } from '@/types/plan';
import type { Database } from '@/types/supabase';
import { env } from '@/env.server';

// Ключ: тип состояния — это союз (union) значений объекта PACKAGE_LIMITS по валидным ключам
type Limits = (typeof PACKAGE_LIMITS)[ValidPackageType];

export function usePackageLimits() {
  // Инициализация тем же значением, но тип теперь — Limits (union), а не литерал Freemium
  const [limits, setLimits] = useState<Limits>(PACKAGE_LIMITS.Freemium);

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createPagesBrowserClient<Database>({
          supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });

        const pkg: PackageType = await getPackageFromServer(supabase);

        if (isValidPackageType(pkg)) {
          // после type guard pkg сужается до ValidPackageType → тип совместим с Limits
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
