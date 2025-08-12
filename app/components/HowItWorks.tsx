'use client';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PhoneMockupMobile from './PhoneMockupMobile';

type Step = {
  id: number;
  title: string;
  tagline: string; // Their words… / Their world… / Your clarity…
  desc: string;
  start: number; // секунда начала фрагмента
  end: number; // секунда конца фрагмента
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Step 1 — Upload a Clue',
    tagline: 'Their words …',
    desc: 'Look, accessory, LinkedIn profile — no bio needed.',
    start: 0,
    end: 3,
  },
  {
    id: 2,
    title: 'Step 2 — AI Analyzes',
    tagline: 'Their world …',
    desc: 'Extracts deep behavioral insights from subtle signals.',
    start: 3,
    end: 6,
  },
  {
    id: 3,
    title: 'Step 3 — Actionable Output',
    tagline: 'Your clarity …',
    desc: 'Get tailored messaging strategies to increase influence.',
    start: 6,
    end: 9,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState<number>(1);
  const [showPoster, setShowPoster] = useState<boolean>(false);
  const [beamPath, setBeamPath] = useState<string>('');

  // Политики производительности
  const reduceMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }
    return false;
  }, []);

  const saveData =
    (navigator as any)?.connection?.saveData === true ||
    (navigator as any)?.connection?.effectiveType === '2g';
  const lowCPU =
    typeof (navigator as any)?.hardwareConcurrency === 'number' &&
    (navigator as any).hardwareConcurrency < 4;

  // На слабых/бережливых устройствах показываем постер вместо видео
  useEffect(() => {
    if (reduceMotion || saveData || lowCPU) setShowPoster(true);
  }, [reduceMotion, saveData, lowCPU]);

  // Автовоспроизведение только в зоне видимости
  useEffect(() => {
    const vid = videoRef.current;
    const el = sectionRef.current;
    if (!vid || !el || showPoster) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) vid.play().catch(() => {});
          else vid.pause();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showPoster]);

  // Активный шаг по таймкоду
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || showPoster) return;
    const onTime = () => {
      const t = vid.currentTime;
      const step = STEPS.find((s) => t >= s.start && t < s.end) ?? STEPS[0];
      if (step.id !== active) setActive(step.id);
    };
    vid.addEventListener('timeupdate', onTime);
    return () => vid.removeEventListener('timeupdate', onTime);
  }, [active, showPoster]);

  const seekTo = (s: Step) => {
    setActive(s.id);
    const vid = videoRef.current;
    if (!vid || showPoster) return;
    vid.currentTime = s.start + 0.05;
    vid.play().catch(() => {});
  };

  // «Луч» от телефона к активному шагу
  const recalcBeam = () => {
    const rail = railRef.current;
    const sec = sectionRef.current;
    const vid = videoRef.current;
    const activeEl = stepRefs.current[active - 1];
    if (!rail || !sec || !activeEl || !vid) return;

    const secRect = sec.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();
    const vidRect = vid.getBoundingClientRect();

    const startX = (vidRect.left + vidRect.right) / 2 - secRect.left; // центр телефона
    const startY = (vidRect.top + vidRect.bottom) / 2 - secRect.top;

    const endX = railRect.left - secRect.left + railRect.width / 2;
    const endY = aRect.top - secRect.top + aRect.height / 2;

    const cpx = (startX + endX) / 2;
    const cpy = startY - 80;
    setBeamPath(`M ${startX},${startY} Q ${cpx},${cpy} ${endX},${endY}`);
  };

  useEffect(() => {
    recalcBeam();
    const onResize = () => recalcBeam();
    window.addEventListener('resize', onResize);
    const id = setInterval(recalcBeam, 250);
    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(id);
    };
  }, [active]);

  return (
    <section ref={sectionRef} className="bg-transparent text-white relative overflow-hidden">
      <div className="w-full relative px-4">
        {/* ===== MOBILE ===== */}
        <div className="lg:hidden w-full mx-auto max-w-[520px]">
          {/* Телефоны (как было) */}
          <div className="grid grid-cols-2 gap-4 justify-items-center">
            <PhoneMockupMobile
              screenSrc="/images/phone-left-screen1.webp"
              className="w-[46vw] max-w-[240px]"
            />
            <PhoneMockupMobile
              screenSrc="/images/phone-right-screen2.webp"
              className="w-[46vw] max-w-[240px]"
            />
          </div>

          {/* Шаги (структурированный текст) */}
          <div className="mt-8 text-center space-y-6">
            <h3 className="text-white text-[28px] leading-tight font-bold">How it works</h3>
            <ol className="text-sm text-[#CCCCCC] space-y-4 font-inter text-left mx-auto max-w-[420px] list-decimal pl-5">
              {STEPS.map((s) => (
                <li key={s.id}>
                  <div className="font-semibold text-white/90">{s.title}</div>
                  <div className="text-white/50">{s.desc}</div>
                </li>
              ))}
            </ol>
          </div>
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
        {/* ===== /MOBILE ===== */}

        {/* ===== DESKTOP ===== */}
        <div className="hidden lg:block pt-20 pb-20">
          <div className="w-full relative grid items-center gap-12 lg:grid-cols-[0.95fr_0.05fr_1fr]">
            {/* ЛЕВАЯ КОЛОНКА — основной телефон (видео) */}
            <div className="relative mx-auto w-[360px]">
              {/* Декоративный статичный телефон под углом (опционально) */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-8 -top-8 hidden rotate-3 opacity-60 blur-[0.5px] xl:block"
              >
                <Image
                  src="/images/phone-static.png"
                  alt=""
                  width={320}
                  height={640}
                  className="rounded-[40px] ring-1 ring-white/5"
                  priority
                />
              </div>

              {/* Рамка + экран */}
              <div className="relative rounded-[40px] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden bg-white/5 backdrop-blur">
                {!showPoster ? (
                  <video
                    ref={videoRef}
                    className="block h-[640px] w-full object-cover"
                    poster="/images/howitworks-poster.jpg"
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    autoPlay
                  >
                    <source src="/videos/howitworks-720p-vp9.webm" type="video/webm" />
                    <source src="/videos/howitworks-720p-h264.mp4" type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src="/images/howitworks-poster.jpg"
                    alt="Preview of product flow"
                    width={360}
                    height={640}
                    className="block h-[640px] w-full object-cover"
                    priority
                  />
                )}
              </div>

              {/* Периметральное мягкое свечение */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[44px] ring-1 ring-purple-400/20"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[56px] bg-purple-500/10 blur-2xl"
              />
            </div>

            {/* СЕРЕДИНА — стеклянная «рейка» */}
            <div ref={railRef} className="relative mx-auto h-full w-[2px] bg-white/10">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-[5px] top-0 h-2 w-2 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-transform"
                style={{
                  transform: `translate(-5px, ${
                    (stepRefs.current[active - 1]?.offsetTop ?? 0) +
                    (stepRefs.current[active - 1]?.offsetHeight ?? 0) / 2
                  }px)`,
                }}
              />
            </div>

            {/* ПРАВАЯ КОЛОНКА — шаги + слоганы как лейблы */}
            <div>
              <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-white xl:text-4xl">
                How it works
              </h2>
              <ol className="space-y-8">
                {STEPS.map((s, idx) => {
                  const isActive = active === s.id;
                  return (
                    <li
                      key={s.id}
                      ref={(el: HTMLLIElement | null) => {
                        stepRefs.current[idx] = el;
                      }}
                      className="group"
                    >
                      <button onClick={() => seekTo(s)} className="text-left">
                        <div className="flex items-baseline gap-3">
                          <span className="text-sm uppercase tracking-wider text-purple-300/80">
                            {s.tagline}
                          </span>
                          <span className="text-white/60">—</span>
                          <span
                            className={`text-xl xl:text-2xl font-semibold ${
                              isActive ? 'text-white' : 'text-white/90'
                            }`}
                          >
                            {s.title}
                          </span>
                        </div>
                        <p className="mt-2 max-w-prose text-base leading-relaxed text-white/70">
                          {s.desc}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* Низ: краткая подпись‑метод */}
              <div className="mt-10">
                <h4 className="text-white text-lg font-semibold mb-2">
                  The Distinction Method — an exact science
                </h4>
                <ol className="text-[#CCCCCC] text-base leading-relaxed space-y-2 list-decimal ml-5">
                  <li>
                    Upload a clue{' '}
                    <span className="text-white/60">(look, accessory, LinkedIn… No bio)</span>
                  </li>
                  <li>Extract deep intelligence from nuanced signals</li>
                  <li>Orchestrate your business and personal influence with tailored precision.</li>
                </ol>
              </div>
            </div>

            {/* SVG‑луч (над сеткой) */}
            <svg
              className="pointer-events-none absolute inset-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.0)" />
                  <stop offset="45%" stopColor="rgba(168,85,247,0.35)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0.0)" />
                </linearGradient>
              </defs>
              <path d={beamPath} stroke="url(#beam)" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
        {/* ===== /DESKTOP ===== */}
      </div>
    </section>
  );
}
