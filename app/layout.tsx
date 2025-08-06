import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import LayoutClient from './LayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary'; // ← уточни путь при необходимости

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'I,Profiler',
  description: 'A scalable AI profiling assistant',
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
