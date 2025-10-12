'use client';

import { useEffect, useState, useRef } from 'react';
import {
  getConsentFromCookie,
  setConsentCookie,
  migrateLegacyConsentIfNeeded,
  type ConsentValue,
  stateFromPref,
  setConsentExtendedCookie,
  logConsent,
  BANNER_VERSION,
} from '@/utils/consent';

const ACCENT = '#A855F7';
const DIALOG_TITLE_ID = 'cookie-banner-title';
const DIALOG_DESC_ID = 'cookie-banner-desc';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // миграция legacy → cookie
    const consent = migrateLegacyConsentIfNeeded() ?? getConsentFromCookie();
    if (!consent) setVisible(true);
  }, []);

  // автофокус + Escape
  useEffect(() => {
    if (visible && bannerRef.current) {
      previouslyFocusedEl.current = document.activeElement as HTMLElement | null;
      bannerRef.current.focus();
    }
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  // focus-trap внутри диалога (без изменения визуала)
  useEffect(() => {
    if (!visible) return;
    const root = bannerRef.current;
    if (!root) return;

    const getFocusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([type="hidden"]):not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(',')
        )
      );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const nodes = getFocusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  // возврат фокуса источнику после закрытия
  useEffect(() => {
    if (visible) return;
    previouslyFocusedEl.current?.focus?.();
  }, [visible]);

  // глобальная функция
  useEffect(() => {
    (window as any).__openCookieBanner = () => setVisible(true);
    return () => {
      try {
        delete (window as any).__openCookieBanner;
      } catch {}
    };
  }, []);

  const handleConsent = (value: ConsentValue) => {
    // 1) legacy (совместимость)
    setConsentCookie(value);

    // 2) V1 расширенный
    const s = stateFromPref(value);
    setConsentExtendedCookie(s);

    // 3) событие рантайму/странице
    try {
      window.dispatchEvent(new CustomEvent('CONSENT_UPDATED', { detail: { pref: value } }));
    } catch {}

    // 4) журнал
    logConsent({
      pref: value,
      f: s.cat.functional ? 1 : 0,
      a: s.cat.analytics ? 1 : 0,
      m: s.cat.marketing ? 1 : 0,
      banner_version: BANNER_VERSION,
      locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
    });

    setVisible(false);

    // 5) Активировать отложенные скрипты (простая стратегия — перезагрузка)
    if (value === 'accepted') window.location.reload();
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={DIALOG_TITLE_ID}
      aria-describedby={DIALOG_DESC_ID}
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

        {/* скрытый заголовок для скринридера — не меняет визуал */}
        <h2 id={DIALOG_TITLE_ID} className="sr-only">
          Cookie preferences
        </h2>

        <div id={DIALOG_DESC_ID} className="max-w-[60ch] text-sm leading-relaxed text-white/90">
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
          . {/* Лёгкий доступ к настройкам без добавления кнопки в ряд (не меняем макет) */}
          <a
            href="/cookies/settings"
            className="underline decoration-purple-300/40 underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded"
          >
            Customize
          </a>
        </div>

        <div className="flex flex-row items-center gap-2 shrink-0">
          <button
            onClick={() => handleConsent('rejected')}
            className="relative rounded-full px-5 py-2.5 text-sm text-white/90 bg-black/30 ring-1 ring-white/15 transition-[background,transform,ring] duration-200 hover:bg-black/40 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
            style={{
              backgroundImage: `
                radial-gradient(110% 110% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%),
                linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))
              `,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            Reject all
          </button>

          <button
            onClick={() => {
              window.location.href = '/cookies/settings';
            }}
            className="relative rounded-full px-5 py-2.5 text-sm text-white/90 bg-black/30 ring-1 ring-white/15 transition-[background,transform,ring] duration-200 hover:bg-black/40 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
            style={{
              backgroundImage: `
               radial-gradient(110% 110% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%),
               linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))
              `,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            Customize
          </button>

          <button
            onClick={() => handleConsent('accepted')}
            className="relative rounded-full px-5 py-2.5 text-sm text-[#111827] transition-[background,transform,ring] duration-200 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
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
  );
}
