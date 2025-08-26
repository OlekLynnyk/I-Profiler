'use client';

import { useEffect, useState, useRef } from 'react';

const ACCENT = '#A855F7';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setVisible(true);
  }, []);

  useEffect(() => {
    if (visible && bannerRef.current) bannerRef.current.focus();
  }, [visible]);

  const handleConsent = (value: 'accepted' | 'rejected') => {
    localStorage.setItem('cookieConsent', value);
    setVisible(false);
    if (value === 'accepted') window.location.reload();
  };

  if (!visible) return null;

  return (
    <>
      <div
        ref={bannerRef}
        tabIndex={-1}
        role="region"
        aria-label="Cookie notice"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,880px)] outline-none"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 mx-auto rounded-[48px] blur-3xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 0%, rgba(168,85,247,0.16) 0%, rgba(168,85,247,0) 70%)',
          }}
        />

        <div
          className="
            relative rounded-2xl bg-white/[0.06] backdrop-blur-md ring-1 ring-white/10
            shadow-[0_20px_80px_rgba(0,0,0,0.45)] px-5 sm:px-6 py-4
            text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-transparent via-white/18 to-transparent" />

          <div className="max-w-[60ch] text-sm leading-relaxed text-white/90">
            We use cookies to improve your experience. See our{' '}
            <a
              href="/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-purple-300/40 underline-offset-4 hover:text-white
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded"
            >
              Cookie Notice
            </a>
            .
          </div>

          <div className="flex flex-row items-center gap-2 shrink-0">
            <button
              onClick={() => handleConsent('rejected')}
              className="
                rounded-full px-5 py-2.5 text-sm text-white
                bg-white/[0.06] backdrop-blur-md ring-1 ring-white/10
                transition-[background,transform,ring] duration-200
                hover:bg-white/[0.10] hover:-translate-y-[1px] focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[#A855F7]/60
              "
            >
              Reject all
            </button>

            <button
              onClick={() => handleConsent('accepted')}
              className="
                relative rounded-full px-5 py-2.5 text-sm text-[#111827]
                transition-[background,transform,ring] duration-200
                hover:-translate-y-[1px] focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[#A855F7]/60
              "
              style={{
                backgroundImage: `
                  radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 60%),
                  linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.84))
                `,
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.10)',
                border: '1px solid rgba(168,85,247,0.35)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-full opacity-60 blur-[6px]"
                style={{
                  background:
                    'radial-gradient(70% 70% at 50% 0%, rgba(168,85,247,0.25) 0%, rgba(168,85,247,0) 70%)',
                }}
              />
              <span className="relative z-[1]">Accept all</span>
            </button>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 -bottom-3 h-6 rounded-[999px] bg-black/30 blur-xl"
        />
      </div>
    </>
  );
}
