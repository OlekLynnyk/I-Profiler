'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function VerifyCodePage() {
  const router = useRouter();
  const q = useSearchParams();
  const supabase = createPagesBrowserClient();

  const [email, setEmail] = useState(q.get('email') ?? '');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Если сессия уже есть (ссылка открылась в "нужном" браузере) — уводим сразу дальше
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        const returnTo = q.get('return_to') || '/';
        router.replace(returnTo);
      }
    });
    return () => {
      mounted = false;
    };
  }, [q, router, supabase]);

  const onVerify = async () => {
    if (!email || code.length !== 6 || submitting) return;
    setErr('');
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email', // 6-значный код из письма
      });
      if (error) {
        setErr(error.message);
        return;
      }
      const returnTo = q.get('return_to') || '/';
      router.replace(returnTo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Enter verification code</h1>
      <p className="text-sm text-black/70 mb-4">
        Check your email and paste the 6-digit code here.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onVerify();
        }}
      >
        <input
          type="email"
          inputMode="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 rounded-lg border px-3 py-2"
          autoCapitalize="none"
          autoComplete="email"
          required
        />

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full mb-3 rounded-lg border px-3 py-2"
          autoComplete="one-time-code"
          aria-label="Verification code"
          required
        />

        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

        <button
          type="submit"
          className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
          disabled={!email || code.length !== 6 || submitting}
        >
          {submitting ? 'Verifying…' : 'Verify & continue'}
        </button>
      </form>
    </div>
  );
}
