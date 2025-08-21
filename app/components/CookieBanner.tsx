'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (visible && bannerRef.current) bannerRef.current.focus();
  }, [visible]);

  const handleConsent = (value: 'accepted' | 'rejected') => {
    localStorage.setItem('cookieConsent', value);
    setVisible(false);
    document.body.style.overflow = '';
    if (value === 'accepted') window.location.reload();
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* Cookie Banner */}
      <div
        ref={bannerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:max-w-5xl z-50 outline-none"
      >
        {/* мягкий фиолетовый glow позади карточки */}
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-40 mx-auto max-w-3xl bg-purple-500/10 blur-3xl rounded-[48px]" />

        <div
          className="relative bg-white/[0.06] ring-1 ring-white/10 backdrop-blur
                        text-white rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                        px-5 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center
                        justify-between gap-4"
        >
          <h2 id="cookie-banner-title" className="sr-only">
            Cookie notice
          </h2>

          <span id="cookie-banner-desc" className="text-sm leading-relaxed text-white/90">
            We use cookies to improve your experience. See our{' '}
            <Link
              href="/privacy"
              className="underline decoration-purple-300/40 underline-offset-4
                         hover:text-white focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-purple-300/60
                         rounded"
            >
              Cookie Notice
            </Link>{' '}
            for details.
          </span>

          <div className="flex flex-row items-center gap-2">
            <button
              onClick={() => handleConsent('rejected')}
              className="rounded-full px-5 py-2.5 bg-white/[0.06] ring-1 ring-white/10
                         hover:bg-white/[0.1] text-white text-sm backdrop-blur
                         focus:outline-none focus-visible:ring-2
                         focus-visible:ring-purple-300/60 transition"
            >
              Reject all
            </button>
            <button
              onClick={() => handleConsent('accepted')}
              className="rounded-full px-5 py-2.5 bg-purple-500/20 ring-1 ring-purple-300/30
                         hover:bg-purple-500/30 hover:ring-purple-300/50
                         text-white text-sm backdrop-blur
                         focus:outline-none focus-visible:ring-2
                         focus-visible:ring-purple-300/60 transition"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
