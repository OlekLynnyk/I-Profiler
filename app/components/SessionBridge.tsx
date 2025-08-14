'use client';

import { useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation'; // ⬅️ добавлено

function waitForAuthCookie(timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    const interval = 100;
    let waited = 0;

    const check = () => {
      if (document.cookie.includes('sb-access-token')) {
        resolve();
      } else if (waited >= timeout) {
        resolve(); // всё равно продолжаем
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
  const searchParams = useSearchParams(); // ⬅️ добавлено

  useEffect(() => {
    const syncSession = async () => {
      const supabase = createPagesBrowserClient();

      const {
        data: { session: clientSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn('[SessionBridge] getSession error:', error.message);
        return;
      }

      if (!clientSession?.access_token || !clientSession?.refresh_token) {
        console.warn('[SessionBridge] No tokens');
        return;
      }

      const { error: setError } = await supabase.auth.setSession({
        access_token: clientSession.access_token,
        refresh_token: clientSession.refresh_token,
      });

      if (setError) {
        console.warn('[SessionBridge] setSession error:', setError.message);
        return;
      }

      console.info('[SessionBridge] Session restored');

      const isFromStripe = searchParams.get('checkout') === 'success'; // ⬅️ новый флаг
      await waitForAuthCookie(isFromStripe ? 5000 : 3000); // ⏳ увеличиваем ожидание
      router.refresh(); // 🔁 повторная отрисовка страницы
    };

    syncSession();
  }, [router, searchParams]); // ⬅️ добавлено

  return null;
}
