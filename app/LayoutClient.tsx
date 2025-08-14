'use client';

import { useEffect, Suspense } from 'react'; // ⬅️ добавил Suspense
import { AuthProvider } from './context/AuthProvider';
import { SidebarProvider } from './context/SidebarContext';
import SidebarHelper from '@/app/workspace/SidebarHelper';
import Sidebar from '@/app/workspace/Sidebar';
import CookieBanner from '@/components/CookieBanner';
import SessionBridge from '@/components/SessionBridge'; // ✅ подключен

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useCookieConsent();

  return (
    <SidebarProvider>
      <AuthProvider>
        {/* ⬇️ Оборачиваем в Suspense */}
        <Suspense fallback={null}>
          <SessionBridge />
        </Suspense>
        {children}
        <SidebarHelper />
        <Sidebar packageType="Free" refreshToken={0} />
        <CookieBanner />
      </AuthProvider>
    </SidebarProvider>
  );
}

function useCookieConsent() {
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
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
