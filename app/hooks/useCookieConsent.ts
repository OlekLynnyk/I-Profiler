import { useEffect } from 'react';

export function useCookieConsent() {
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'accepted') {
      // Dynamically load Google Analytics
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXX');
      };
    }
  }, []);
}
