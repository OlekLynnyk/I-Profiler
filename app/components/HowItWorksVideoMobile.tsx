'use client';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src?: string; // можно переопределить S3/CloudFront URL
  poster?: string;
  className?: string;
};

const VIDEO_BASE = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? '';
const MOBILE_VIDEO = `${VIDEO_BASE}/how-it-works-mobile.MP4`;

export default function HowItWorksVideoMobile({
  src = MOBILE_VIDEO,
  poster = '/images/howitworks-poster.jpg',
  className = '',
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [showPoster, setShowPoster] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // --- НОВОЕ: прогресс «стыка» 0..1 (для визуального плавного перехода)
  const [handoff, setHandoff] = useState(0); // 0..1
  const SEAM_ZONE = 140; // высота зоны, где проявляется шов

  // Политики производительности (как было)
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

  // Авто play/pause по видимости (как было)
  useEffect(() => {
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

  // Триггерим постер при экономии/редьюс-моушен/низком CPU (как было)
  useEffect(() => {
    if (reduceMotion || saveData || lowCPU) setShowPoster(true);
  }, [reduceMotion, saveData, lowCPU]);

  // Состояние play/pause (как было)
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

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid || showPoster) return;
    if (vid.paused) vid.play().catch(() => {});
    else vid.pause();
  };

  // --- НОВОЕ: расчёт handoff (насколько низ секции приблизился к низу вьюпорта)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;

    const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

    const calc = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // 0 когда низ секции = низу экрана; 1 — когда прошли зону SEAM_ZONE
      const raw = (vh - r.bottom) / SEAM_ZONE;
      const p = clamp01(raw);
      setHandoff(p);
      // Прокидываем как CSS-переменную — дешево для слоёв
      el.style.setProperty('--handoff', p.toFixed(3));
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calc);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    calc();

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`md:hidden relative w-full min-h-[100svh] overflow-hidden ${className}`}
      style={{
        // CSS-переменная шва по умолчанию
        ['--handoff' as any]: 0,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overscrollBehaviorY: 'contain',
      }}
      aria-label="How it works — intro video"
    >
      {/* ⛔️ УДАЛЕНО: тяжёлый Halo — на мобиле лишний, мешает «чистому» виду */}

      {/* ВИДЕО на весь экран */}
      <div className="absolute inset-0">
        {!showPoster ? (
          <div
            className="absolute inset-0 will-change-transform"
            // микро-релаксация масштаба к моменту шва (еле заметно, не ломает компоновку)
            style={{
              transform:
                reduceMotion || saveData ? 'none' : 'scale(calc(1 - (var(--handoff) * 0.010)))',
              transition: reduceMotion || saveData ? 'none' : 'transform 100ms linear',
            }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              loop
              preload="metadata"
              autoPlay
              onClick={togglePlay}
              crossOrigin="anonymous"
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>
        ) : (
          <Image src={poster} alt="Preview of product flow" fill className="object-cover" />
        )}

        {/* Внутренняя лёгкая виньетка — оставляем, но тонкая (не «шумит») */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.18) 100%)',
          }}
        />

        {/* ✅ Верхний scrim — мягкая стыковка со статусбаром, без рамок */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.44), rgba(0,0,0,0))',
          }}
        />

        {/* ✅ Нижний «seam» — бесшовный переход к следующей секции (только визуальный слой) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            // Ничего не перехватываем: чистый визуальный слой
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,12,0.60) 64%, rgba(10,10,12,0.92) 100%)',
            opacity: 'var(--handoff)',
            transition: reduceMotion || saveData ? 'none' : 'opacity 80ms linear',
          }}
        />
      </div>

      {/* Play/Pause — как было (никаких новых правил) */}
      {!showPoster && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPaused ? 'Play video' : 'Pause video'}
          aria-pressed={!isPaused}
          className="absolute bottom-4 right-5 z-20 h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 opacity-80 hover:opacity-100 hover:bg-[rgba(168,85,247,0.18)] ring-1 ring-white/10"
          style={{
            background:
              'radial-gradient(120% 120% at 30% 30%, rgba(168,85,247,0.22), rgba(168,85,247,0.08))',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.45)',
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
    </section>
  );
}
