'use client';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src?: string; // опционально переопределяем URL
  poster?: string; // постер
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

  // Политики производительности (без изменений)
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

  // Авто play/pause по видимости (оставляем)
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

  // Постер при экономии/редьюс/низком CPU (оставляем)
  useEffect(() => {
    if (reduceMotion || saveData || lowCPU) setShowPoster(true);
  }, [reduceMotion, saveData, lowCPU]);

  // Состояния play/pause (оставляем)
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
      className={`md:hidden w-full ${className}`}
      aria-label="How it works — intro video"
    >
      {/* ВИДЕО: рамка, без обрезания, фикс. пропорции */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/90 outline outline-1 outline-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
        {!showPoster ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
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
        ) : (
          <Image src={poster} alt="Preview of product flow" fill className="object-contain" />
        )}

        {/* тонкая внутренняя виньетка по краям — мягкий кант, не «жёсткая линия» */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.18) 100%)',
          }}
        />

        {/* Плей/Пауза — внутри рамки, не залезает на кант */}
        {!showPoster && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPaused ? 'Play video' : 'Pause video'}
            aria-pressed={!isPaused}
            className="absolute bottom-3 right-3 z-20 h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 opacity-85 ring-1 ring-white/10"
            style={{
              background:
                'radial-gradient(120% 120% at 30% 30%, rgba(168,85,247,0.22), rgba(168,85,247,0.08))',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.45)',
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
      </div>

      {/* Вертикальный ритм секции вокруг видео — задайте снаружи: mt-5/mt-6 и т.п. */}
    </section>
  );
}
