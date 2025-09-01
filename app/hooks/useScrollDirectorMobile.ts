'use client';

import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

type Opts = {
  heroRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

/**
 * Mobile scroll director:
 * - swipe down in Hero => snap to Video (full-screen)
 * - swipe up at top edge of Video => snap back to Hero
 * - elsewhere => normal scroll
 * - repeats always
 *
 * API: { active, detached, snappedToVideo }
 */
export function useScrollDirectorMobile({ heroRef, videoRef, enabled = true }: Opts) {
  const [detached, setDetached] = useState(false);
  const [snappedToVideo, setSnappedToVideo] = useState(false);

  const startTouchY = useRef<number | null>(null);
  const startTouchX = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const startAt = useRef<number>(0);
  const deltaY = useRef(0);

  const animCancel = useRef<null | (() => void)>(null);
  const isAnimating = useRef(false);
  const lastAutoAt = useRef(0);

  // Политики: НЕ отключаем поведение, только делаем анимацию мгновенной при reduce/saveData
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);
  const saveData =
    typeof navigator !== 'undefined' &&
    ((navigator as any)?.connection?.saveData === true ||
      (navigator as any)?.connection?.effectiveType === '2g');

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(max-width: 767.98px)')?.matches ?? true;
  }, []);

  const active = enabled && !detached && isMobile;

  // cubic-bezier(0.22,1,0.36,1) аппроксимация через easeOutCubic — мягко и “люкс”
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  // rAF-аниматор с блокировкой нативного скролла во время автоскролла
  const animateScrollTo = (targetY: number, distanceHint = 0) => {
    // длительность от дистанции
    const dist = Math.abs(targetY - window.scrollY);
    const base = distanceHint || dist;
    const duration = Math.max(360, Math.min(640, base * 0.6)); // 0.6ms/px, зажато в 360..640

    // если reduce/saveData — мгновенно, но всё равно “снэпаем”
    if (reduceMotion || saveData) {
      window.scrollTo(0, Math.round(targetY));
      return () => {};
    }

    if (animCancel.current) animCancel.current();

    let raf = 0;
    const startY = window.scrollY;
    const total = targetY - startY;
    const startT = performance.now();

    // блокируем нативный скролл жестом
    isAnimating.current = true;

    const preventWhileAnimating = (e: TouchEvent) => {
      if (isAnimating.current) e.preventDefault();
    };
    // важное: нужен non-passive, иначе preventDefault не сработает
    window.addEventListener('touchmove', preventWhileAnimating, { passive: false });

    const step = (now: number) => {
      const t = Math.min(1, (now - startT) / duration);
      const y = startY + total * ease(t);
      window.scrollTo(0, Math.round(y));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        cleanup();
      }
    };

    const cancelOnUser = () => {
      if (raf) cancelAnimationFrame(raf);
      cleanup();
    };

    const cleanup = () => {
      isAnimating.current = false;
      window.removeEventListener('touchmove', preventWhileAnimating);
      animCancel.current = null;
    };

    raf = requestAnimationFrame(step);

    const onUserInput = () => cancelOnUser();
    window.addEventListener('touchstart', onUserInput, { passive: true, once: true });
    window.addEventListener('wheel', onUserInput, { passive: true, once: true });
    window.addEventListener('keydown', onUserInput, { passive: true, once: true });

    animCancel.current = cancelOnUser;
    return cancelOnUser;
  };

  useEffect(() => {
    if (!enabled || !isMobile) return;

    const heroEl = heroRef.current;
    const videoEl = videoRef.current;
    if (!heroEl || !videoEl) return;

    const getTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    const getBottom = (el: HTMLElement) => getTop(el) + el.offsetHeight;
    const scrollToEl = (el: HTMLElement) => {
      const top = getTop(el);
      // rAF — чтобы избежать дергания адрес-бара iOS
      requestAnimationFrame(() => {
        animateScrollTo(top);
      });
    };

    // Зоны
    const inHeroZone = () => window.scrollY < getBottom(heroEl) - 24;
    const inVideoZone = () => {
      const top = getTop(videoEl);
      const bot = getBottom(videoEl);
      return window.scrollY >= top - 4 && window.scrollY <= bot + 4;
    };

    // IO для синхронизации snappedToVideo
    const ioHero = new IntersectionObserver(
      (entries) => {
        const max = Math.max(...entries.map((e) => e.intersectionRatio));
        if (max >= 0.5) {
          if (snappedToVideo) setSnappedToVideo(false);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    const ioVideo = new IntersectionObserver(
      (entries) => {
        const max = Math.max(...entries.map((e) => e.intersectionRatio));
        if (max >= 0.5) {
          if (!snappedToVideo) setSnappedToVideo(true);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    ioHero.observe(heroEl);
    ioVideo.observe(videoEl);

    // Пороговые параметры (минимальные для “сразу среагировать”)
    const DOWN_INTENT_PX = 8; // из Hero вниз
    const UP_INTENT_PX = 8; // из Video вверх (в верхней зоне)
    const TOP_SNAP_ZONE = 48; // верхняя зона внутри Video
    const MIN_REARM_MS = 260; // антидребезг

    const onTouchStart = (e: TouchEvent) => {
      if (animCancel.current) animCancel.current(); // даём управление пользователю
      startTouchY.current = e.touches[0]?.clientY ?? null;
      startTouchX.current = e.touches[0]?.clientX ?? null;
      lastTouchY.current = startTouchY.current;
      lastTouchX.current = startTouchX.current;
      deltaY.current = 0;
      startAt.current = performance.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastTouchY.current;
      const x = e.touches[0]?.clientX ?? lastTouchX.current;
      if (y == null || x == null || lastTouchY.current == null || lastTouchX.current == null)
        return;

      deltaY.current += lastTouchY.current - y; // + вниз, - вверх
      lastTouchY.current = y;
      lastTouchX.current = x;

      // Во время активной анимации блокируем нативный скролл (подстраховка)
      if (isAnimating.current) e.preventDefault();
    };

    const onTouchEnd = () => {
      const d = deltaY.current; // суммарный сдвиг (px): +вниз, -вверх
      const dx =
        startTouchX.current != null && lastTouchX.current != null
          ? Math.abs(lastTouchX.current - startTouchX.current)
          : 0;
      const dy =
        startTouchY.current != null && lastTouchY.current != null
          ? Math.abs(lastTouchY.current - startTouchY.current)
          : Math.abs(d);
      const verticalDominant = dy > dx * 1.2;

      const now = performance.now();
      if (now - lastAutoAt.current < MIN_REARM_MS) {
        resetTouch();
        return;
      }

      // Позиции
      const videoTop = getTop(videoEl);
      const atVideoTopZone = Math.abs(window.scrollY - videoTop) <= TOP_SNAP_ZONE;

      // Логика снапов (минимальные пороги — “сразу сработать”)
      if (verticalDominant) {
        // из Hero вниз → к Video (практически всегда при малейшем намерении вниз)
        if (inHeroZone() && d > DOWN_INTENT_PX && !snappedToVideo) {
          lastAutoAt.current = now;
          // дистанция для расчёта длительности
          const distance = Math.abs(videoTop - window.scrollY);
          requestAnimationFrame(() => animateScrollTo(videoTop, distance));
          setSnappedToVideo(true);
          resetTouch();
          return;
        }

        // в Video, в верхней зоне, жест вверх → к Hero
        if (inVideoZone() && atVideoTopZone && d < -UP_INTENT_PX && snappedToVideo) {
          const heroTop = getTop(heroEl);
          lastAutoAt.current = now;
          const distance = Math.abs(window.scrollY - heroTop);
          requestAnimationFrame(() => animateScrollTo(heroTop, distance));
          setSnappedToVideo(false);
          resetTouch();
          return;
        }
      }

      resetTouch();
    };

    const resetTouch = () => {
      startTouchY.current = null;
      startTouchX.current = null;
      lastTouchY.current = null;
      lastTouchX.current = null;
      deltaY.current = 0;
    };

    // Отслеживаем уход ниже видео — отключаем автоснап до возвращения
    const onScroll = () => {
      const vBottom = getBottom(videoEl);
      const below = window.scrollY > vBottom + 24;
      setDetached(below);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll(); // init

    return () => {
      ioHero.disconnect();
      ioVideo.disconnect();
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      if (animCancel.current) animCancel.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isMobile, heroRef, videoRef]);

  return { active, detached, snappedToVideo };
}
