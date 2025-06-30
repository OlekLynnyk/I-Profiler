'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const token = session.access_token;

        try {
          await fetch('/api/user/init', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'x-agreed-to-terms': localStorage.getItem('agreed_to_terms') || 'false',
            },
          });
        } catch (err) {
          console.warn('Failed to call /api/user/init:', err);
        }

        router.replace('/');
      } else {
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  return <p className="p-8 text-center">Redirecting...</p>;
}
