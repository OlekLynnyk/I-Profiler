'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getRedirectTo } from '@/utils/getRedirectTo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push('/');
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectTo(),
      },
    });
    if (error) setError(error.message);
    else alert('Check your email to confirm');
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectTo() },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <button onClick={handleGoogle} className="w-full bg-black text-white p-2 rounded">
        Sign in with Google
      </button>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white p-2 rounded">
          Login
        </button>
        <button onClick={handleSignup} className="flex-1 bg-gray-600 text-white p-2 rounded">
          Signup
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
