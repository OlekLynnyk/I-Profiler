export type CookieRow = {
  name: string;
  purpose: string;
  retention: string;
  type: '1st party' | '3rd party';
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  vendor?: string;
};

export const COOKIES_AND_SDKS: CookieRow[] = [
  {
    name: '_ga',
    purpose: 'Google Analytics - user id (anonymized)',
    retention: '2 years',
    type: '3rd party',
    category: 'analytics',
    vendor: 'Google',
  },
  {
    name: '_ga_<container>',
    purpose: 'Google Analytics - session state',
    retention: '2 years',
    type: '3rd party',
    category: 'analytics',
    vendor: 'Google',
  },
  // добавим остальные как появятся
];
