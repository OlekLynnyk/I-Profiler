'use client';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  src?: string; // можно переопределить S3/CloudFront URL
  poster?: string; // может быть пустым
  className?: string;
};

const VIDEO_BASE = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? '';
const MOBILE_VIDEO = `${VIDEO_BASE}/how-it-works-mobile.MP4`;

export default function HowItWorksVideoMobile({
  src = MOBILE_VIDEO,
  poster,
  className = '',
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [lowCPU, setLowCPU] = useState(false);

  const [showPoster, setShowPoster] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // маунт
  useEffect(() => {
    setMounted(true);
  }, []);

  // Политики производительности — только на клиенте (после маунта)
  useEffect(() => {
    if (!mounted) return;

    try {
      setReduceMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

      const nav: any = navigator;
      setSaveData(
        Boolean(nav?.connection?.saveData === true || nav?.connection?.effectiveType === '2g')
      );

      const hc = typeof nav?.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;
      setLowCPU(hc < 4);
    } catch {
      /* no-op */
    }
  }, [mounted]);

  // Стабильная высота
  useEffect(() => {
    if (!mounted) return;
    const setStableVH = () => {
      const h = (window.visualViewport?.height ?? window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${h}px`);
    };
    setStableVH();
    const onOrientation = () => requestAnimationFrame(() => setTimeout(setStableVH, 300));
    window.addEventListener('orientationchange', onOrientation);
    return () => window.removeEventListener('orientationchange', onOrientation);
  }, [mounted]);

  // Автоплей по видимости
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

  // Включаем постер при экономии/редьюс-моушен/низком CPU
  useEffect(() => {
    if (reduceMotion || saveData || lowCPU) setShowPoster(true);
  }, [reduceMotion, saveData, lowCPU]);

  // Состояние play/pause
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

  return (
    <section
      ref={sectionRef}
      className={`md:hidden relative w-full overflow-hidden bg-black ${className}`}
      style={{
        height: 'calc(var(--vh, 100svh) * 100)',
        overscrollBehaviorY: 'contain',
      }}
      aria-label="How it works — intro video"
    >
      <div className="absolute inset-0 grid place-items-center">
        {!showPoster ? (
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            muted
            playsInline
            loop
            preload="metadata"
            autoPlay
            onClick={togglePlay}
            // не отдаём пустой poster, чтобы не было hydration diff
            {...(poster ? { poster } : {})}
            crossOrigin="anonymous"
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : // Рендерим изображение ТОЛЬКО если есть валидный src
        poster ? (
          <Image src={poster} alt="Preview of product flow" fill className="object-contain" />
        ) : (
          <div className="h-full w-full bg-black" aria-hidden />
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.44), rgba(0,0,0,0))' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0), rgb(10,10,12))',
          transform: 'translateZ(0)',
        }}
      />

      {!showPoster && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPaused ? 'Play video' : 'Pause video'}
          aria-pressed={!isPaused}
          className="absolute bottom-4 right-5 z-[1] h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center ring-1 ring-white/10 text-white/90"
          style={{
            background:
              'radial-gradient(120% 120% at 30% 30%, rgba(168,85,247,0.22), rgba(168,85,247,0.08))',
          }}
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
      )}
    </section>
  );
}
