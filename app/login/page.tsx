'use client';

import { useRouter } from 'next/navigation';
import AuthModal from '@/app/components/AuthModal'; // проверь путь

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthModal
      onClose={() => {
        router.replace('/');
      }}
    />
  );
}
