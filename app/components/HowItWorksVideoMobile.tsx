'use client';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src?: string; // можно переопределить S3/CloudFront URL
  poster?: string;
  className?: string;
};

export default function HowItWorksVideoMobile({
  src = '/videos/how-it-works-1080p-h264.mp4',
  poster = '/images/howitworks-poster.jpg',
  className = '',
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showPoster, setShowPoster] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  // Авто play/pause по видимости
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

  // Тригерим постер при экономии/редьюс-моушен/низком CPU
  useEffect(() => {
    if (reduceMotion || saveData || lowCPU) setShowPoster(true);
  }, [reduceMotion, saveData, lowCPU]);

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
      className={`md:hidden relative w-full min-h-[100svh] overflow-hidden ${className}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overscrollBehaviorY: 'contain',
      }}
      aria-label="How it works — intro video"
    >
      {/* Halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 inset-0 rounded-[56px] blur-2xl"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 50%, rgba(168,85,247,0.16) 0%, rgba(168,85,247,0) 60%)',
        }}
      />
      {/* ВИДЕО на весь экран */}
      <div className="absolute inset-0">
        {!showPoster ? (
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
        ) : (
          <Image src={poster} alt="Preview of product flow" fill className="object-cover" />
        )}

        {/* лёгкая виньетка */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.22) 100%)',
          }}
        />
      </div>

      {/* Play/Pause — «жемчужина» */}
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
