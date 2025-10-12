'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion, useReducedMotion } from 'framer-motion';
import GlobalLoading from '@/app/loading';
import {
  getConsentFromCookie,
  setConsentCookie,
  type ConsentValue,
  type ConsentState,
  setConsentExtendedCookie,
  stateFromPref,
  logConsent,
  BANNER_VERSION,
} from '@/utils/consent';

const ACCENT = '#A855F7';

// Локальный парсер только для чтения текущего значения V1 (оставляем)
const COOKIE_NAME = 'cookie_consent';
function parseExtendedCookieFromDocument(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const pair = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!pair) return null;

  const val = pair.split('=')[1] ?? '';
  if (!val) return null;

  if (!val.startsWith('V1|')) {
    if (val === 'accepted')
      return { pref: 'accepted', cat: { functional: true, analytics: true, marketing: true } };
    if (val === 'rejected' || val === 'necessary') {
      return { pref: val, cat: { functional: false, analytics: false, marketing: false } };
    }
    return null;
  }

  const parts = val.split('|').slice(1);
  const map = Object.fromEntries(parts.map((s) => s.split('=')).filter((x) => x.length === 2));
  return {
    pref: (map['pref'] as ConsentState['pref']) || 'custom',
    cat: {
      functional: map['f'] === '1',
      analytics: map['a'] === '1',
      marketing: map['m'] === '1',
    },
  };
}

