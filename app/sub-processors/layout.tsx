import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sub-processors',
};

export default function SubProcessorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
