import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; // ⬅️ добавляем сюда
import LayoutClient from './LayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'I,Profiler',
  description: 'A scalable AI profiling assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers> {/* ⬅️ перемещаем сюда */}
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
