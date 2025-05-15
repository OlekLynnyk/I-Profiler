'use client';

import { useState, useEffect } from 'react';
import { PackageType, isValidPackageType } from '@/types/plan';
import { getPackageFromServer } from '@/lib/subscription';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export function useDemoAttempts(): {
  demoAttempts: number;
  packageType: PackageType;
  limitReached: boolean;
} {
  const [demoAttempts, setDemoAttempts] = useState(0);
  const [packageType, setPackageType] = useState<PackageType>('Freemium');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserSupabaseClient<Database>();

      try {
        const pkgFromAPI = await getPackageFromServer(supabase);

        if (isValidPackageType(pkgFromAPI)) {
          setPackageType(pkgFromAPI);
        } else {
          console.warn('⚠️ Invalid package type from server:', pkgFromAPI);
          setPackageType('Freemium');
        }

        // TODO: fetch actual demoAttempts here if needed
        // const { data, error } = await supabase...
      } catch (err) {
        console.error('❌ Failed to fetch package type', err);
        setPackageType('Freemium');
      }
    };

    fetchData();
  }, []);

  return {
    demoAttempts,
    packageType,
    limitReached: packageType === 'Freemium' && demoAttempts >= 5,
  };
}

