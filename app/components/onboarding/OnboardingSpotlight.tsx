'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Props = {
  text?: string;
  targetSelector: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  onAccept?: () => void | Promise<void>;
  onDismiss: () => void | Promise<void>;
  hideSecondary?: boolean;
};

export default function OnboardingSpotlight({
  targetSelector,
  title,
  body,
  ctaLabel = 'Got it',
  onAccept,
  onDismiss,
  hideSecondary = false,
  text,
}: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tipRect, setTipRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // === следим за целью (устранение "залипания" при исчезновении якоря)
  useLayoutEffect(() => {
    let observed: HTMLElement | null = null;

    const getEl = () => document.querySelector(targetSelector) as HTMLElement | null;
    const isVisible = (el: HTMLElement | null) =>
      !!el && el.isConnected && el.getClientRects().length > 0;

    const ensureOrDismiss = () => {
      const el = getEl();

      // если цели нет или она невидима — снимаем подсветку и закрываем оверлей
      if (!isVisible(el)) {
        setRect(null);
        try {
          onDismiss?.();
        } catch {}
        // отключаем наблюдателей, если были
        if (observed) {
          try {
            ro.unobserve(observed);
          } catch {}
          observed = null;
        }
        return;
      }

      // цель есть и видима
      setRect(el!.getBoundingClientRect());

      // пере-подписка ResizeObserver при смене узла
      if (observed !== el) {
        if (observed) {
          try {
            ro.unobserve(observed);
          } catch {}
        }
        ro.observe(el!);
        observed = el!;
      }
    };

    const ro = new ResizeObserver(ensureOrDismiss);
    const mo = new MutationObserver(ensureOrDismiss);

    // стартовая инициализация
    ensureOrDismiss();

    // следим за скроллом/resize/поворотом
    const onScroll = () => ensureOrDismiss();
    const onResize = () => ensureOrDismiss();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // следим за изменениями DOM (перерисовки сайдбара/шапки и т.п.)
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    return () => {
      try {
        ro.disconnect();
        mo.disconnect();
      } catch {}
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [targetSelector, onDismiss]);

  // === следим за тултипом
  useLayoutEffect(() => {
    const updateTip = () => {
      if (tooltipRef.current) setTipRect(tooltipRef.current.getBoundingClientRect());
    };
    updateTip();

    const el = tooltipRef.current;
    const ro = new ResizeObserver(updateTip);
    if (el) ro.observe(el);

    const onScroll = () => updateTip();
    const onResize = () => updateTip();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      try {
        ro.disconnect();
      } catch {}
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [rect]);

  // фокус на тултип
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    tooltipRef.current?.focus();
    return () => prev?.focus();
  }, []);

  // ESC закрывает
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  if (!rect) return null;

  // ===== позиционирование
  const SAFE = 16;
  const desiredWidth = Math.min(320, window.innerWidth - SAFE * 2);
  const preferRight = rect.right + desiredWidth + 14 < window.innerWidth;

  const baseTop = Math.max(8, rect.top + window.scrollY - 6);
  const baseLeft = preferRight ? rect.right + window.scrollX + 14 : rect.left + window.scrollX;

  const translateY = preferRight ? 0 : rect.height + 10;

  const tipW = tipRect?.width ?? desiredWidth;
  const tipH = tipRect?.height ?? 88;

  const unclampedTop = baseTop + translateY + 12;
  const unclampedLeft = baseLeft;

  const clampedTop = Math.min(
    Math.max(unclampedTop, window.scrollY + SAFE),
    window.scrollY + window.innerHeight - SAFE - tipH
  );

  const clampedLeft = Math.min(
    Math.max(unclampedLeft, window.scrollX + SAFE),
    window.scrollX + window.innerWidth - SAFE - tipW
  );

  // ===== положение «капли» (beak)
  const beakSize = 22;
  const beakX = preferRight ? clampedLeft - (beakSize - 2) : clampedLeft + tipW / 2 - beakSize / 2;
  const beakY = preferRight ? clampedTop + tipH / 2 - beakSize / 2 : clampedTop - (beakSize - 2);
  const beakRotation = preferRight ? 180 : 270; // 180 — влево, 270 — вверх

  // ===== контент (fallback тексты для шагов 1/2)
  const fallbackTitle =
    targetSelector === '#ws-onb-anchor'
      ? 'Welcome to the Workspace'
      : targetSelector === '#ws-input-panel'
        ? 'Compose and attach'
        : undefined;

  const fallbackBody =
    targetSelector === '#ws-onb-anchor'
      ? 'This is your working area. The left sidebar hosts extra tools; the right sidebar is your technical zone.'
      : targetSelector === '#ws-input-panel'
        ? 'Here you can attach an image or other materials, and send either a standard or your personalised command.'
        : undefined;

  return (
    <>
      {/* ===== Фон: виньетка + scanlines ===== */}
      <div
        aria-hidden
        data-interactive="true"
        data-overlay
        className="fixed inset-0 z-[70]"
        onClick={onDismiss}
        style={{
          background:
            'radial-gradient(120% 120% at 20% 10%, rgba(8,10,12,0.52), rgba(8,10,12,0.70))',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 0.5px, transparent 0.5px, transparent 6px)',
            maskImage:
              'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        />
      </div>

      {/* ===== Хайлайт цели (halo) ===== */}
      <div
        aria-hidden
        className="fixed z-[71] pointer-events-none"
        style={{
          top: rect.top + window.scrollY - 14,
          left: rect.left + window.scrollX - 14,
          width: rect.width + 28,
          height: rect.height + 28,
          borderRadius: 12,
          boxShadow: '0 0 0 99999px rgba(0,0,0,0.44)',
          WebkitMaskImage: 'radial-gradient(120% 120% at 50% 50%, black 64%, transparent 100%)',
          maskImage: 'radial-gradient(120% 120% at 50% 50%, black 64%, transparent 100%)',
          transition: 'all 200ms cubic-bezier(.22,1,.36,1)',
        }}
      />
      <div
        aria-hidden
        className="fixed z-[72] pointer-events-none"
        style={{
          top: rect.top + window.scrollY - 8,
          left: rect.left + window.scrollX - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          borderRadius: 10,
          background:
            'radial-gradient(80% 80% at 50% 50%, rgba(168,85,247,0.28), rgba(168,85,247,0) 72%)',
          filter: 'blur(8px)',
          opacity: 0.92,
        }}
      />

      {/* ===== Выпуклая стрелка (beak) ===== */}
      <svg
        className="fixed z-[73] pointer-events-none"
        width={beakSize}
        height={beakSize}
        style={{ left: beakX, top: beakY }}
        viewBox="0 0 24 24"
      >
        <defs>
          <radialGradient id="beakGlow" cx="35%" cy="35%" r="85%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </radialGradient>
          <linearGradient id="beakEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.60)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.00)" />
          </linearGradient>
        </defs>

        <g transform={`rotate(${beakRotation}, 12, 12)`}>
          <ellipse
            cx="12"
            cy="19"
            rx="6.5"
            ry="3"
            fill="rgba(0,0,0,0.35)"
            opacity="0.45"
            transform="translate(0,-2)"
          />
          <path
            d="M12 1 C18 4, 23 9, 12 23 C1 9, 6 4, 12 1 Z"
            fill="url(#beakGlow)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.5"
          />
          <path
            d="M12 2.2 C16.8 4.8, 20.4 8.1, 12 21"
            stroke="url(#beakEdge)"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      </svg>

      {/* ===== Тултип ===== */}
      <div
        role="dialog"
        aria-modal="true"
        ref={tooltipRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="
          fixed z-[80]
          w-[min(320px,calc(100vw-32px))]
          rounded-[18px] text-white focus:outline-none
          ring-1 ring-white/10 backdrop-blur
          shadow-[0_8px_24px_rgba(0,0,0,0.42)]
          pointer-events-auto
        "
        style={{
          top: clampedTop,
          left: clampedLeft,
          padding: '12px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.42)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06)), conic-gradient(from 312deg at 18% 10%, rgba(255,255,255,0.16), rgba(255,255,255,0) 60%)',
          backgroundBlendMode: 'screen, normal',
        }}
      >
        <p className="text-[13.5px] leading-[1.45] text-white/92">
          {(title || fallbackTitle) && (
            <span className="block font-semibold mb-1 text-white">{title ?? fallbackTitle}</span>
          )}
          {body ?? fallbackBody}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] tracking-[0.14em] uppercase text-white/65">
            DO BETTER. MOVE FURTHER.
          </span>

          <div className="flex items-center gap-2">
            {!hideSecondary && (
              <button
                onClick={onDismiss}
                className="
                  inline-flex items-center justify-center
                  rounded-full px-3 h-[30px]
                  text-[12.5px] leading-none text-white/88
                  ring-1 ring-white/12
                  bg-white/10 hover:bg-white/15
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                  whitespace-nowrap
                "
              >
                Later
              </button>
            )}

            <button
              onClick={async () => {
                try {
                  await onAccept?.();
                } finally {
                  await onDismiss?.();
                }
              }}
              className="
                inline-flex items-center justify-center
                rounded-full px-3 h-[30px]
                text-[12.5px] leading-none text-black
                bg-white hover:bg-white/90
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                whitespace-nowrap
              "
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
