// utils/consent.ts
export type ConsentValue = 'accepted' | 'rejected' | 'necessary';

const COOKIE_NAME = 'cookie_consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

// ---------- Legacy (совместимость) ----------
/** Читает значение согласия из cookie_consent (legacy-формат) */
export function getConsentFromCookie(): ConsentValue | null {
  if (typeof document === 'undefined') return null;
  const pair = document.cookie.split('; ').find((r) => r.startsWith(`${COOKIE_NAME}=`));
  const v = pair?.split('=')[1];
  return v === 'accepted' || v === 'rejected' || v === 'necessary' ? v : null;
}

/** Ставит cookie_consent (legacy-формат). Secure — только на https */
export function setConsentCookie(value: ConsentValue): void {
  const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const attrs = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${ONE_YEAR}`,
    'SameSite=Lax',
    ...(isHttps ? ['Secure'] : []),
  ];
  document.cookie = attrs.join('; ');
}

/**
 * Мигрирует старое значение из localStorage('cookieConsent') в cookie_consent,
 * если cookie ещё нет. Возвращает итоговое значение или null.
 */
export function migrateLegacyConsentIfNeeded(): ConsentValue | null {
  if (typeof window === 'undefined') return null;

  const existing = getConsentFromCookie();
  if (existing) return existing;

  try {
    const legacy = localStorage.getItem('cookieConsent');
    if (legacy === 'accepted' || legacy === 'rejected' || legacy === 'necessary') {
      setConsentCookie(legacy);
      return legacy;
    }
  } catch {}
  return null;
}

// Версия баннера (для журнала)
export const BANNER_VERSION = '1.0.0';

// ---------- Единый формат (V1) ----------
export type ConsentPref = 'accepted' | 'rejected' | 'necessary' | 'custom';
export type Categories = { functional: boolean; analytics: boolean; marketing: boolean };
export type ConsentState = { pref: ConsentPref; cat: Categories };

export function stateFromPref(pref: ConsentValue): ConsentState {
  if (pref === 'accepted') {
    return { pref: 'accepted', cat: { functional: true, analytics: true, marketing: true } };
  }
  if (pref === 'rejected') {
    return { pref: 'rejected', cat: { functional: false, analytics: false, marketing: false } };
  }
  return { pref: 'necessary', cat: { functional: false, analytics: false, marketing: false } };
}

export function buildExtendedCookieValue(state: ConsentState): string {
  if (state.pref === 'accepted' || state.pref === 'rejected' || state.pref === 'necessary') {
    return state.pref; // короткий формат для совместимости
  }
  const f = state.cat.functional ? '1' : '0';
  const a = state.cat.analytics ? '1' : '0';
  const m = state.cat.marketing ? '1' : '0';
  const ts = Math.floor(Date.now() / 1000);
  return `V1|pref=custom|f=${f}|a=${a}|m=${m}|ts=${ts}`;
}

export function setConsentExtendedCookie(state: ConsentState): void {
  const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const value = buildExtendedCookieValue(state);
  const attrs = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${ONE_YEAR}`,
    'SameSite=Lax',
    ...(isHttps ? ['Secure'] : []),
  ];
  document.cookie = attrs.join('; ');
  try {
    window.dispatchEvent(new CustomEvent('CONSENT_UPDATED', { detail: state }));
  } catch {}
}

// ---------- Журнал согласий ----------
const CONSENT_ID_COOKIE = 'consent_id';
const TWO_YEARS = 60 * 60 * 24 * 365 * 2;

export function getOrCreateConsentId(): string {
  if (typeof document === 'undefined') return '';
  const pair = document.cookie.split('; ').find((r) => r.startsWith(`${CONSENT_ID_COOKIE}=`));
  if (pair) return pair.split('=')[1];

  // UUID v4 (без внешних библиотек), с fallback если randomUUID недоступен
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
          const rnd =
            typeof crypto !== 'undefined' && crypto.getRandomValues
              ? crypto.getRandomValues(new Uint8Array(1))[0] & 15
              : Math.floor(Math.random() * 16);
          const val = ch === 'x' ? rnd : (rnd & 0x3) | 0x8;
          return val.toString(16);
        });

  const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const attrs = [
    `${CONSENT_ID_COOKIE}=${uuid}`,
    'Path=/',
    `Max-Age=${TWO_YEARS}`,
    'SameSite=Lax',
    ...(isHttps ? ['Secure'] : []),
  ];
  document.cookie = attrs.join('; ');
  return uuid;
}

