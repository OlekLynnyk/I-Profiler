'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

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
        queryParams: { prompt: 'select_account' },
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
      <div
        ref={modalRef}
        className="bg-white text-black w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl space-y-5 shadow-xl"
      >
        <h2 className="text-base font-medium text-center text-gray-700">Welcome to I,Profiler</h2>

        <button
          onClick={handleGoogleLogin}
          className="w-[85%] mx-auto border border-gray-300 bg-white text-gray-800 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        <div className="text-center text-gray-500 text-sm">or enter your email and password</div>

        <div className="w-[85%] mx-auto space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-xl placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-xl placeholder-gray-400"
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="accent-neutral-600 mt-1"
              />
              <label className="text-sm text-gray-600">
                I agree to the <a href="/terms" className="underline" target="_blank">Terms of Use</a> and <a href="/privacy" className="underline" target="_blank">Privacy Policy</a>
              </label>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {info && <div className="text-green-600 text-sm">{info}</div>}

            <button
              type="submit"
              className="mx-auto block border border-gray-400 text-gray-700 bg-transparent px-6 py-2 rounded-xl hover:shadow transition mt-2"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="w-[85%] mx-auto flex justify-between text-xs sm:text-sm text-gray-600 pt-2">
          <button onClick={() => setIsLogin(!isLogin)} className="underline">
            {isLogin ? 'Create an account' : 'Already have an account? Log in'}
          </button>
          <button onClick={onClose} className="underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
