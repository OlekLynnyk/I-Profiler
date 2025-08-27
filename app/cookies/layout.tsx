// app/cookies/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies Policy',
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