export async function logConsent(payload: {
  pref: string;
  f?: 0 | 1;
  a?: 0 | 1;
  m?: 0 | 1;
  banner_version: string;
  locale?: string;
  region?: string;
}) {
  const consent_id = getOrCreateConsentId();
  try {
    await fetch('/api/user/log-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ consent_id, ...payload, ts: Date.now() }),
    });
  } catch {}
}

// ---------- Runtime: активация отложенных скриптов ----------
function __readConsentRaw(): string | null {
  if (typeof document === 'undefined') return null;
  const pair = document.cookie.split('; ').find((r) => r.startsWith(`${COOKIE_NAME}=`));
  return pair ? pair.split('=')[1] : null;
}

/** Парсим legacy и V1|pref=...|f=1|a=0|m=0|ts=... — для рантайма */
function __parseConsent(): { pref: ConsentPref; cat: Categories } | null {
  const val = __readConsentRaw();
  if (!val) return null;

  // legacy
  if (!val.startsWith('V1|')) {
    if (val === 'accepted') {
      return { pref: 'accepted', cat: { functional: true, analytics: true, marketing: true } };
    }
    if (val === 'rejected' || val === 'necessary') {
      return {
        pref: val as ConsentPref,
        cat: { functional: false, analytics: false, marketing: false },
      };
    }
    return null;
  }

  // V1
  const parts = val.split('|').slice(1);
  const map = Object.fromEntries(parts.map((s) => s.split('=')).filter((x) => x.length === 2));
  const pref = (map['pref'] as ConsentPref) || 'custom';
  const cat: Categories = {
    functional: map['f'] === '1',
    analytics: map['a'] === '1',
    marketing: map['m'] === '1',
  };
  if (pref === 'accepted') cat.functional = cat.analytics = cat.marketing = true;
  if (pref === 'rejected' || pref === 'necessary')
    cat.functional = cat.analytics = cat.marketing = false;
  return { pref, cat };
}

/**
 * Активирует <script type="text/plain" data-consent="functional|analytics|marketing">
 * (или всё при pref=accepted). Поддерживает data-src (+ data-async / data-defer) и inline.
 */
export function applyConsentToPage(): void {
  const state = __parseConsent();
  if (!state) return;

  const allow = (k: string) =>
    k === 'functional'
      ? state.cat.functional
      : k === 'analytics'
        ? state.cat.analytics
        : k === 'marketing'
          ? state.cat.marketing
          : false;

  const stubs = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-consent]')
  );

  for (const stub of stubs) {
    const cat = (stub.getAttribute('data-consent') || '').trim();
    if (!(state.pref === 'accepted' || allow(cat))) continue;

    const real = document.createElement('script');

    // перенести все атрибуты кроме служебных
    for (const { name, value } of Array.from(stub.attributes)) {
      if (name === 'type' || name === 'data-consent' || name === 'data-src') continue;
      real.setAttribute(name, value);
    }

    const dataSrc = stub.getAttribute('data-src');
    if (dataSrc) {
      real.src = dataSrc;
      if (stub.hasAttribute('data-async')) real.async = true;
      if (stub.hasAttribute('data-defer')) (real as any).defer = true;
    } else {
      real.textContent = stub.textContent || '';
    }
    real.type = 'text/javascript';

    stub.replaceWith(real);
  }
}

/** Переприменяет согласие при событии из баннера/страницы настроек */
export function attachConsentListener(): void {
  window.addEventListener('CONSENT_UPDATED', () => {
    applyConsentToPage();
  });
}
