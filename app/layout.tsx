import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import LayoutClient from './LayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'H1NTED',
    template: 'H1NTED · %s',
  },
  description: 'A scalable AI profiling assistant',
  metadataBase: new URL('https://h1nted.com'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <LayoutClient>{children}</LayoutClient>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
