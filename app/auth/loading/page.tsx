// app/auth/loading.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlobalLoading from '@/app/loading';

export default function AuthLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const started = performance.now();
    const min = 350;
    const go = () => router.replace('/api/auth/callback');
    const left = min - (performance.now() - started);
    const t = window.setTimeout(go, Math.max(0, left));
    return () => window.clearTimeout(t);
  }, [router]);

  return <GlobalLoading />;
}
