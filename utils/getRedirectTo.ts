// utils/getRedirectTo.ts
export function getRedirectTo(path = '/auth/callback') {
  // Клиент: как было
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}${path}`;
  }
  // Сервер (SSR/пререндер): НЕ трогаем браузерные API
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  // Если переменная не задана — вернём undefined (совместимо с текущим кодом)
  return base ? `${base}${path}` : undefined;
}
