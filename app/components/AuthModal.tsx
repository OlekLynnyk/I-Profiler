'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { getRedirectTo } from '@/utils/getRedirectTo';
import GlobalLoading from '@/app/loading';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const shellRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  // lock scroll + esc + focus
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches === true;
    // Фокусируем email только на десктопе, чтобы на мобиле не открывалась клавиатура
    if (!isTouch) {
      setTimeout(() => emailRef.current?.focus(), 0);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // клик по фону
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === shellRef.current) onClose();
  };

  const handleGoogleLogin = async () => {
    setError('');
    if (!agree) {
      setError('You must agree to the Terms to continue.');
      return;
    }

    setRedirecting(true);
    localStorage.setItem('agreed_to_terms', 'true');

    requestAnimationFrame(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getRedirectTo(), queryParams: { prompt: 'select_account' } },
      });
      if (error) {
        setRedirecting(false);
        setError(error.message);
      }
    }); // закрывает requestAnimationFrame
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
      if (error) setError(error.message);
      else {
        onClose();
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getRedirectTo() },
      });
      if (error) setError(error.message);
      else {
        localStorage.setItem('agreed_to_terms', 'true');
        setInfo('Check your email to confirm your registration.');
      }
    }
  };

  if (redirecting) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <GlobalLoading />
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      onMouseDown={onBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center px-4
                 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      {/* мягкий glow под карточкой */}
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-md h-[360px] top-1/2 -translate-y-1/2 bg-purple-500/10 blur-3xl rounded-[48px]" />

      <div
        ref={dialogRef}
        className="relative w-[92%] max-w-md max-h-[90vh] overflow-y-auto
                   rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur
                   shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-6 sm:p-7 text-white"
      >
        <div className="flex items-start justify-between">
          <h2 id="auth-title" className="text-lg font-semibold tracking-tight">
            Welcome to H1NTED
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-white/70 hover:text-white
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="mt-5 w-full inline-flex items-center justify-center gap-3
                     rounded-xl px-4 py-3 bg-white/[0.08] hover:bg-white/[0.12]
                     ring-1 ring-white/15 text-white
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>

        <div className="my-5 text-center text-xs text-white/50">
          or enter your email and password
        </div>

        {/* Inputs */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
          className="space-y-3"
        >
          <input
            ref={emailRef}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/[0.06] ring-1 ring-white/10
                       px-4 py-3 text-base sm:text-sm placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/[0.06] ring-1 ring-white/10
                       px-4 py-3 text-base sm:text-sm placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />

          {/* согласие */}
          <label className="mt-1.5 flex items-start gap-3 text-xs text-white/70">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent
                         text-purple-400 focus:ring-purple-300/60"
            />
            <span className="leading-tight">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                className="underline decoration-purple-300/40 underline-offset-4 hover:text-white"
              >
                Terms of Use
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                className="underline decoration-purple-300/40 underline-offset-4 hover:text-white"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>

          {error && <div className="text-red-300 text-xs">{error}</div>}
          {info && <div className="text-green-300 text-xs">{info}</div>}

          <button
            type="submit"
            disabled={!agree || !email || !password}
            className="mt-4 w-full rounded-full px-5 py-3
                       bg-purple-500/20 text-white
                       ring-1 ring-purple-300/30 backdrop-blur
                       hover:bg-purple-500/30 hover:ring-purple-300/50
                       disabled:opacity-60
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* нижняя панель */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-300 hover:text-purple-200 underline underline-offset-4 decoration-purple-300/40"
          >
            {isLogin ? 'Create an account' : 'Already have an account? Log in'}
          </button>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 rounded-md px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
