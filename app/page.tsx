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

// ▶️ креатив для шрифта (мягкое свечение + лёгкое хроматическое смещение)
const heroTextFx: React.CSSProperties = {
  WebkitTextFillColor: 'transparent',
  backgroundImage:
    'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.88) 60%, rgba(255,255,255,0.92) 100%)',
  WebkitBackgroundClip: 'text',
  textShadow:
    '0 0 18px rgba(255,255,255,0.18), 0 0 2px rgba(255,255,255,0.6), 1px 0px 0 rgba(168,85,247,0.25), -1px 0px 0 rgba(99,102,241,0.25)',
  letterSpacing: '-0.02em',
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
        {/* --- HERO (мобильный) --- */}
        <section ref={heroSectionRef} className="px-6 mt-[3rem]">
          <div
            className="flex flex-col justify-start min-h-[100svh] pt-[2.4rem]"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              overscrollBehaviorY: 'contain',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
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
              {/* ▶️ H1 (одинаковый размер + креативный визуал) */}
              <div className="font-extrabold uppercase tracking-tight leading-[1.08] [text-wrap:balance] hero-glow">
                <motion.p
                  className="text-[clamp(2.64rem,10.8vw,3.6rem)]"
                  style={heroTextFx}
                  initial={reduce ? undefined : 'hidden'}
                  whileInView={reduce ? undefined : 'show'}
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={0}
                  animate={
                    reduce
                      ? undefined
                      : { filter: ['saturate(1)', 'saturate(1.08)', 'saturate(1)'] }
                  }
                  transition={
                    reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  WE UNLOCK INSIGHTS WITH
                </motion.p>

                <motion.p
                  className="text-[clamp(2.64rem,10.8vw,3.6rem)]"
                  style={heroTextFx}
                  initial={reduce ? undefined : 'hidden'}
                  whileInView={reduce ? undefined : 'show'}
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={1}
                  animate={reduce ? undefined : { opacity: [0.96, 1, 0.96] }}
                  transition={
                    reduce ? undefined : { duration: 7.2, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  ADVANCED AI
                </motion.p>

                <motion.p
                  className="text-[clamp(2.64rem,10.8vw,3.6rem)]"
                  style={heroTextFx}
                  initial={reduce ? undefined : 'hidden'}
                  whileInView={reduce ? undefined : 'show'}
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={2}
                  animate={
                    reduce
                      ? undefined
                      : {
                          textShadow: [
                            '0 0 18px rgba(255,255,255,0.18), 0 0 2px rgba(255,255,255,0.6), 1px 0 0 rgba(168,85,247,0.25), -1px 0 0 rgba(99,102,241,0.25)',
                            '0 0 18px rgba(255,255,255,0.22), 0 0 2px rgba(255,255,255,0.7), 1.5px 0 0 rgba(168,85,247,0.28), -1.5px 0 0 rgba(99,102,241,0.28)',
                            '0 0 18px rgba(255,255,255,0.18), 0 0 2px rgba(255,255,255,0.6), 1px 0 0 rgba(168,85,247,0.25), -1px 0 0 rgba(99,102,241,0.25)',
                          ],
                        }
                  }
                  transition={
                    reduce ? undefined : { duration: 5.8, repeat: Infinity, ease: 'easeInOut' }
                  }
                >
                  DISCERNMENT
                </motion.p>
              </div>

              {/* Тонкий «полочный» блик под H1 */}
              <div className="mt-3 h-px w-[min(560px,92%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Subtitle — без изменений */}
              <motion.div
                className="font-bold mt-12 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#B98AF6] via-[#A855F7] to-[#B98AF6] text-[clamp(1.1rem,4vw,1.1rem)]"
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

              {/* Description — без изменений */}
              <motion.p
                className="mt-5 mb-10 text-[13px] leading-snug text-white/70 max-w-[36ch]"
                initial={reduce ? undefined : 'hidden'}
                whileInView={reduce ? undefined : 'show'}
                viewport={{ once: true, amount: 0.7 }}
                variants={fadeUp}
                custom={3}
              >
                In seconds, you gain the rarest advantage of discerning people through little
                signals they cannot ever conceal
              </motion.p>
            </div>

            {/* ▶️ CTA (мобайл) */}
            <div className="flex flex-col gap-3">
              {/* Take a product tour — ВСЕГДА */}
              <motion.button
                type="button"
                aria-disabled="true"
                tabIndex={-1}
                onMouseMove={hotspotMove}
                className="relative inline-flex items-center justify-center w-fit rounded-full px-6 py-3 font-normal text-[15px] leading-snug text-[#F5F3FF] opacity-30 pointer-events-none transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur min-w-[220px]"
                style={{
                  background: 'transparent',
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35)',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
                initial={reduce ? undefined : { opacity: 0, y: 10 }}
                whileInView={
                  reduce
                    ? undefined
                    : {
                        opacity: 0.3,
                        y: 0,
                        transition: { duration: 0.6, ease: easing, delay: 0.22 },
                      }
                }
                viewport={{ once: true, amount: 0.7 }}
              >
                <span className="relative z-[1]">Take a product tour</span>
              </motion.button>

              {/* Request a free trial — ТОЛЬКО когда !session */}
              {!session && (
                <motion.button
                  type="button"
                  data-stop-snap
                  onMouseMove={hotspotMove}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAuthModalOpen(true);
                  }}
                  className="relative inline-flex items-center justify-center w-fit rounded-full px-6 py-3 font-normal text-[15px] leading-snug text-[#F5F3FF] transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23] md:hover:-translate-y-[1px] transform-gpu will-change-transform min-w-[220px]"
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
                      : {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.6, ease: easing, delay: 0.28 },
                        }
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
                  <span className="relative z-[1]">Request a free trial</span>
                </motion.button>
              )}
            </div>
          </div>
        </section>

        {/* --- ПОЛНОЭКРАННОЕ ВИДЕО --- */}
        <section ref={videoSectionRef} className="scroll-mt-14">
          <HowItWorksVideoMobile />
        </section>
      </section>
      {/* ===== /MOBILE INTRO ===== */}

      {/* ===== DESKTOP HERO (без изменений) ===== */}
      <main className="hidden md:flex lg:flex-row items-center justify-between flex-grow text-left px-6 mt-24 gap-12 max-7xl mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:w-[90%] space-y-2 pl-[40px] relative lg:ml-8">
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
              className="font-extrabold uppercase tracking-tight leading-[1.1] [text-wrap:balance] hero-glow text-[clamp(2.6rem,3.5vw+0.7rem,4rem)]"
              style={{ letterSpacing: '-0.02em' }}
              initial={reduce ? undefined : 'hidden'}
              whileInView={reduce ? undefined : 'show'}
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.span className="block text-[#F7F7F7]" variants={fadeUp} custom={0}>
                Unlock Insights
              </motion.span>
              <motion.span className="block text-[#F7F7F7]" variants={fadeUp} custom={1}>
                With Advanced AI Discernment
              </motion.span>
            </motion.h1>

            <div className="mt-4 -ml-4 h-px w-[min(680px,77%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <motion.div
              className="font-bold mt-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#B98AF6] via-[#A855F7] to-[#B98AF6] text-[27.0px]"
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
              className="text-[16px] leading-[1.6] text-white/75 mt-5 max-w-none md:w-[52ch] lg:w-[56ch] [text-wrap:balance]"
              initial={reduce ? undefined : 'hidden'}
              whileInView={reduce ? undefined : 'show'}
              viewport={{ once: true, amount: 0.7 }}
              variants={fadeUp}
              custom={4}
            >
              In seconds, you gain the rarest advantage of discerning people through little signals
              they cannot ever conceal
            </motion.p>

            {/* ===== CTA (DESKTOP) — без изменений ===== */}
            {session ? (
              <motion.button
                type="button"
                aria-disabled="true"
                tabIndex={-1}
                onMouseMove={hotspotMove}
                className="relative inline-flex items-center justify-center rounded-full px-5 py-[0.72rem] font-normal text-[15px] leading-snug text-[#F5F3FF] opacity-30 pointer-events-none transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur min-w-[200px]"
                style={{
                  background: 'transparent',
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35)',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
                initial={reduce ? undefined : { opacity: 0, y: 10 }}
                whileInView={
                  reduce
                    ? undefined
                    : {
                        opacity: 0.3,
                        y: 0,
                        transition: { duration: 0.6, ease: easing, delay: 0.32 },
                      }
                }
                viewport={{ once: true, amount: 0.7 }}
              >
                <span className="relative z-[1]">Take a product tour</span>
              </motion.button>
            ) : (
              <>
                <motion.button
                  onMouseMove={hotspotMove}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="relative inline-flex items-center justify-center rounded-full px-5 py-[0.72rem] font-normal text-[15px] leading-snug text-[#F5F3FF] transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23] hover:-translate-y-[1px] min-w-[200px]"
                  style={{
                    backgroundImage: `
                      radial-gradient(160px 160px at var(--mx, 50%) var(--my, 0%), rgba(168,85,247,0.26), rgba(168,85,247,0) 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))
                    `,
                    boxShadow:
                      'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35)',
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  whileInView={
                    reduce
                      ? undefined
                      : {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.6, ease: easing, delay: 0.32 },
                        }
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
                  <span className="relative z-[1]">Request a free trial</span>
                </motion.button>

                <motion.button
                  type="button"
                  aria-disabled="true"
                  tabIndex={-1}
                  onMouseMove={hotspotMove}
                  className="relative inline-flex items-center justify-center rounded-full px-5 py-[0.72rem] font-normal text-[15px] leading-snug text-[#F5F3FF] opacity-30 pointer-events-none transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur ml-3 min-w-[200px]"
                  style={{
                    background: 'transparent',
                    boxShadow:
                      'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35)',
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                  initial={reduce ? undefined : { opacity: 0, y: 10 }}
                  whileInView={
                    reduce
                      ? undefined
                      : {
                          opacity: 0.3,
                          y: 0,
                          transition: { duration: 0.6, ease: easing, delay: 0.36 },
                        }
                  }
                  viewport={{ once: true, amount: 0.7 }}
                >
                  <span className="relative z-[1]">Take a product tour</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-[250px] sm:h-[350px] lg:h-[500px] lg:-translate-x-8 xl:-translate-x-12">
          <CubeCanvas />
        </div>
      </main>
      {/* ===== /DESKTOP HERO ===== */}

      <section id="hiw" className="mt-10 relative z-10 scroll-mt-14">
        <HowItWorks />
      </section>

      <section id="pricing" className="mt-10 relative z-10">
        <Pricing onDemoClick={() => setIsAuthModalOpen(true)} />
      </section>

      {/* ===== ABOUT — MOBILE (живой текст) ===== */}
      <section id="about" className="md:hidden relative z-10 mx-auto max-w-5xl px-6 py-14">
        {/* очень тонкие scanlines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 0.5px, transparent 0.5px, transparent 6px)',
            maskImage:
              'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        />

        {/* заголовок с «дыханием» и световой полкой */}
        <motion.h2
          className="text-center text-[clamp(1.6rem,6.5vw,2rem)] font-extrabold tracking-tight uppercase"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={
            reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } }
          }
          viewport={{ once: true, amount: 0.6 }}
          style={{
            letterSpacing: '-0.02em',
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.86))',
            textShadow:
              '0 0 14px rgba(255,255,255,0.12), 1px 0 0 rgba(168,85,247,0.20), -1px 0 0 rgba(99,102,241,0.20)',
          }}
          animate={reduce ? undefined : { opacity: [0.96, 1, 0.96] }}
          transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          EMPOWERING PEOPLE
        </motion.h2>

        <motion.div
          className="mx-auto mt-3 h-px w-[72%] bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={reduce ? undefined : { scaleX: 0.92, opacity: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={reduce ? undefined : { duration: 0.8, ease: easing }}
        />

        {/* абзацы с мягким shimmer-проходом */}
        <div className="relative mx-auto mt-8 max-w-[44ch] space-y-6">
          {/* P1 */}
          <motion.div
            className="relative"
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            whileInView={
              reduce
                ? undefined
                : { opacity: 1, y: 0, transition: { duration: 0.55, ease: easing } }
            }
            viewport={{ once: true, amount: 0.6 }}
          >
            <p
              className="text-white/80 text-[15px] leading-[1.78] [text-wrap:balance]"
              style={{ hyphens: 'auto' }}
            >
              We don’t claim to read minds. Instead, we interpret silent signals — how someone
              dresses, reacts or decides to reveal deeper drives, hidden needs and what truly moves
              them. Powered by advanced AI, we blend behavioural science with elegant inference to
              transform fragments into full pictures.
            </p>

            {/* shimmer слой (мягкий, поверх текста) */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(90deg, transparent 0%, black 45%, black 55%, transparent 100%)',
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.00) 100%)',
                  opacity: 0.25,
                }}
                initial={{ x: '-30%' }}
                animate={{ x: ['-30%', '130%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.div>

          {/* PULL QUOTE как тихий акцент */}
          <motion.div
            className="inline-flex items-center rounded-full px-4 py-2 text-[13px] text-white/90 ring-1 ring-white/15 bg-white/5 backdrop-blur"
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            whileInView={
              reduce
                ? undefined
                : { opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.45, ease: easing } }
            }
            viewport={{ once: true, amount: 0.6 }}
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
            See nuance. Sense motivation.
          </motion.div>

          {/* P2 */}
          <motion.div
            className="relative"
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={
              reduce
                ? undefined
                : { opacity: 1, y: 0, transition: { duration: 0.55, ease: easing } }
            }
            viewport={{ once: true, amount: 0.55 }}
          >
            <p
              className="text-white/80 text-[15px] leading-[1.8] [text-wrap:balance]"
              style={{ hyphens: 'auto' }}
            >
              Much like Pininfarina designs beauty into motion, we design insight into human nature.
              Every person carries a unique internal compass — we help you interpret it. Not to
              label, but to understand. To lead. To connect. Whether you're a strategist, founder or
              curious, H1NTED offers a new lens. See nuance. Sense motivation. Speak with resonance.
              Because influence begins with pure understanding.
            </p>

            {/* второй мягкий shimmer с иным ритмом */}
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(90deg, transparent 0%, black 40%, black 60%, transparent 100%)',
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.00) 100%)',
                  opacity: 0.22,
                }}
                initial={{ x: '120%' }}
                animate={{ x: ['120%', '-20%'] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.div>
        </div>

        {/* мягкая подсветка снизу */}
        <div className="pointer-events-none mx-auto mt-10 h-[90px] w-[min(580px,92%)] rounded-[999px] bg-white/5 blur-2xl" />
      </section>

      {/* ===== ABOUT — DESKTOP (как было, не трогаем) ===== */}
      <section
        id="about"
        className="hidden md:block relative z-10 mx-auto max-w-5xl lg:max-w-6xl px-6 py-16 lg:py-28"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-[min(760px,92%)] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <motion.h2
          className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase mb-12"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={
            reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } }
          }
          viewport={{ once: true, amount: 0.6 }}
        >
          Empowering people
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
