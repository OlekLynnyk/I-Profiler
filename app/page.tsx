'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useAuth } from '@/app/context/AuthProvider';
import WatchExplainer from './components/WatchExplainer';
import VideoShowcase from './components/VideoShowcase';
import InsightsGrid from './components/InsightsGrid';
import PreFooterCTA from './components/PreFooterCTA';
import Hero from './components/Hero';
import Head from 'next/head';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  return (
    <>
      {/* theme-color только для главной */}
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </Head>

      {/* ⬇️ ТОЛЬКО ГЛАВНАЯ: локальный тёмный фон */}
      <div className="min-h-screen flex flex-col bg-black text-[#E5E5E5] relative overflow-hidden no-scrollbar">
        <Hero
          logoSrc="/images/logo-mark.svg"
          onTryClick={() => {
            if (session) {
              router.push('/workspace');
              return true; // ✅ редирект
            } else {
              sessionStorage.setItem('loginRedirectTo', window.location.pathname);
              setIsAuthModalOpen(true);
              return false; // ❌ логин без перехода
            }
          }}
        />

        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
          <Header
            onLoginClick={() => {
              sessionStorage.setItem('loginRedirectTo', window.location.pathname);
              setIsAuthModalOpen(true);
            }}
          />
        </div>

        {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

        <WatchExplainer
          watchSrc="/images/watch.png"
          topMetric={{ label: 'Precision', value: '95%' }}
          metrics={[
            { label: 'Austerity', value: '42%' },
            { label: 'Spontaneity', value: '6%' },
            { label: 'Reliability', value: '88%' },
            { label: 'Strictness', value: '17%' },
          ]}
        />

        <VideoShowcase />

        <InsightsGrid />
        <PreFooterCTA onTryClick={() => setIsAuthModalOpen(true)} />
        <Footer />
      </div>
    </>
  );
}
