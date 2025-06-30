'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleGoogleLogin = async () => {
    setError('');
    if (!agree) {
      setError('You must agree to the Terms to continue.');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) setError(error.message);
  };

  const handleAuth = async () => {
    setError('');
    setInfo('');

    if (!agree) {
      setError('You must agree to the Terms to continue.');
      return;
    }

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        onClose();
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        localStorage.setItem('agreed_to_terms', 'true');
        setInfo('Check your email to confirm your registration.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div ref={modalRef} className="bg-white text-black w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-bold text-center">Welcome to I,Profiler</h2>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Continue with Google
        </button>

        <div className="text-center text-gray-500 text-sm">or enter your email and password</div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded text-black"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <label className="text-sm text-gray-600">
              I agree to the <a href="/terms" className="underline" target="_blank">Terms of Use</a> and <a href="/privacy" className="underline" target="_blank">Privacy Policy</a>
            </label>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {info && <div className="text-green-600 text-sm">{info}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-600 pt-2">
          <button onClick={() => setIsLogin(!isLogin)} className="underline">
            {isLogin ? 'Create an account' : 'Already have an account? Log in'}
          </button>
          <button onClick={onClose} className="underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
