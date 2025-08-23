'use client';

import { useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

function waitForAuthCookie(timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    const interval = 100;
    let waited = 0;

    const check = () => {
      if (document.cookie.includes('sb-access-token')) {
        resolve();
      } else if (waited >= timeout) {
        resolve();
      } else {
        waited += interval;
        setTimeout(check, interval);
      }
    };

    check();
  });
}

export default function SessionBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createPagesBrowserClient({
      cookieOptions:
        process.env.NODE_ENV === 'production'
          ? {
              name: 'sb',
              domain: 'main.d3a9q3v3j43fq8.amplifyapp.com',
              path: '/',
              sameSite: 'lax',
              secure: true,
            }
          : {
              name: 'sb',
              domain: 'localhost',
              path: '/',
              sameSite: 'lax',
              secure: false,
            },
    });

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.warn('[SessionBridge] No valid session', error?.message);
        return;
      }

      console.info('[SessionBridge] Session detected');

      const isFromStripe = searchParams.get('checkout') === 'success';
      await waitForAuthCookie(isFromStripe ? 5000 : 3000);

      router.refresh();
    };

    syncSession();
  }, [router, searchParams]);

  return null;
}
