'use client';

import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

type Opts = {
  heroRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

/**
 * Дирижирует скроллом на мобайле:
 *  - свайп вниз на Hero → мягко к видео
 *  - свайп вверх у Video (в верхней зоне) → обратно к Hero
 *  - ниже видео — обычный скролл; при возврате в зону Hero/Video автоскролл снова активен
 *
 * API сохранён: возвращаем { active, detached, snappedToVideo }
 */
export function useScrollDirectorMobile({ heroRef, videoRef, enabled = true }: Opts) {
  // публичные состояния — сохранены для совместимости
  const [detached, setDetached] = useState(false);
  const [snappedToVideo, setSnappedToVideo] = useState(false);

  // служебные
  const lastTouchY = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const startTouchY = useRef<number | null>(null);
  const startTouchX = useRef<number | null>(null);
  const startTouchAt = useRef<number>(0);
  const deltaY = useRef(0);

  const animCancel = useRef<null | (() => void)>(null);
  const lastAutoAt = useRef<number>(0);

  // Политики — сохраняем поведение
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
    (navigator as any).hardwareConcurrency < 4; // сохраняем, но не отключаем активность

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(max-width: 767.98px)')?.matches ?? true;
  }, []);

  const active = enabled && !detached && isMobile && !(reduceMotion || saveData);

  // rAF-аниматор прокрутки
  const animateScrollTo = (targetY: number, duration = 480) => {
    if (reduceMotion || saveData) {
      window.scrollTo(0, Math.round(targetY));
      return () => {};
    }
    // отменяем предыдущую анимацию
    if (animCancel.current) animCancel.current();

    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 1) {
      window.scrollTo(0, Math.round(targetY));
      return () => {};
    }

    let raf = 0;
    const startT = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // мягкий easeOutCubic

    const step = (now: number) => {
      const t = Math.min(1, (now - startT) / duration);
      const y = startY + dist * ease(t);
      window.scrollTo(0, Math.round(y));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        animCancel.current = null;
      }
    };

    raf = requestAnimationFrame(step);

    const cancelOnUser = () => {
      if (raf) cancelAnimationFrame(raf);
      animCancel.current = null;
    };

    const onUserInput = () => cancelOnUser();
    window.addEventListener('touchstart', onUserInput, { passive: true, once: true });
    window.addEventListener('wheel', onUserInput, { passive: true, once: true });
    window.addEventListener('keydown', onUserInput, { passive: true, once: true });

    animCancel.current = cancelOnUser;
    return cancelOnUser;
  };

  useEffect(() => {
    if (!enabled) return;

    const heroEl = heroRef.current;
    const videoEl = videoRef.current;
    if (!heroEl || !videoEl) return;

    const getElTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
    const getElBottom = (el: HTMLElement) => getElTop(el) + el.offsetHeight;
    const scrollToEl = (el: HTMLElement) => {
      const top = getElTop(el);
      // доп. rAF чтобы избежать «прыжков» адрес-бара iOS
      requestAnimationFrame(() => {
        animateScrollTo(top);
      });
    };

    // --- IntersectionObserver: синхронизация snappedToVideo
    const ioHero = new IntersectionObserver(
      (entries) => {
        const max = Math.max(...entries.map((e) => e.intersectionRatio));
        if (max >= 0.5) {
          // герой доминирует
          if (snappedToVideo) setSnappedToVideo(false);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    const ioVideo = new IntersectionObserver(
      (entries) => {
        const max = Math.max(...entries.map((e) => e.intersectionRatio));
        if (max >= 0.5) {
          // видео доминирует
          if (!snappedToVideo) setSnappedToVideo(true);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    ioHero.observe(heroEl);
    ioVideo.observe(videoEl);

    // --- жесты
    const SNAP_THRESHOLD = 64; // px намерения
    const TOP_SNAP_ZONE = 40; // верхняя зона для возврата
    const MIN_REARM_MS = 300; // антидребезг

    const inHeroZone = () => window.scrollY < getElBottom(heroEl) - 24;
    const inVideoZone = () => {
      const top = getElTop(videoEl);
      const bot = getElBottom(videoEl);
      return window.scrollY >= top - 4 && window.scrollY <= bot + 4;
    };

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as Element | null;
      if (target && target.closest('[data-stop-snap]')) return;
      if (animCancel.current) animCancel.current(); // пользователь — главный

      lastTouchY.current = e.touches[0]?.clientY ?? null;
      lastTouchX.current = e.touches[0]?.clientX ?? null;
      startTouchY.current = lastTouchY.current;
      startTouchX.current = lastTouchX.current;
      startTouchAt.current = performance.now();
      deltaY.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchY.current == null || lastTouchX.current == null) return;
      const y = e.touches[0]?.clientY ?? lastTouchY.current;
      const x = e.touches[0]?.clientX ?? lastTouchX.current;
      deltaY.current += lastTouchY.current - y; // + вниз, - вверх
      lastTouchY.current = y;
      lastTouchX.current = x;
    };

    const onTouchEnd = () => {
      const d = deltaY.current;
      const endAt = performance.now();
      const dt = Math.max(1, endAt - startTouchAt.current);
      const v = Math.abs(d) / dt; // px/ms

      const dx =
        startTouchX.current != null && lastTouchX.current != null
          ? Math.abs(lastTouchX.current - startTouchX.current)
          : 0;
      const dy =
        startTouchY.current != null && lastTouchY.current != null
          ? Math.abs(lastTouchY.current - startTouchY.current)
          : Math.abs(d);

      // вертикаль должна доминировать
      const verticalDominant = dy > dx * 1.2;

      // антидребезг
      if (endAt - lastAutoAt.current < MIN_REARM_MS) {
        deltaY.current = 0;
        lastTouchY.current = null;
        lastTouchX.current = null;
        return;
      }

      // вычисления зон
      const videoTop = getElTop(videoEl);
      const atVideoTopZone =
        window.scrollY >= videoTop - 4 && window.scrollY <= videoTop + TOP_SNAP_ZONE;

      // SNAP-решения
      if (verticalDominant && (Math.abs(d) >= SNAP_THRESHOLD || v >= 0.5)) {
        // из Hero вниз → к видео
        if (inHeroZone() && d > 0 && !snappedToVideo) {
          lastAutoAt.current = endAt;
          scrollToEl(videoEl);
          setSnappedToVideo(true);
        }
        // из Видео вверх в верхней зоне → к Hero
        else if (inVideoZone() && d < 0 && atVideoTopZone && snappedToVideo) {
          lastAutoAt.current = endAt;
          scrollToEl(heroEl);
          setSnappedToVideo(false);
        }
      }

      // сброс временных значений
      deltaY.current = 0;
      lastTouchY.current = null;
      lastTouchX.current = null;
    };

    // --- скролл: детач ниже видео, авто-восстановление при возврате
    const onScroll = () => {
      const vTop = getElTop(videoEl);
      const vBottom = getElBottom(videoEl);
      const below = window.scrollY > vBottom + 24;
      // ниже — отключаем; в зоне hero/video — включаем
      setDetached(below);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // начальная инициализация detached
    onScroll();

    return () => {
      ioHero.disconnect();
      ioVideo.disconnect();
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, heroRef, videoRef, reduceMotion, saveData, isMobile, snappedToVideo]);

  return { active, detached, snappedToVideo };
}
