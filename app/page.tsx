'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import { useAuth } from '@/app/context/AuthProvider';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import BlackCognitiveSand from '@/components/effects/BlackCognitiveSand';
import dynamic from 'next/dynamic';

const CubeCanvas = dynamic(() => import('./components/CubeCanvas'), {
  ssr: false,
  loading: () => null, // можно заменить на <Loader /> если хочешь
});

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
            {/* H1 */}
            <h1 className="font-extrabold uppercase leading-[0.94] tracking-tight text-[clamp(2rem,9vw,3.75rem)]">
              <span className="block text-white">We Unlock</span>
              <span className="block text-white">Insights With</span>
              <span className="block text-white">Advanced</span>
              <span className="block text-white">Profiling</span>
            </h1>

            {/* ЗАМЕНЕННЫЙ блок подзаголовков */}
            <div className="leading-tight mt-2 font-bold text-[20.6px] text-transparent bg-clip-text bg-gradient-to-r from-[#B98AF6] via-[#A855F7] to-[#B98AF6]">
              <div>SEE WHAT OTHERS CANNOT</div>
              <div>
                REDUCE HUMAN <span className="text-[17px]">FACTOR</span> RISK
              </div>
            </div>

            {/* Описание */}
            <p className="text-[13px] leading-snug text-white/70 max-w-[30ch]">
              As people rarely tell us who they are, yet reveal it through their unconscious
              signals, these must be interpreted to harness one’s influence.
            </p>
          </div>

          {/* CTA — стеклянная таблетка */}
          {!session && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="
                relative inline-flex items-center justify-center w-fit
                rounded-full px-6 py-3 font-semibold tracking-wide text-[#F5F3FF]
                transition-[transform,box-shadow,background,opacity] duration-200
                ring-1 backdrop-blur
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23]
                hover:-translate-y-[1px]
              "
              style={{
                backgroundImage:
                  'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)),' +
                  'radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.20) 0%, rgba(168,85,247,0) 60%)',
                boxShadow:
                  'inset 0 2px 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(0,0,0,0.30), 0 8px 24px rgba(0,0,0,0.45)',
                WebkitTextStroke: 'transparent',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-full opacity-60 blur-[6px]"
                style={{
                  background:
                    'radial-gradient(80% 80% at 50% 50%, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0) 70%)',
                }}
              />
              <span className="relative z-[1]">Start Free Trial</span>
            </button>
          )}
        </div>
      </section>
      {/* ===== /MOBILE HERO ===== */}

      {/* ===== DESKTOP HERO ===== */}
      <main className="hidden md:flex lg:flex-row items-center justify-between flex-grow text-left px-6 mt-10 gap-12 max-w-7xl mx-auto relative z-10">
        <div className="w-full lg:w-[80%] space-y-2 pl-[20px]">
          {/* H1 */}
          <div className="min-h-[4rem]">
            <h1
              className="
                font-extrabold uppercase tracking-tight
                leading-[1.05] [text-wrap:balance]
                text-[clamp(3.75rem,5vw+1rem,5.75rem)]
              "
            >
              <span className="block text-white">We Unlock Insights With</span>
              <span className="block text-white">Advanced Profiling</span>
            </h1>

            {/* ЗАМЕНЕННЫЙ блок подзаголовков */}
            <div
              className="
                font-bold mt-3 leading-tight text-transparent bg-clip-text
                bg-gradient-to-r from-[#B98AF6] via-[#A855F7] to-[#B98AF6]
                text-[22.0px]
              "
            >
              <div>FROM AN IMAGE OF A FLEETING DETAILS</div>
              <div>TO SEEING WHAT OTHERS NEVER GRASP</div>
            </div>
          </div>

          {/* Описание + CTA */}
          <div className="space-y-6 text-[1rem] leading-relaxed max-w-[32rem]">
            <p className="text-[15px] leading-snug text-white/70 max-w-[36ch]">
              In seconds, you gain the rarest advantage — discerning people through signals they
              cannot conceal, knowing what words will never reveal
            </p>

            {!session && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="
                  relative inline-flex items-center justify-center
                  rounded-full px-7 py-3.5 font-semibold tracking-wide text-[#F5F3FF]
                  transition-[transform,box-shadow,background,opacity] duration-200
                  ring-1 backdrop-blur
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23]
                  hover:-translate-y-[1px]
                "
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)),' +
                    'radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.20) 0%, rgba(168,85,247,0) 60%)',
                  boxShadow:
                    'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35), 0 14px 32px rgba(168,85,247,0.35)',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-full opacity-60 blur-[6px]"
                  style={{
                    background:
                      'radial-gradient(80% 80% at 50% 50%, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0) 70%)',
                  }}
                />
                <span className="relative z-[1]">ACCESS NOW</span>
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

      {/* ===== ABOUT ===== */}
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
