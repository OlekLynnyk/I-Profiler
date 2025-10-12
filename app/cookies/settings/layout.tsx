import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Settings',
};

export default function CookiesSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
