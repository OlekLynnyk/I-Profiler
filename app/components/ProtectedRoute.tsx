'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const isVerified = !!userData.user?.email_confirmed_at;
      if (!isVerified) {
        router.replace('/login?unverified=1');
        return;
      }

      setAllowed(true);
    };

    checkSession();
  }, [router]);

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
