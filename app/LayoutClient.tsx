'use client';

import { useEffect } from 'react';
import { AuthProvider } from './context/AuthProvider';
import { SidebarProvider } from './context/SidebarContext';
import SidebarHelper from '@/app/workspace/SidebarHelper';
import Sidebar from '@/app/workspace/Sidebar';
import CookieBanner from '@/components/CookieBanner';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useCookieConsent();

  return (
    <SidebarProvider>
      <AuthProvider>
        {children}
        <SidebarHelper />
        <Sidebar packageType="Free" refreshToken={0} /> 
        <CookieBanner />
      </AuthProvider>
    </SidebarProvider>
  );
}

/**
 * Прод-уровня хук для управления cookie consent.
 */
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
