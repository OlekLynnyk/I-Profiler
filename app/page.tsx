'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import { useAuth } from '@/app/context/AuthProvider';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import BlackCognitiveSand from '@/components/effects/BlackCognitiveSand';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';

// ▶️ добавлено
import HowItWorksVideoMobile from './components/HowItWorksVideoMobile';
import { useScrollDirectorMobile } from './hooks/useScrollDirectorMobile';

const CubeCanvas = dynamic(() => import('./components/CubeCanvas'), {
  ssr: false,
  loading: () => null,
});

const easing: any = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easing, delay: 0.08 * i },
  }),
};

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();

  // ▶️ refs для дирижёра скролла (мобайл)
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const videoSectionRef = useRef<HTMLElement | null>(null);

  // мягкий hotspot под курсором
  const hotspotMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  // ▶️ активируем «режиссируемый» скролл только на мобайле
  useScrollDirectorMobile({
    heroRef: heroSectionRef,
    videoRef: videoSectionRef,
    enabled: !isAuthModalOpen,
  });

  return (
    <div className="min-h-screen flex flex-col font-inter text-[#E5E5E5] relative overflow-hidden bg-[#1A1E23] no-scrollbar">
      <BlackCognitiveSand />
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      {/* ===== MOBILE INTRO (Hero → Fullscreen Video) ===== */}
      <section
        className="md:hidden max-w-7xl mx-auto relative z-10"
        style={{ overscrollBehaviorY: 'contain' }}
      >
        {/* --- HERO (как было), только обёрнут и добавлен ref --- */}
        <section ref={heroSectionRef} className="px-6">
          <div className="flex flex-col justify-between min-h-[90svh] pb-[env(safe-area-inset-bottom)] pt-8">
            {/* Виньетка за H1 */}
            <div
              aria-hidden
              className="pointer-events-none absolute -z-10 left-0 top-6 w-[85%] h-[220px] rounded-[56px] blur-2xl"
              style={{
                background:
                  'radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)',
              }}
            />
            <div className="space-y-3 relative">
              {/* H1 */}
              <motion.h1
                className="font-extrabold uppercase tracking-tight leading-[1.2] [text-wrap:balance] text-[clamp(3.5rem,12vw,5rem)] hero-glow"
                style={{ letterSpacing: '-0.02em' }}
                initial={reduce ? undefined : 'hidden'}
                whileInView={reduce ? undefined : 'show'}
                viewport={{ once: true, amount: 0.6 }}
              >
                <motion.span className="block text-[#F7F7F7]" variants={fadeUp} custom={0}>
                  We Unlock Insights With
                </motion.span>
                <motion.span className="block text-[#F7F7F7]" variants={fadeUp} custom={1}>
                  Advanced Profiling
                </motion.span>
              </motion.h1>

              {/* «Полка»-блик под H1 */}
              <div className="mt-3 h-px w-[min(560px,92%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Subtitle — как на десктопе, с «дыханием» */}
              <motion.div
                className="font-bold mt-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#B98AF6] via-[#A855F7] to-[#B98AF6] text-[clamp(0.90rem,4vw,1.1rem)]"
                initial={reduce ? undefined : 'hidden'}
                whileInView={reduce ? undefined : 'show'}
                viewport={{ once: true, amount: 0.7 }}
                variants={fadeUp}
                custom={2}
                animate={reduce ? undefined : { opacity: [0.94, 1, 0.94] }}
                transition={
                  reduce ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <div>FROM A GLIMPSE OF FLEETING DETAIL</div>
                <div>TO SEE WHAT OTHERS NEVER GRASP</div>
              </motion.div>

              {/* Description */}
              <motion.p
                className="mt-5 text-[13px] leading-snug text-white/70 max-w-[36ch]"
                initial={reduce ? undefined : 'hidden'}
                whileInView={reduce ? undefined : 'show'}
                viewport={{ once: true, amount: 0.7 }}
                variants={fadeUp}
                custom={3}
              >
                In seconds, you gain the rarest advantage — discerning people through signals they
                cannot conceal, knowing what words will never reveal
              </motion.p>
            </div>

            {/* CTA */}
            {!session && (
              <motion.button
                type="button"
                data-stop-snap
                onMouseMove={hotspotMove}
                onClick={(e) => {
                  e.preventDefault();
                  setIsAuthModalOpen(true);
                }}
                className="relative inline-flex items-center justify-center w-fit rounded-full px-6 py-3 font-semibold tracking-wide text-[#F5F3FF] transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23] hover:-translate-y-[1px]"
                style={{
                  backgroundImage: `
                    radial-gradient(140px 140px at var(--mx, 50%) var(--my, 0%), rgba(168,85,247,0.24), rgba(168,85,247,0) 60%),
                    linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))
                  `,
                  boxShadow:
                    'inset 0 2px 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(0,0,0,0.30), 0 8px 24px rgba(0,0,0,0.45)',
                  WebkitTextStroke: 'transparent',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
                initial={reduce ? undefined : { opacity: 0, y: 10 }}
                whileInView={
                  reduce
                    ? undefined
                    : { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing, delay: 0.24 } }
                }
                viewport={{ once: true, amount: 0.7 }}
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
              </motion.button>
            )}
          </div>
        </section>

        {/* --- ПОЛНОЭКРАННОЕ ВИДЕО --- */}
        <section ref={videoSectionRef} className="scroll-mt-14">
          <HowItWorksVideoMobile />
        </section>
      </section>
      {/* ===== /MOBILE INTRO ===== */}

      {/* ===== DESKTOP HERO ===== */}
      <main className="hidden md:flex lg:flex-row items-center justify-between flex-grow text-left px-6 mt-8 gap-12 max-w-7xl mx-auto relative z-10">
        <div className="w-full lg:w-[80%] space-y-2 pl-[20px] relative">
          {/* Виньетка за заголовком */}
          <div
            aria-hidden
            className="pointer-events-none absolute -z-10 left-[-24px] top-[-8px] w-[720px] h-[260px] rounded-[64px] blur-3xl"
            style={{
              background:
                'radial-gradient(120% 120% at 18% 22%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
          <div className="min-h-[4rem]">
            <motion.h1
              className="font-extrabold uppercase tracking-tight leading-[1.02] [text-wrap:balance] text-[clamp(3.75rem,5vw+1rem,5.75rem)] hero-glow"
              style={{ letterSpacing: '-0.02em' }}
              initial={reduce ? undefined : 'hidden'}
              whileInView={reduce ? undefined : 'show'}
              viewport={{ once: true, amount: 0.6 }}
            >
              <motion.span className="block text-[#F7F7F7]" variants={fadeUp} custom={0}>
                We Unlock Insights With
              </motion.span>
              <motion.span className="block text-[#F7F7F7]" variants={fadeUp} custom={1}>
                Advanced Profiling
              </motion.span>
            </motion.h1>

            {/* Полка-блик */}
            <div className="mt-3 h-px w-[min(680px,92%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <motion.div
              className="font-bold mt-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#B98AF6] via-[#A855F7] to-[#B98AF6] text-[22.0px]"
              initial={reduce ? undefined : 'hidden'}
              whileInView={reduce ? undefined : 'show'}
              viewport={{ once: true, amount: 0.7 }}
              animate={reduce ? undefined : { opacity: [0.94, 1, 0.94] }}
              transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div variants={fadeUp} custom={2}>
                FROM A GLIMPSE OF FLEETING DETAIL
              </motion.div>
              <motion.div variants={fadeUp} custom={3}>
                TO SEE WHAT OTHERS NEVER GRASP
              </motion.div>
            </motion.div>
          </div>

          <div className="space-y-6 text-[1rem] leading-relaxed max-w-[32rem]">
            <motion.p
              className="text-[15px] leading-snug text-white/70 max-w-[36ch] mt-5"
              initial={reduce ? undefined : 'hidden'}
              whileInView={reduce ? undefined : 'show'}
              viewport={{ once: true, amount: 0.7 }}
              variants={fadeUp}
              custom={4}
            >
              In seconds, you gain the rarest advantage — discerning people through signals they
              cannot conceal, knowing what words will never reveal
            </motion.p>

            {!session && (
              <motion.button
                onMouseMove={hotspotMove}
                onClick={() => setIsAuthModalOpen(true)}
                className="relative inline-flex items-center justify-center rounded-full px-7 py-3.5 font-semibold tracking-wide text-[#F5F3FF] transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23] hover:-translate-y-[1px]"
                style={{
                  backgroundImage: `
                    radial-gradient(160px 160px at var(--mx, 50%) var(--my, 0%), rgba(168,85,247,0.26), rgba(168,85,247,0) 60%),
                    linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))
                  `,
                  boxShadow:
                    'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35), 0 14px 32px rgba(168,85,247,0.35)',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
                initial={reduce ? undefined : { opacity: 0, y: 10 }}
                whileInView={
                  reduce
                    ? undefined
                    : { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing, delay: 0.32 } }
                }
                viewport={{ once: true, amount: 0.7 }}
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
              </motion.button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-[250px] sm:h-[350px] lg:h-[500px]">
          <CubeCanvas />
        </div>
      </main>
      {/* ===== /DESKTOP HERO ===== */}

      <section id="hiw" className="mt-10 relative z-10 scroll-mt-14">
        <HowItWorks />
      </section>

      <section id="pricing" className="mt-0 relative z-10">
        <Pricing onDemoClick={() => setIsAuthModalOpen(true)} />
      </section>

      {/* ===== ABOUT ===== */}
      <section
        id="about"
        className="relative z-10 mx-auto max-w-5xl lg:max-w-6xl px-6 py-16 lg:py-28"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-[min(760px,92%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <motion.h2
          className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-white"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={
            reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } }
          }
          viewport={{ once: true, amount: 0.6 }}
        >
          About
        </motion.h2>

        <div
          className="
            mt-8 mx-auto text-white/80 text-center
            max-w-[42ch] md:max-w-[58ch] lg:max-w-[66ch]
            text-[15px] leading-7
            md:text-[17px] md:leading-8
            lg:text-[18px] lg:leading-[1.9]
            space-y-6 lg:space-y-7
          "
        >
          <motion.p
            lang="en"
            initial={reduce ? undefined : 'hidden'}
            whileInView={reduce ? undefined : 'show'}
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp}
            custom={0}
          >
            We don’t claim to read minds. Instead, we interpret silent signals — how someone
            dresses, reacts or decides to reveal deeper drives, hidden needs and what truly moves
            them. Powered by advanced AI, we blend behavioural science with elegant inference to
            transform fragments into full pictures.
          </motion.p>

          <motion.p
            lang="en"
            initial={reduce ? undefined : 'hidden'}
            whileInView={reduce ? undefined : 'show'}
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp}
            custom={1}
          >
            Much like Pininfarina designs beauty into motion, we design insight into human nature.
            Every person carries a unique internal compass — we help you interpret it. Not to label,
            but to understand. To lead. To connect. Whether you're a strategist, founder or curious,
            H1NTED offers a new lens. See nuance. Sense motivation. Speak with resonance. Because
            influence begins with pure understanding.
          </motion.p>
        </div>

        <div className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl" />

        <div className="pb-[calc(12px+env(safe-area-inset-bottom))] md:pb-0" />
      </section>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Footer />
    </div>
  );
}
