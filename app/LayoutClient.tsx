'use client';

import { useEffect } from 'react';
import { AuthProvider } from './context/AuthProvider';
import CookieBanner from '@/components/CookieBanner';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useCookieConsent();

  return (
    <AuthProvider>
      {children}
      <CookieBanner />
    </AuthProvider>
  );
}

/**
 * Прод-уровня хук для управления cookie consent.
 *
 * 🚀 Загружает скрипты (например, Google Analytics) ТОЛЬКО если пользователь дал согласие.
 */
function useCookieConsent() {
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
      // ✅ Здесь грузим Google Analytics или другие трекеры
      // замените G-XXXXXXX на свой реальный Google Analytics ID

      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXX');
      };

      console.log('✅ Google Analytics script loaded.');
    } else {
      console.log('❌ User rejected cookies. Analytics not loaded.');
    }
  }, []);
}
