// utils/getRedirectTo.ts
export function getRedirectTo(path = '/auth/callback') {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}${path}`;
}
