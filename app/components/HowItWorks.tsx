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

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState<number>(1);
  const [showPoster, setShowPoster] = useState<boolean>(true);
  const [beamPath, setBeamPath] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);

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

  useEffect(() => {
    setShowPoster(reduceMotion || saveData || lowCPU);
  }, [reduceMotion, saveData, lowCPU]);

  // Авто play/pause
  useEffect(() => {
    const vid = videoRef.current;
    const el = sectionRef.current;
    if (!vid || !el || showPoster) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause())),
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

  // Пересчёт «луча»
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

    const startX = (vidRect.left + vidRect.right) / 2 - secRect.left;
    const startY = (vidRect.top + vidRect.bottom) / 2 - secRect.top;
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

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  return (
    <section ref={sectionRef} className="bg-transparent text-white relative overflow-hidden">
      <div className="w-full relative px-4">
        {/* ===== MOBILE ===== */}
        <div className="lg:hidden w-full mx-auto max-w-[520px]">
          {/* Телефон */}
          <div className="relative h-[80svh] w-full flex items-center justify-center">
            <div className="relative w-[88vw] max-w-[380px] aspect-[9/19.5] rounded-[40px] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden bg-white/5 backdrop-blur">
              {!showPoster ? (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    poster="/images/howitworks-poster.jpg"
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    autoPlay
                  >
                    <source src="/videos/how-it-works-1080p-h264.mp4" type="video/mp4" />
                  </video>

                  {/* Рамка поверх мобильного видео */}
                  <Image
                    src="/images/howitworks-poster.jpg"
                    alt="Phone frame"
                    fill
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                    priority
                  />
                </>
              ) : (
                <>
                  <Image
                    src="/images/howitworks-poster.jpg"
                    alt="Preview of product flow"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Рамка поверх мобильного постера */}
                  <Image
                    src="/images/howitworks-poster.jpg"
                    alt="Phone frame"
                    fill
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                    priority
                  />
                </>
              )}
              {/* мягкое свечение */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[44px] ring-1 ring-[#A855F7]/20"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[56px] bg-[#A855F7]/10 blur-2xl"
              />
            </div>
          </div>

          {/* Тексты шагов */}
          <div className="px-2 pb-[env(safe-area-inset-bottom)] space-y-8">
            <h3 className="text-center text-white text-[clamp(1.5rem,6vw,1.875rem)] font-extrabold tracking-tight">
              How it works
            </h3>
            <ol role="list" className="space-y-8 max-w-[420px] mx-auto text-left">
              {STEPS.map((s) => (
                <li role="listitem" key={s.id} className="space-y-2">
                  <div className="text-[11px] uppercase tracking-widest text-[#CDB4FF]">
                    {s.tagline}
                  </div>
                  <div className="text-[18px] font-bold text-white leading-tight">{s.title}</div>
                  <p className="text-[14px] text-white/70 leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        {/* ===== /MOBILE ===== */}

        {/* ===== DESKTOP ===== */}
        <div className="hidden lg:block pt-20 pb-20">
          <div className="w-full relative grid items-center gap-12 lg:grid-cols-[0.95fr_0.05fr_1fr]">
            {/* ЛЕВАЯ КОЛОНКА — телефон */}
            <div className="relative mx-auto w-[360px]">
              {/* Фоновая виньетка за телефоном */}
              <div
                aria-hidden
                className="pointer-events-none absolute -z-10 -left-10 -top-12 w-[460px] h-[760px] rounded-[72px] blur-3xl"
                style={{
                  background:
                    'radial-gradient(120% 120% at 30% 30%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)',
                }}
              />
              {/* Декор под углом (оставляем как было) */}
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
              <div className="relative w-[360px] h-[640px] rounded-[40px] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden bg-white/5 backdrop-blur">
                {!showPoster ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover rounded-[40px] cursor-pointer"
                      poster="/images/howitworks-poster.jpg"
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      autoPlay
                      onClick={togglePlay}
                    >
                      <source src="/videos/how-it-works-1080p-h264.mp4" type="video/mp4" />
                    </video>

                    {/* Рамка поверх десктоп-видео */}
                    <Image
                      src="/images/howitworks-poster.jpg"
                      alt="Phone frame"
                      fill
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                      priority
                    />

                    {/* Кнопка-оверлей */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPaused ? 'Play video' : 'Pause video'}
                      aria-pressed={!isPaused}
                      className={`absolute bottom-3 right-3 z-20 h-9 w-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 ${isPaused ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    >
                      {isPaused ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                        </svg>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <Image
                      src="/images/howitworks-poster.jpg"
                      alt="Preview of product flow"
                      fill
                      className="object-cover rounded-[40px]"
                      priority
                    />
                    {/* Рамка поверх десктоп-постера */}
                    <Image
                      src="/images/howitworks-poster.jpg"
                      alt="Phone frame"
                      fill
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                      priority
                    />
                  </>
                )}
              </div>

              {/* Периметральное мягкое свечение */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[44px] ring-1 ring-[#A855F7]/20"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[56px] bg-[#A855F7]/10 blur-2xl"
              />
            </div>

            {/* СЕРЕДИНА — «рейка» */}
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

            {/* ПРАВАЯ КОЛОНКА — шаги */}
            <div className="max-w-[480px] ml-0 mr-auto">
              <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-white xl:text-4xl">
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
                            className={`text-xl xl:text-2xl font-semibold transition-colors ${isActive ? 'text-white' : 'text-white/90 group-hover:text-white'}`}
                          >
                            {s.title}
                          </span>
                        </div>
                        <div
                          className={`h-[2px] mt-1 w-0 transition-all duration-200 bg-gradient-to-r from-transparent via-[#A855F7]/65 to-transparent ${isActive ? 'w-[180px]' : 'group-hover:w-[120px]'}`}
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

            {/* SVG-луч */}
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
