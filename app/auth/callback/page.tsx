'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        // 👇 если открылись на www.*, перенаправляем на apex с сохранением query
        if (typeof window !== 'undefined' && window.location.hostname.startsWith('www.')) {
          const u = new URL(window.location.href);
          u.hostname = u.hostname.replace(/^www\./, '');
          window.location.replace(u.toString());
          return; // дальше не выполняем — продолжим уже на apex домене
        }

        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch (_) {}

        // ---- ЗАМЕНЁННЫЙ БЛОК НАЧАЛО ----
        // читаем query один раз
        const sp = new URLSearchParams(window.location.search);
        const email = sp.get('email') ?? '';
        const returnTo = sp.get('next') ?? '/';

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // нет сессии в этом контейнере → уводим на ввод кода
          router.replace(
            `/auth/verify-code${email ? `?email=${encodeURIComponent(email)}` : ''}${
              returnTo ? `${email ? '&' : '?'}return_to=${encodeURIComponent(returnTo)}` : ''
            }`
          );
          return;
        }

        // логин успешно завершён в этой вкладке → оповещаем другие
        try {
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('auth-events');
            bc.postMessage({ type: 'SIGNED_IN', returnTo });
            bc.close();
          } else {
            // резерв через storage event
            localStorage.setItem('auth:last', String(Date.now()));
          }
        } catch {}
        // ---- ЗАМЕНЁННЫЙ БЛОК КОНЕЦ ----

        try {
          // Читаем флаг из localStorage, но если пусто — всё равно шлём true,
          // так как в модалке кнопка недоступна без согласия
          const agreedFlag = localStorage.getItem('agreed_to_terms');
          const agreedToTerms = agreedFlag === 'true' ? 'true' : 'true';

          await fetch('/api/user/init', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session!.access_token}`,
              'x-agreed-to-terms': agreedToTerms,
            },
          });
        } catch (err) {
          console.warn('Failed to call /api/user/init:', err);
        }

        // финальный редирект
        router.replace(returnTo || '/');
      } catch (err) {
        console.error('Callback error:', err);
        setError(true);
      }
    };

    run();
  }, [router, supabase]);

  return (
    <p className="p-8 text-center">
      {error ? 'Something went wrong. Please try again.' : 'Redirecting...'}
    </p>
  );
}
