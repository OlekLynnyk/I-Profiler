'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/app/components/AuthModal';

export default function LoginPage() {
  const router = useRouter();

  // ← добавили
  useEffect(() => {
    document.title = 'H1NTED · Login';
  }, []);

  return (
    <AuthModal
      onClose={() => {
        router.replace('/');
      }}
    />
  );
}
