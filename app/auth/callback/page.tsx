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
        router.replace('/');
      } else {
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  return <p className="p-8 text-center">Redirecting...</p>;
}