export default function CookieSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<ConsentState>({
    pref: 'necessary',
    cat: { functional: false, analytics: false, marketing: false },
  });
  const [message, setMessage] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  const reduce = useReducedMotion();

  // init: читаем расширенный формат; если нет — берем legacy
  useEffect(() => {
    const ext = parseExtendedCookieFromDocument();
    if (ext) {
      setCurrent(ext);
      setLoading(false);
      return;
    }
    const legacy = getConsentFromCookie();
    setCurrent(stateFromPref((legacy ?? 'necessary') as ConsentValue));
    setLoading(false);
  }, []);

  const statusChip = useMemo(() => {
    if (!current?.pref)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300 ring-1 ring-red-400/20">
          <XCircleIcon className="h-4 w-4" /> Not set
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-300 ring-1 ring-green-400/20">
        <CheckCircleIcon className="h-4 w-4" /> Active
      </span>
    );
  }, [current]);

  const applyPref = (value: ConsentValue) => {
    setConsentCookie(value); // legacy
    const state = stateFromPref(value); // V1
    setConsentExtendedCookie(state);

    setCurrent(state);
    setMessage(
      value === 'accepted'
        ? 'All cookies enabled.'
        : value === 'rejected'
          ? 'All non-essential cookies disabled.'
          : 'Only necessary cookies enabled.'
    );

    // журнал
    logConsent({
      pref: value,
      f: state.cat.functional ? 1 : 0,
      a: state.cat.analytics ? 1 : 0,
      m: state.cat.marketing ? 1 : 0,
      banner_version: BANNER_VERSION,
      locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
    });

    if (value === 'accepted') window.location.reload();
  };

  const toggle = (key: keyof ConsentState['cat']) => {
    setCurrent((prev) => {
      const cat = { ...(prev.cat ?? { functional: false, analytics: false, marketing: false }) };
      cat[key] = !cat[key];
      return { pref: 'custom', cat };
    });
  };

  const saveCustom = () => {
    const state: ConsentState = {
      pref: 'custom',
      cat: current.cat ?? { functional: false, analytics: false, marketing: false },
    };
    setConsentExtendedCookie(state);
    setCurrent(state);
    setMessage('Custom preferences saved.');

    logConsent({
      pref: 'custom',
      f: state.cat.functional ? 1 : 0,
      a: state.cat.analytics ? 1 : 0,
      m: state.cat.marketing ? 1 : 0,
      banner_version: BANNER_VERSION,
      locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
    });
  };

  if (loading) return <GlobalLoading />;

  return (
    <div className="min-h-screen w-full bg-[#1A1E23] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none -mb-6 mx-auto h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl"
        />
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.5 } }}
          className="relative rounded-3xl bg-white/5 backdrop-blur ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)] p-5 md:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-[#A855F7]/30 bg-[#A855F7]/15">
              <ShieldCheckIcon className="h-6 w-6 text-[#E9D5FF]" />
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight">Cookie Settings</h1>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/80">
                <span className="font-medium text-white/90">Current preference:</span>{' '}
                <span className="text-white">{current.pref ?? '— not set'}</span>
              </span>
              {statusChip}
            </div>
            <div className="border-t border-white/10" />

            <div className="text-white/80">
              We use cookies to operate the site (necessary) and, with your permission, for
              analytics and marketing. Choose one option below or customize categories.
              Non-essential cookies are blocked until you give consent.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPref('rejected')}
                className="relative rounded-full px-5 py-2.5 text-sm text-white/90 bg-black/30 ring-1 ring-white/15 transition-[background,transform,ring] duration-200 hover:bg-black/40 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                style={{
                  backgroundImage: `radial-gradient(110% 110% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                Reject all
              </button>

              <button
                type="button"
                onClick={() => applyPref('necessary')}
                className="relative rounded-full px-5 py-2.5 text-sm text-white/90 bg-black/30 ring-1 ring-white/15 transition-[background,transform,ring] duration-200 hover:bg-black/40 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                style={{
                  backgroundImage: `radial-gradient(110% 110% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                Only necessary
              </button>

              <button
                type="button"
                onClick={() => applyPref('accepted')}
                className="relative rounded-full px-5 py-2.5 text-sm text-[#111827] transition-[background,transform,ring] duration-200 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                style={{
                  backgroundImage: `radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 60%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.84))`,
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

              <button
                type="button"
                onClick={() => setCustomOpen((v) => !v)}
                className="relative rounded-full px-5 py-2.5 text-sm text-white/90 bg-black/30 ring-1 ring-white/15 transition-[background,transform,ring] duration-200 hover:bg-black/40 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                style={{
                  backgroundImage: `radial-gradient(110% 110% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
                aria-expanded={customOpen}
              >
                Customize
              </button>
            </div>

            {customOpen && (
              <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white/80">
                      <span className="font-medium text-white/90">Necessary</span>{' '}
                      <span className="text-white/60">— required for the service</span>
                    </div>
                    <span
                      className="inline-flex items-center h-8 px-3 rounded-full text-[12px] ring-1 ring-white/15 bg-black/30 text-white/70"
                      aria-disabled="true"
                    >
                      Always on
                    </span>
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  {(['functional', 'analytics', 'marketing'] as const).map((k) => (
                    <div key={k} className="flex items-center justify-between">
                      <div className="text-white/80">
                        <span className="font-medium text-white/90">
                          {k[0].toUpperCase() + k.slice(1)}
                        </span>{' '}
                        <span className="text-white/60">
                          {k === 'functional'
                            ? '— preferences & helpers'
                            : k === 'analytics'
                              ? '— usage insights'
                              : '— ads & retargeting'}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={current.cat[k]}
                        onClick={() => toggle(k)}
                        className="relative inline-flex h-8 w-14 items-center rounded-full ring-1 ring-white/15 bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white/80 transition ${current.cat[k] ? 'translate-x-7' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={saveCustom}
                      className="relative rounded-full px-5 py-2.5 text-sm text-[#111827] transition-[background,transform,ring] duration-200 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                      style={{
                        backgroundImage: `radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 60%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.84))`,
                        boxShadow:
                          'inset 0 2px 0 rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.10)',
                        border: '1px solid rgba(168,85,247,0.35)',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {message && <p className="text-xs text-white/70">{message}</p>}

            <div className="border-t border-white/10" />

            <div className="text-white/70">
              Non-essential cookies are used on the basis of your consent. Necessary cookies are
              used to provide the service. See our{' '}
              <a
                href="/cookies"
                className="underline decoration-purple-300/40 underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookie Notice
              </a>
              .
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => (window as any).__openCookieBanner?.()}
                className="text-white/70 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded"
              >
                Open cookie banner
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
