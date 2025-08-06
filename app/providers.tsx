'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from './context/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  );
}
