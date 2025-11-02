// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import LayoutClient from './LayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { azeretMono } from './fonts';

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
    <html lang="en" className={azeretMono.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preload" href="/loading/octo-static.webp" as="image" />
        {/* no-flash theme init: применяем .dark/.light до первой покраски */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var key = 'theme';
              var stored = localStorage.getItem(key);
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = stored ? stored : (systemDark ? 'dark' : 'light');
              var root = document.documentElement;
              if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
              // Сразу сообщаем браузеру желаемую палитру (скроллбары, формы и т.п.)
              root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
            } catch (e) {}
          })();
        `,
          }}
        />
      </head>
      <body className="font-monoBrand antialiased bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          <ErrorBoundary>
            <LayoutClient>{children}</LayoutClient>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
