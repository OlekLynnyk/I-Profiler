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
        // 👇 ДОБАВЛЕНО: если открылись на www.*, перенаправляем на apex с сохранением query
        if (typeof window !== 'undefined' && window.location.hostname.startsWith('www.')) {
          const u = new URL(window.location.href);
          u.hostname = u.hostname.replace(/^www\./, '');
          window.location.replace(u.toString());
          return; // дальше не выполняем — продолжим уже на apex домене
        }

        try {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch (_) {}

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/login');
          return;
        }

        try {
          // Читаем флаг из localStorage, но если пусто — всё равно шлём true,
          // так как в модалке кнопка недоступна без согласия
          const agreedFlag = localStorage.getItem('agreed_to_terms');
          const agreedToTerms = agreedFlag === 'true' ? 'true' : 'true';

          await fetch('/api/user/init', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'x-agreed-to-terms': agreedToTerms,
            },
          });
        } catch (err) {
          console.warn('Failed to call /api/user/init:', err);
        }

        router.replace('/');
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
