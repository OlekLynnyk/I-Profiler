'use client';

import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

type Opts = {
  heroRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

export function useScrollDirectorMobile({ heroRef, videoRef, enabled = true }: Opts) {
  const [detached, setDetached] = useState(false);
  const [snappedToVideo, setSnappedToVideo] = useState(false);

  const startTouchY = useRef<number | null>(null);
  const startTouchX = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const lastTouchX = useRef<number | null>(null);
  const startAt = useRef<number>(0);
  const deltaY = useRef(0);
  const startedInCorridor = useRef(false);

  const animCancel = useRef<null | (() => void)>(null);
  const isAnimating = useRef(false);
  const lastAutoAt = useRef(0);
  const unblockInputsRef = useRef<null | (() => void)>(null);

  // Политики
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

  // Геометрия
  const getTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  const getBottom = (el: HTMLElement) => getTop(el) + el.offsetHeight;

  // Зона «коридора»
  const withinCorridor = (
    target: EventTarget | null,
    heroEl: HTMLElement,
    videoEl: HTMLElement
  ) => {
    if (!(target instanceof Node)) return false;
    return heroEl.contains(target) || videoEl.contains(target);
  };

  // Блокировка ввода только на контейнерах коридора (во время анимации)
  const blockInputsInCorridor = (heroEl: HTMLElement, videoEl: HTMLElement) => {
    const prevent = (e: Event) => {
      if (!isAnimating.current) return;
      e.preventDefault();
      e.stopPropagation();
    };
    // Нужны non-passive для preventDefault
    heroEl.addEventListener('touchmove', prevent as EventListener, { passive: false });
    videoEl.addEventListener('touchmove', prevent as EventListener, { passive: false });
    heroEl.addEventListener('wheel', prevent as EventListener, { passive: false });
    videoEl.addEventListener('wheel', prevent as EventListener, { passive: false });

    const keydown = (e: KeyboardEvent) => {
      if (!isAnimating.current) return;
      const k = e.key;
      if (
        k === 'PageDown' ||
        k === 'PageUp' ||
        k === 'Home' ||
        k === 'End' ||
        k === 'ArrowDown' ||
        k === 'ArrowUp'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', keydown, { passive: false });

    return () => {
      heroEl.removeEventListener('touchmove', prevent as EventListener);
      videoEl.removeEventListener('touchmove', prevent as EventListener);
      heroEl.removeEventListener('wheel', prevent as EventListener);
      videoEl.removeEventListener('wheel', prevent as EventListener);
      window.removeEventListener('keydown', keydown as EventListener);
    };
  };

  // Пружинная анимация (критически демпфированная «дотяжка»)
  const animateScrollTo = (targetY: number, heroEl: HTMLElement, videoEl: HTMLElement) => {
    if (reduceMotion || saveData) {
      window.scrollTo(0, Math.round(targetY));
      return () => {};
    }
    if (animCancel.current) animCancel.current();

    // Включаем эксклюзивный режим в коридоре
    isAnimating.current = true;
    unblockInputsRef.current = blockInputsInCorridor(heroEl, videoEl);

    const STIFFNESS = 0.08; // «жёсткость»
    const DAMPING = 0.92; // демпфирование (0..1)
    const MAX_MS = 1400; // страховка
    const SNAP_EPS = 0.75; // эпсилон прилипания (px)
    const V_EPS = 0.2; // эпсилон скорости

    let y = window.scrollY;
    let v = 0;
    let raf = 0;
    let prev = performance.now();
    const start = prev;

    const step = () => {
      const now = performance.now();
      const dt = Math.min(1 / 60, (now - prev) / 1000);
      prev = now;

      const force = (targetY - y) * STIFFNESS;
      v = v * DAMPING + force;
      y = y + v * (dt * 60); // нормируем под ~60fps

      window.scrollTo(0, Math.round(y));

      const timeUp = now - start > MAX_MS;
      const done = Math.abs(targetY - y) < SNAP_EPS && Math.abs(v) < V_EPS;

      if (!done && !timeUp) {
        raf = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, Math.round(targetY));
        cleanup();
      }
    };

    const cleanup = () => {
      isAnimating.current = false;
      if (unblockInputsRef.current) {
        unblockInputsRef.current();
        unblockInputsRef.current = null;
      }
      animCancel.current = null;
    };

    raf = requestAnimationFrame(step);
    const cancel = () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
    animCancel.current = cancel;
    return cancel;
  };

  // Динамическая верхняя зона (для возврата вверх из Video)
  const getTopSnapZone = () => {
    if (typeof window === 'undefined') return 96;
    const vh = window.innerHeight || 0;
    return Math.max(64, Math.min(160, Math.round(vh * 0.12)));
  };

  useEffect(() => {
    if (!enabled || !isMobile) return;

    const heroEl = heroRef.current!;
    const videoEl = videoRef.current!;
    if (!heroEl || !videoEl) return;

    const inHeroZone = () => window.scrollY < getBottom(heroEl) - 24;
    const inVideoZone = () => {
      const top = getTop(videoEl);
      const bot = getBottom(videoEl);
      return window.scrollY >= top - 4 && window.scrollY <= bot + 4;
    };

    // IO: синхронизация snappedToVideo
    const ioHero = new IntersectionObserver(
      (entries) => {
        const max = Math.max(...entries.map((e) => e.intersectionRatio));
        if (max >= 0.5 && snappedToVideo) setSnappedToVideo(false);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    const ioVideo = new IntersectionObserver(
      (entries) => {
        const max = Math.max(...entries.map((e) => e.intersectionRatio));
        if (max >= 0.5 && !snappedToVideo) setSnappedToVideo(true);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    ioHero.observe(heroEl);
    ioVideo.observe(videoEl);

    // Пороги намерений
    const DOWN_INTENT_PX = 8;
    const UP_INTENT_PX = 8;
    const MIN_REARM_MS = 260;

    const resetTouch = () => {
      startTouchY.current = null;
      startTouchX.current = null;
      lastTouchY.current = null;
      lastTouchX.current = null;
      deltaY.current = 0;
      startedInCorridor.current = false;
    };

    // TOUCH: обрабатываем только если жест начался внутри коридора
    const onTouchStart = (e: TouchEvent) => {
      // Если шла анимация и жест начался вне коридора — отменяем
      if (isAnimating.current && !withinCorridor(e.target, heroEl, videoEl)) {
        if (animCancel.current) animCancel.current();
        return;
      }
      if (!withinCorridor(e.target, heroEl, videoEl)) return;

      if (animCancel.current) animCancel.current(); // вернуть управление перед новым циклом
      startedInCorridor.current = true;

      startTouchY.current = e.touches[0]?.clientY ?? null;
      startTouchX.current = e.touches[0]?.clientX ?? null;
      lastTouchY.current = startTouchY.current;
      lastTouchX.current = startTouchX.current;
      deltaY.current = 0;
      startAt.current = performance.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!startedInCorridor.current) return;

      const y = e.touches[0]?.clientY ?? lastTouchY.current;
      const x = e.touches[0]?.clientX ?? lastTouchX.current;
      if (y == null || x == null || lastTouchY.current == null || lastTouchX.current == null)
        return;

      deltaY.current += lastTouchY.current - y; // + вниз, - вверх
      lastTouchY.current = y;
      lastTouchX.current = x;
      // Никаких preventDefault здесь — блокировка идёт точечно на контейнерах в animateScrollTo
    };

    const onTouchEnd = () => {
      if (!startedInCorridor.current) {
        resetTouch();
        return;
      }

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
      const atVideoTopZone = Math.abs(window.scrollY - videoTop) <= getTopSnapZone();

      if (verticalDominant) {
        // из Hero вниз → к Video
        if (inHeroZone() && d > DOWN_INTENT_PX && !snappedToVideo) {
          lastAutoAt.current = now;
          requestAnimationFrame(() => animateScrollTo(videoTop, heroEl, videoEl));
          setSnappedToVideo(true);
          resetTouch();
          return;
        }
        // в Video, в верхней зоне, жест вверх → к Hero
        if (inVideoZone() && atVideoTopZone && d < -UP_INTENT_PX) {
          const heroTop = getTop(heroEl);
          lastAutoAt.current = now;
          requestAnimationFrame(() => animateScrollTo(heroTop, heroEl, videoEl));
          setSnappedToVideo(false);
          resetTouch();
          return;
        }
      }

      resetTouch();
    };

    // Отслеживаем уход ниже видео — отключаем автоснап до возврата
    const onScroll = () => {
      const vBottom = getBottom(videoEl);
      const below = window.scrollY > vBottom + 24;
      setDetached(below);
    };

    // Навешиваем слушатели
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove as EventListener, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    onScroll(); // init

    return () => {
      ioHero.disconnect();
      ioVideo.disconnect();
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove as EventListener);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      if (animCancel.current) animCancel.current();
      if (unblockInputsRef.current) {
        unblockInputsRef.current();
        unblockInputsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isMobile, heroRef, videoRef]);

  return { active, detached, snappedToVideo };
}
