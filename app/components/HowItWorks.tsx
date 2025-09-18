'use client';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Step = {
  id: number;
  title: string;
  tagline: string;
  desc: string;
  start: number;
  end: number;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Step 1 — Present a Clue',
    tagline: 'Their words …',
    desc: 'A single image of an accessory — enough to begin; No bio.',
    start: 0,
    end: 3,
  },
  {
    id: 2,
    title: 'Step 2 — AI Discernment',
    tagline: 'Their world …',
    desc: 'In seconds, you gain profound insights — fuel for influence.',
    start: 3,
    end: 6,
  },
  {
    id: 3,
    title: 'Step 3 — Your Advantage',
    tagline: 'Your clarity …',
    desc: 'Leverage the edge: orchestrate your business with more YES, deliver the NOs when needed, and move precisely where you intend. Rarefied poise. Risks reduced. Decisions sharpened.',
    start: 6,
    end: 9,
  },
];

const VIDEO_BASE = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? '';
const DESKTOP_VIDEO = `${VIDEO_BASE}/how-it-works-desktop.MP4`;
const MOBILE_VIDEO = `${VIDEO_BASE}/how-it-works-mobile.MP4`;

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ⬇︎ новые refs только для левой части
  const monolithRef = useRef<HTMLDivElement | null>(null);
  const notchRef = useRef<HTMLDivElement | null>(null);

  const railRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [active, setActive] = useState<number>(1);
  const [showPoster, setShowPoster] = useState<boolean>(false);
  const [beamPath, setBeamPath] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [edgePulse, setEdgePulse] = useState<boolean>(false);

  // Политики производительности
  const reduceMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }
    return false;
  }, []);
  const saveData =
    typeof navigator !== 'undefined' &&
    ((navigator as any)?.connection?.saveData === true ||
      (navigator as any)?.connection?.effectiveType === '2g');
  const lowCPU =
    typeof navigator !== 'undefined' &&
    typeof (navigator as any)?.hardwareConcurrency === 'number' &&
    (navigator as any).hardwareConcurrency < 4;

  // Авто play/pause — ТОЛЬКО ДЕСКТОП (lg+)
  useEffect(() => {
    const isDesktop =
      typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)')?.matches === true;
    if (!isDesktop) return;

    const vid = videoRef.current;
    const el = sectionRef.current;
    if (!vid || !el || showPoster) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showPoster]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);
    return () => {
      vid.removeEventListener('play', onPlay);
      vid.removeEventListener('pause', onPause);
    };
  }, []);

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

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid || showPoster) return;
    if (vid.paused) vid.play().catch(() => {});
    else vid.pause();
  };

  // === Луч: старт из "notch" на левом ребре монолита (если есть), иначе центр видео
  const recalcBeam = () => {
    const rail = railRef.current;
    const sec = sectionRef.current;
    const activeEl = stepRefs.current[active - 1];
    if (!rail || !sec || !activeEl) return;

    const secRect = sec.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();

    // стартовая точка
    let startX: number;
    let startY: number;

    const notchEl = notchRef.current;
    if (notchEl) {
      const n = notchEl.getBoundingClientRect();
      startX = (n.left + n.right) / 2 - secRect.left;
      startY = (n.top + n.bottom) / 2 - secRect.top;
    } else {
      const vid = videoRef.current;
      if (!vid) return;
      const v = vid.getBoundingClientRect();
      startX = (v.left + v.right) / 2 - secRect.left;
      startY = (v.top + v.bottom) / 2 - secRect.top;
    }

    const endX = railRect.left - secRect.left + railRect.width / 2;
    const endY = aRect.top - secRect.top + aRect.height / 2;

    const cpx = (startX + endX) / 2;
    const cpy = startY - 80;
    setBeamPath(`M ${startX},${startY} Q ${cpx},${cpy} ${endX},${endY}`);
  };

  useEffect(() => {
    recalcBeam();
    let raf = 0;
    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recalcBeam);
    };

    const ro = new ResizeObserver(onScrollOrResize);
    if (sectionRef.current) ro.observe(sectionRef.current);
    if (railRef.current) ro.observe(railRef.current);
    if (videoRef.current) ro.observe(videoRef.current);
    if (monolithRef.current) ro.observe(monolithRef.current);
    if (notchRef.current) ro.observe(notchRef.current);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  // Edge pulse при смене шага — короткий импульс подсветки фаски у “стыка”
  useEffect(() => {
    if (reduceMotion || saveData || lowCPU) return;
    setEdgePulse(true);
    const t = setTimeout(() => setEdgePulse(false), 200);
    return () => clearTimeout(t);
  }, [active, reduceMotion, saveData, lowCPU]);

  // Micro-tilt (десктоп)
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || saveData || lowCPU) return;
    const el = monolithRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height; // 0..1
    const rx = (x - 0.5) * 4; // -2..2
    const ry = (0.5 - y) * 4; // -2..2
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  };
  const resetTilt = () => {
    const el = monolithRef.current;
    if (!el) return;
    el.style.setProperty('--rx', `0deg`);
    el.style.setProperty('--ry', `0deg`);
  };

  return (
    <section ref={sectionRef} className="bg-transparent text-white relative overflow-hidden">
      <div className="w-full relative px-4">
        {/* ===== MOBILE (под видео) ===== */}
        <div className="lg:hidden w-full mx-auto max-w-[520px]">
          {/* ⛔️ Заголовок How it works скрыт на мобайле */}
          <div className="px-4 pb-[env(safe-area-inset-bottom)]" aria-label="How it works — steps">
            {/* Отступ от видео до первого текста: 20px */}
            <div className="h-5" aria-hidden />

            {/* Единственный текст — полный месседж из шага 3 */}
            <p className="hidden sm:block text-[15px] leading-[1.6] text-white/80 max-w-[46ch] mx-auto">
              {STEPS[2].desc}
            </p>

            {/* Разделитель */}
            <div
              className="mt-7 mb-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
              aria-hidden
            />

            {/* Теглайн (оставляем как есть и где есть) */}
            <p className="text-center text-[12px] uppercase tracking-widest text-white/75 font-light">
              DO BETTER. MOVE FURTHER
              <br className="block" />
              WITH <span className="font-semibold text-white">H1NTED</span>
            </p>
          </div>
        </div>
        {/* ===== /MOBILE ===== */}

        {/* ===== DESKTOP (без изменений) ===== */}
        <div className="hidden lg:block pt-20 pb-20">
          <div className="w-full relative grid items-center gap-12 lg:grid-cols-[0.95fr_0.05fr_1fr]">
            {/* ЛЕВАЯ КОЛОНКА — Optic Monolith */}
            <div className="relative mx-auto w-[360px] translate-x-6">
              {/* Ambient Halo за монолитом */}
              <div
                aria-hidden
                className="pointer-events-none absolute -z-10 -left-10 -top-14 w-[460px] h-[760px] rounded-[72px] blur-3xl"
                style={{
                  background:
                    'radial-gradient(120% 120% at 30% 30%, rgba(168,85,247,0.16) 0%, rgba(168,85,247,0) 60%)',
                }}
              />

              {/* Монолит */}
              <div
                ref={monolithRef}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
                className="relative w-[360px] h-[640px] [transform-style:preserve-3d] will-change-transform"
                style={{
                  transform: 'perspective(1200px) rotateX(var(--ry,0deg)) rotateY(var(--rx,0deg))',
                  transition:
                    reduceMotion || saveData || lowCPU
                      ? 'none'
                      : 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {/* Backplate (Titanium) */}
                <div
                  className="absolute inset-0 rounded-[40px] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.60)]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.45))',
                  }}
                />

                {/* Video cavity */}
                <div className="absolute inset-[8px] rounded-[36px] overflow-hidden bg-black/30">
                  {!showPoster ? (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      autoPlay
                      onClick={togglePlay}
                      crossOrigin="anonymous"
                    >
                      <source src={MOBILE_VIDEO} type="video/mp4" media="(max-width: 1023px)" />
                      <source src={DESKTOP_VIDEO} type="video/mp4" media="(min-width: 1024px)" />
                    </video>
                  ) : (
                    <Image
                      src="/images/howitworks-poster.jpg"
                      alt="Preview of product flow"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}

                  {/* Внутренняя виньетка и периметральная тень */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.24) 100%), linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.14))',
                    }}
                  />
                </div>

                {/* Optic Glass: фаска + конусный хайлайт */}
                <div
                  className={`absolute inset-0 rounded-[40px] pointer-events-none ring-1 ${edgePulse ? 'ring-[rgba(168,85,247,0.28)]' : 'ring-white/10'}`}
                  style={{
                    background:
                      'conic-gradient(from 312deg at 18% 10%, rgba(255,255,255,0.28), rgba(255,255,255,0) 60%)',
                    boxShadow: edgePulse
                      ? '0 0 24px rgba(168,85,247,0.35)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    transition: 'box-shadow 200ms ease, ring-color 200ms ease',
                  }}
                />

                {/* Notch — стыковка луча с левым ребром */}
                <div
                  ref={notchRef}
                  aria-hidden
                  className="absolute left-[-2px] top-1/2 -translate-y-1/2 h-6 w-[6px] rounded-[999px] bg-[#A855F7]/30 blur-[1px] shadow-[0_0_16px_rgba(168,85,247,0.55)]"
                />

                {/* Pearl кнопка Play/Pause */}
                {!showPoster && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPaused ? 'Play video' : 'Pause video'}
                    aria-pressed={!isPaused}
                    className="absolute bottom-3 right-5 z-20 h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 opacity-80 hover:opacity-100 hover:bg-[rgba(168,85,247,0.18)]"
                    style={{
                      background:
                        'radial-gradient(120% 120% at 30% 30%, rgba(168,85,247,0.22), rgba(168,85,247,0.08))',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                  >
                    {isPaused ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="opacity-90"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="opacity-90"
                      >
                        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* СЕРЕДИНА — «рейка» (без изменений) */}
            <div ref={railRef} className="relative mx-auto h-full w-[2px] bg-white/12 rounded">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-[3px] top-0 h-2 w-2 -translate-y-1/2 rounded-full bg-[#A855F7] shadow-[0_0_16px_rgba(168,85,247,0.55)] transition-transform duration-300"
                style={{
                  transform: `translate(-3px, ${
                    (stepRefs.current[active - 1]?.offsetTop ?? 0) +
                    (stepRefs.current[active - 1]?.offsetHeight ?? 0) / 2
                  }px)`,
                }}
              />
            </div>

            {/* ПРАВАЯ КОЛОНКА — шаги (не трогаем) */}
            <div className="max-w-[480px] ml-0 mr-auto">
              <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-white xl:text-4xl uppercase">
                How it works
              </h2>
              <ol role="list" className="space-y-8">
                {STEPS.map((s, idx) => {
                  const isActive = active === s.id;
                  return (
                    <li
                      role="listitem"
                      key={s.id}
                      ref={(el) => {
                        stepRefs.current[idx] = el;
                      }}
                      className="group"
                    >
                      <button
                        onClick={() => seekTo(s)}
                        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md"
                        aria-current={isActive ? 'step' : undefined}
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="text-sm uppercase tracking-wider text-[#CDB4FF]">
                            {s.tagline}
                          </span>
                          <span className="text-white/60">—</span>
                          <span
                            className={`text-xl xl:text-2xl font-semibold transition-colors ${
                              isActive ? 'text-white' : 'text-white/90 group-hover:text-white'
                            }`}
                          >
                            {s.title}
                          </span>
                        </div>
                        <div
                          className={`h-[2px] mt-1 w-0 transition-all duration-200 bg-gradient-to-r from-transparent via-[#A855F7]/65 to-transparent ${
                            isActive ? 'w-[180px]' : 'group-hover:w-[120px]'
                          }`}
                        />
                        <p className="mt-2 max-w-prose text-base leading-relaxed text-white/70">
                          {s.desc}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-20 pt-8 mx-auto text-center max-w-[300px] space-y-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <p className="text-base tracking-widest text-white/70 uppercase font-light">
                  Do better. Move further with{' '}
                  <span className="text-white font-semibold">H1NTED</span>
                </p>
              </div>
            </div>

            {/* SVG-луч — теперь стартует из notch */}
            <svg
              className="pointer-events-none absolute inset-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.0)" />
                  <stop offset="45%" stopColor="rgba(168,85,247,0.65)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0.0)" />
                </linearGradient>
                <style>{`
                  @keyframes glassBreath {
                    0% { opacity: 0.30; transform: rotate(14deg) translateX(0px); }
                    50% { opacity: 0.36; transform: rotate(14deg) translateX(6px); }
                    100% { opacity: 0.30; transform: rotate(14deg) translateX(0px); }
                  }
                `}</style>
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
