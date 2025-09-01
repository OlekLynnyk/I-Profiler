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
    // 🔒 Удаляем ?code и ?state на финальном редиректе OAuth, чтобы клиент не сделал повторный PKCE-обмен
    if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
      const url = new URL(window.location.href);
      let changed = false;

      if (url.searchParams.has('code')) {
        url.searchParams.delete('code');
        changed = true;
      }
      if (url.searchParams.has('state')) {
        url.searchParams.delete('state');
        changed = true;
      }

      if (changed) {
        const qs = url.searchParams.toString();
        window.history.replaceState(null, '', url.pathname + (qs ? `?${qs}` : ''));
      }
    }

    const supabase = createPagesBrowserClient({
      cookieOptions:
        process.env.NODE_ENV === 'production'
          ? {
              name: 'sb',
              domain: 'h1nted.com',
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
