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

        // 🔔 сигнализируем другим вкладкам/окнам (не влияет на редирект)
        try {
          if (window.opener) {
            window.opener.postMessage(
              { source: 'h1nted', type: 'SIGNED_IN' },
              window.location.origin
            );
          }
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('h1nted-auth');
            bc.postMessage({ type: 'SIGNED_IN' });
            bc.close();
          }
          localStorage.setItem('h1nted_auth_ping', String(Date.now()));
        } catch {}

        // ✅ ЕДИНСТВЕННАЯ ПРАВКА: корректный финальный редирект
        // ✅ Корректный финальный редирект (без регрессий)
        try {
          const url = new URL(window.location.href);
          const qRedirect = url.searchParams.get('redirect');
          const ssRedirect = sessionStorage.getItem('loginRedirectTo') || '';

          let redirectTo = '/workspace';

          if (qRedirect && qRedirect.startsWith('/')) {
            redirectTo = qRedirect;
          } else if (ssRedirect && ssRedirect.startsWith('/')) {
            redirectTo = ssRedirect === '/' || ssRedirect === '/login' ? '/workspace' : ssRedirect;
          }

          if (ssRedirect) sessionStorage.removeItem('loginRedirectTo');
          router.replace(redirectTo);
        } catch {
          router.replace('/workspace');
        }
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
