'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import { useAuth } from '@/app/context/AuthProvider';
import Footer from './components/Footer';
import CubeCanvas from './components/CubeCanvas';
import AuthModal from './components/AuthModal';
import BlackCognitiveSand from '@/components/effects/BlackCognitiveSand';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) setIsAuthModalOpen(false);
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col font-inter text-[#E5E5E5] relative overflow-hidden bg-[#1A1E23] no-scrollbar">
      <BlackCognitiveSand />

      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      {/* ===== MOBILE HERO (только мобильный) ===== */}
      <section className="md:hidden px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col justify-between min-h-[90svh] pb-[env(safe-area-inset-bottom)] pt-4">
          <div className="space-y-3">
            <h1 className="font-bold uppercase leading-tight tracking-tight text-[60px]">
              <span className="block text-white">WE UNLOCK</span>
              <span className="block text-white">INSIGHTS WITH</span>
              <span className="block text-white">ADVANCED</span>
              <span className="block text-white">PROFILING</span>
            </h1>

            {/* акцентные фразы — тот же тон, что в lux секциях */}
            <div className="mt-3 space-y-1.5">
              <p className="text-purple-300 font-semibold uppercase tracking-wider text-[18px]">
                SEE WHAT OTHERS CANNOT
              </p>
              <p className="text-purple-300 font-semibold uppercase tracking-wider text-[18px]">
                REDUCE HUMAN <span className="text-[15px] sm:text-[16px]">FACTOR</span> RISK
              </p>
            </div>

            {/* абзац — мягче по тону */}
            <p className="text-[10px] leading-snug text-white/70 max-w-[33ch]">
              Since people do not tell us who they are, but show it through their signals, these
              must be interpreted.
            </p>
          </div>

          {!session && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-full px-6 py-3
                         bg-purple-500/20 text-white
                         ring-1 ring-purple-300/30 backdrop-blur
                         transition-colors
                         hover:bg-purple-500/30 hover:ring-purple-300/50
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 w-fit"
            >
              Start Free Trial
            </button>
          )}
        </div>
      </section>
      {/* ===== /MOBILE HERO ===== */}

      {/* ===== DESKTOP HERO — только визуальная подгонка текста ===== */}
      <main className="hidden md:flex lg:flex-row items-center justify-between flex-grow text-left px-6 mt-10 gap-12 max-w-7xl mx-auto relative z-10">
        <div className="w-full lg:w-[80%] space-y-2 pl-[20px]">
          <div className="min-h-[4rem]">
            <h1 className="font-bold uppercase leading-tight tracking-tight break-words text-[82px]">
              <span className="text-white">WE UNLOCK INSIGHTS WITH</span>
              <br />
              <span className="text-white">ADVANCED PROFILING</span>
              <br />
              <div className="mt-2 space-y-1.5">
                <p
                  className="text-purple-300 font-semibold uppercase tracking-wider"
                  style={{ fontSize: '24px' }}
                >
                  SEE WHAT OTHERS CANNOT
                </p>
                <p
                  className="text-purple-300 font-semibold uppercase tracking-wider"
                  style={{ fontSize: '24px' }}
                >
                  REDUCE HUMAN <span style={{ fontSize: '20px' }}>FACTOR</span> RISK
                </p>
              </div>
            </h1>
          </div>

          <div className="space-y-6 text-[0.9rem] leading-relaxed max-w-[28.6rem]">
            <p className="text-white/70">
              Since people do not tell us who they are, but show it <br />
              through their signals, these must be interpreted.
            </p>

            {!session && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-full px-6 py-3
                           bg-purple-500/20 text-white
                           ring-1 ring-purple-300/30 backdrop-blur
                           transition-colors
                           hover:bg-purple-500/30 hover:ring-purple-300/50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
              >
                Start Free Trial
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-[250px] sm:h-[350px] lg:h-[500px]">
          <CubeCanvas />
        </div>
      </main>
      {/* ===== /DESKTOP HERO ===== */}

      <section className="mt-10 relative z-10">
        <HowItWorks />
      </section>

      <section id="pricing" className="mt-0 relative z-10">
        <Pricing onDemoClick={() => setIsAuthModalOpen(true)} />
      </section>

      {/* ===== ABOUT — адаптировано под lux-tech ===== */}
      <section id="about" className="relative z-10 mx-auto max-w-5xl px-6 py-24 lg:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-[min(760px,92%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <h2 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          About
        </h2>
        <div className="mt-8 space-y-6 max-w-3xl mx-auto text-base md:text-lg leading-relaxed md:leading-8 text-white/80 text-center">
          <p lang="en">
            We don’t claim to read minds. Instead, we interpret silent signals — how someone
            dresses, reacts or decides to reveal deeper drives, hidden needs and what truly moves
            them. Powered by advanced AI, we blend behavioural science with elegant inference to
            transform fragments into full pictures.
          </p>
          <p lang="en">
            Much like Pininfarina designs beauty into motion, we design insight into human nature.
            Every person carries a unique internal compass — we help you interpret it. Not to label,
            but to understand. To lead. To connect. Whether you're a strategist, founder or curious,
            H1NTED offers a new lens. See nuance. Sense motivation. Speak with resonance. Because
            influence begins with pure understanding.
          </p>
        </div>
        <div className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl" />
      </section>
      {/* ===== /ABOUT ===== */}

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Footer />
    </div>
  );
}
