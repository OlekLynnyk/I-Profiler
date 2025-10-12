// app/cookies/cookies.registry.ts
export type CookieRow = {
  name: string; // имя или паттерн
  purpose: string; // назначение
  retention: string; // срок хранения (читаемым текстом)
  type: '1st party' | '3rd party';
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  provider?: string; // вендор
};

export const COOKIES_AND_SDKS: CookieRow[] = [
  // Necessary
  {
    name: 'h1_session / h1_auth',
    purpose: 'Sign-in / session continuity',
    retention: 'Session / up to 24h',
    type: '1st party',
    category: 'necessary',
    provider: 'H1NTED',
  },
  {
    name: 'csrf_token',
    purpose: 'CSRF protection',
    retention: 'Session',
    type: '1st party',
    category: 'necessary',
    provider: 'H1NTED',
  },
  {
    name: '__stripe_mid, __stripe_sid',
    purpose: 'Fraud prevention & checkout',
    retention: 'Up to 1 year / ~30 min',
    type: '3rd party',
    category: 'necessary',
    provider: 'Stripe',
  },
  {
    name: 'cookie_consent',
    purpose: 'Stores your cookie choices',
    retention: 'Up to 12 months',
    type: '1st party',
    category: 'necessary',
    provider: 'H1NTED',
  },

  // Analytics (пример — пока выключено по умолчанию)
  {
    name: '_ga',
    purpose: 'Google Analytics — anonymized user id',
    retention: '2 years',
    type: '3rd party',
    category: 'analytics',
    provider: 'Google',
  },
  {
    name: '_ga_<container>',
    purpose: 'Google Analytics — session state',
    retention: '2 years',
    type: '3rd party',
    category: 'analytics',
    provider: 'Google',
  },

  // Marketing (placeholder, если появится)
  // { name: 'fbp', purpose: 'Meta Pixel', retention: '3 months', type: '3rd party', category: 'marketing', provider: 'Meta' },
];
