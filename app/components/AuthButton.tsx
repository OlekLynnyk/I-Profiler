'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data?.user ?? null);
        setLoading(false);
      }
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => router.push('/login');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  if (loading) return <button disabled className="px-4 py-2 bg-gray-400 rounded">...</button>;

  return (
    <button
      onClick={user ? handleLogout : handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {user ? 'Logout' : 'Login'}
    </button>
  );
}
