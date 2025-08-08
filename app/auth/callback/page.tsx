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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/login');
          return;
        }

        try {
          await fetch('/api/user/init', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'x-agreed-to-terms': localStorage.getItem('agreed_to_terms') || 'false',
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
