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

  // ✅ ДОБАВЛЕНИЯ ТОЛЬКО ПО ПУНКТАМ (ничего не удалено)
  icons: [
    // существующие
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'shortcut icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-icon.png' }, // public/apple-icon.png

    // 🔹 для обычной вкладки в Safari/других (PNG с размерами)
    { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },

    // 🔹 явное указание размера для apple-touch (иногда помогает Safari)
    { rel: 'apple-touch-icon', url: '/apple-icon.png', sizes: '180x180' },

    // 🔹 pinned tab в Safari (монохромный SVG; Safari перекрашивает сам)
    { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#111111' },
  ],

  // ✅ для Android/Chrome и PWA-контекстов
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
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
