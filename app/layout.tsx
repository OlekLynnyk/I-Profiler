// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Providers } from './providers';
import LayoutClient from './LayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

// ✅ динамическая база, чтобы favicon корректно работал и на проде, и локально
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://h1nted.com' : 'http://localhost:3000');

export const metadata: Metadata = {
  title: {
    default: 'H1NTED',
    template: 'H1NTED · %s',
  },
  description: 'A scalable AI profiling assistant',
  metadataBase: new URL(BASE_URL),

  // ✅ универсальный набор линков для десктопа/мобилок
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'shortcut icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-icon.png' }, // public/apple-icon.png
  ],

  // ✅ для Android/Chrome и PWA-контекстов
  manifest: '/manifest.webmanifest',
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
