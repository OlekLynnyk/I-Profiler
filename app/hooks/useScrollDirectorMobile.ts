'use client';

import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';

type Opts = {
  heroRef: MutableRefObject<HTMLElement | null>;
  videoRef: MutableRefObject<HTMLElement | null>;
  enabled?: boolean;
};

/**
 * Дирижирует первым скроллом на мобайле:
 *  - свайп вниз на Hero → мягко скроллит к полноэкранному видео
 *  - свайп вверх у видео (в верхней части) → возвращает к Hero
 *  - как только пользователь прокрутил НИЖЕ видео → отключаемся (дальше обычный скролл)
 */
export function useScrollDirectorMobile({ heroRef, videoRef, enabled = true }: Opts) {
  const [detached, setDetached] = useState(false);
  const [snappedToVideo, setSnappedToVideo] = useState(false);
  const lastTouchY = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const deltaY = useRef(0);

  // Политики производительности
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);
  const saveData =
    typeof navigator !== 'undefined' &&
    ((navigator as any)?.connection?.saveData === true ||
      (navigator as any)?.connection?.effectiveType === '2g');
  const lowCPU =
    typeof navigator !== 'undefined' &&
    typeof (navigator as any)?.hardwareConcurrency === 'number' &&
    (navigator as any).hardwareConcurrency < 4;

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(max-width: 767.98px)')?.matches ?? true;
  }, []);

  const active = enabled && !detached && isMobile && !(reduceMotion || saveData || lowCPU);

  useEffect(() => {
    if (!active) return;

    const heroEl = heroRef.current;
    const videoEl = videoRef.current;
    if (!heroEl || !videoEl) return;

    const scrollToEl = (el: HTMLElement) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      // избегаем скачков iOS адрес-бара: используем smooth scroll
      window.scrollTo({ top, behavior: 'smooth' });
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0]?.clientY ?? null;
      lastTouchX.current = e.touches[0]?.clientX ?? null;
      deltaY.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchY.current == null) return;
      const y = e.touches[0]?.clientY ?? lastTouchY.current;
      deltaY.current += lastTouchY.current - y; // + вниз, - вверх
      lastTouchY.current = y;
    };

    const SNAP_THRESHOLD = 64; // пикселей «намерения»
    const TOP_SNAP_ZONE = 40; // зона возврата из видео свайпом вверх

    const onTouchEnd = () => {
      const d = deltaY.current;
      deltaY.current = 0;
      lastTouchY.current = null;

      const heroTop = heroEl.getBoundingClientRect().top + window.scrollY;
      const heroBottom = heroTop + heroEl.offsetHeight;
      const videoTop = videoEl.getBoundingClientRect().top + window.scrollY;
      const videoBottom = videoTop + videoEl.offsetHeight;

      const scrollY = window.scrollY;

      // Состояние: мы в зоне Hero → свайп вниз
      if (scrollY < heroBottom - 24 && d > SNAP_THRESHOLD && !snappedToVideo) {
        scrollToEl(videoEl);
        setSnappedToVideo(true);
        return;
      }

      // Состояние: мы в зоне Video → свайп вверх в верхней зоне
      const atVideoTopZone = scrollY >= videoTop - 4 && scrollY <= videoTop + TOP_SNAP_ZONE;
      if (snappedToVideo && d < -SNAP_THRESHOLD && atVideoTopZone) {
        scrollToEl(heroEl);
        setSnappedToVideo(false);
        return;
      }
    };

    const onScroll = () => {
      // Если пользователь проскроллил НИЖЕ видео — отцепляемся
      const videoElTop = videoEl.getBoundingClientRect().top + window.scrollY;
      const videoElBottom = videoElTop + videoEl.offsetHeight;
      if (window.scrollY > videoElBottom + 24) {
        setDetached(true);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
  }, [active, heroRef, videoRef, snappedToVideo]);

  return { active, detached, snappedToVideo };
}
