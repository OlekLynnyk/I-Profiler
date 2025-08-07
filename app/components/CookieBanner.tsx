'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (visible && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [visible]);

  const handleConsent = (value: 'accepted' | 'rejected') => {
    localStorage.setItem('cookieConsent', value);
    setVisible(false);
    document.body.style.overflow = '';

    // Перезагрузка страницы, чтобы хук в LayoutClient
    // загрузил или не загрузил скрипты
    if (value === 'accepted') {
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 pointer-events-auto"
        aria-hidden="true"
      ></div>

      {/* Cookie Banner */}
      <div
        ref={bannerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] md:max-w-5xl z-50 transition-all duration-300 ease-out opacity-100 translate-y-0"
      >
        <div className="bg-neutral-900 text-white rounded-md shadow-xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span id="cookie-banner-desc" className="text-xs leading-snug">
            We use cookies to improve your experience. See our{' '}
            <Link
              href="/privacy"
              className="underline hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Cookie Notice
            </Link>{' '}
            for details.
          </span>

          <div className="flex flex-row items-center gap-2">
            <button
              onClick={() => handleConsent('accepted')}
              className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition text-sm"
            >
              Accept all
            </button>
            <button
              onClick={() => handleConsent('rejected')}
              className="text-white px-4 py-2 rounded-md hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition text-sm"
            >
              Reject all
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
