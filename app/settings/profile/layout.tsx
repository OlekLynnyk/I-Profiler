import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Settings',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
