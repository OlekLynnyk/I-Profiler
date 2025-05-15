'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data }: { data: { session: Session | null } } = await supabase.auth.getSession();

      if (data.session) {
        router.replace('/');
      } else {
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  return <p className="p-8 text-center">Redirecting...</p>;
}
