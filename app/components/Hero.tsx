'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  /** Лого/знак для правой панели (desktop) и центрального блика (mobile) */
  logoSrc?: string; // напр.: "/images/logo-mark.png" или svg
  logoAlt?: string;
  onTryClick: () => void | boolean | Promise<boolean>;
};

/** Настройки анимации */
const TYPE_DELAY = 55;
const DELETE_DELAY = 38;
const HOLD_AFTER_TYPE = 1200;
const HOLD_AFTER_DELETE = 280;

const PHRASES = [
  'make clearer calls',
  'spot bluff faster',
  'catch personal risk',
  'focus on what matters',
  'build trust in seconds',
  'weigh signals not noise',
] as const;

/** Хук тайпврайтера: циклически печатает/стирает фразы */
function useTypewriter(list: readonly string[]) {
  const [index, setIndex] = useState(0);
  const [output, setOutput] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');
  const timerRef = useRef<number | null>(null);

  const current = useMemo(() => list[index], [list, index]);

  useEffect(() => {
    function schedule(fn: () => void, ms: number) {
      timerRef.current = window.setTimeout(fn, ms);
    }

    if (phase === 'typing') {
      if (output.length < current.length) {
        schedule(() => setOutput(current.slice(0, output.length + 1)), TYPE_DELAY);
      } else {
        schedule(() => setPhase('pausing'), HOLD_AFTER_TYPE);
      }
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    if (phase === 'pausing') {
      schedule(() => setPhase('deleting'), HOLD_AFTER_DELETE);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    // deleting
    if (output.length > 0) {
      schedule(() => setOutput(current.slice(0, output.length - 1)), DELETE_DELAY);
    } else {
      schedule(() => {
        setIndex((i) => (i + 1) % list.length);
        setPhase('typing');
      }, 0);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, output, phase]);

  return output;
}

export default function Hero({
  logoSrc = '/images/logo-mark.svg',
  logoAlt = 'brand',
  onTryClick,
}: Props) {
  const typed = useTypewriter(PHRASES);

  // --- локальный стейт и обработчик для кнопки Workspace ---
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

  async function handleWorkspaceClick() {
    if (loadingWorkspace) return; // защита от повторных нажатий
    const r = await Promise.resolve(onTryClick?.());
    if (r === true) setLoadingWorkspace(true); // включаем лоадер, если редирект действительно пошёл
  }

  return (
    <section className="relative z-0 w-full text-white">
      {/* ==== DESKTOP (>= md) ==== */}
      <div className="hidden md:block relative z-0 min-h-[800px]">
        {/* Левая колонка по фигме */}
        <div
          className="absolute"
          style={{
            left: 100,
            top: 0,
            width: 583,
            height: 801,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 40,
          }}
        >
          {/* Text block — точное разбиение по строкам и цветам */}
          <div
            style={{
              width: 583,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* 1-я строка — белая */}
            <span
              className="font-monoBrand small-caps"
              style={{ fontWeight: 400, fontSize: 28, lineHeight: '1.45', color: '#FFFFFF' }}
            >
              Human insight, instantly.
            </span>
            {/* 2-я — серая */}
            <span
              className="font-monoBrand small-caps"
              style={{
                fontWeight: 400,
                fontSize: 28,
                lineHeight: '1.45',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Read tiny cues from outfits
            </span>
            {/* 3-я — серая */}
            <span
              className="font-monoBrand small-caps"
              style={{
                fontWeight: 400,
                fontSize: 28,
                lineHeight: '1.45',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              to understand people
            </span>
            {/* 4-я — серая */}
            <span
              className="font-monoBrand small-caps"
              style={{
                fontWeight: 400,
                fontSize: 28,
                lineHeight: '1.45',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              with diplomatic precision —
            </span>

            {/* 5-я строка: "and" (серый) + анимация (белая) + каретка + divider */}
            <div
              className="flex items-center gap-[12px] typeLine"
              style={{ width: 660, height: 46, flexWrap: 'nowrap', overflow: 'hidden' }}
            >
              <span
                className="font-monoBrand small-caps"
                style={{
                  fontWeight: 400,
                  fontSize: 32,
                  lineHeight: '145%',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                and{' '}
              </span>
              <span
                className="font-monoBrand small-caps"
                style={{ fontWeight: 400, fontSize: 28, lineHeight: '1.45', color: '#FFFFFF' }}
                aria-live="polite"
                aria-atomic="true"
              >
                {typed}
              </span>
              <span
                className="ml-[2px] caret-blink"
                style={{
                  fontSize: 28, // как у текста
                  lineHeight: '40px', // как у height строки
                  height: 40,
                  display: 'inline-block',
                  verticalAlign: 'bottom',
                }}
              >
                |
              </span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex items-center gap-3" style={{ width: 351, height: 56 }}>
            <button
              type="button"
              className="flex-1 h-[50px] px-[13px] rounded-[8px] bg-white text-black font-monoBrand small-caps text-[18px] leading-[145%]"
              style={{ width: 152 }}
              data-figma="Workspace"
              onClick={handleWorkspaceClick}
              disabled={loadingWorkspace}
              aria-busy={loadingWorkspace}
            >
              {loadingWorkspace ? 'Opening…' : 'Workspace'}
            </button>

            <button
              type="button"
              className="flex-1 h-[50px] px-[13px] rounded-[8px] bg-white/15 text-white font-monoBrand small-caps text-[18px] leading-[145%]"
              style={{ width: 152 }}
              data-figma="Gallery"
              onClick={() => {
                setLoadingGallery(true); // показать “Opening…”
                setTimeout(() => {
                  // дать UI перерисоваться и уйти
                  window.location.href = '/gallery';
                }, 0);
              }}
            >
              {loadingGallery ? 'Opening…' : 'Gallery'}
            </button>
          </div>
        </div>

        {/* Правая бренд-панель (Component 3) */}
        {/* Правая бренд-панель (Component 3) — FINAL VERSION */}
        <div
          className="absolute right-[120px] top-0 pointer-events-none"
          style={{ width: 500, height: 800 }}
          aria-hidden
        >
          {/* Чёрный фон */}
          <div className="absolute inset-0 bg-black pointer-events-none" />

          {/* Градиентные слои */}
          <div className="absolute inset-0">
            {/* Задний мягкий градиент */}
            <div
              className="absolute"
              style={{
                width: 516.79,
                height: 580.04,
                left: -17,
                top: -7,
                background:
                  'linear-gradient(180deg, rgba(64,60,65,0.08) 0%, rgba(164,154,167,0.08) 35.52%)',
                filter: 'blur(72px)',
              }}
            />
            {/* Центральный фокус */}
            <div
              className="absolute"
              style={{
                width: 251.45,
                height: 580.04,
                left: 'calc(50% - 251.45px/2)',
                top: -7,
                background:
                  'linear-gradient(180deg, rgba(64,60,65,0.15) 0%, rgba(164,154,167,0.15) 35.52%)',
                filter: 'blur(72px)',
              }}
            />
          </div>

          {/* Слой с символами (кольцо + осьминог) */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-30"
            style={{
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              isolation: 'isolate',
            }}
          >
            {/* Кольцо */}
            <div className="absolute w-[380px] h-[380px]">
              <Image src="/images/octo-ring.png" alt="Ring" fill style={{ objectFit: 'contain' }} />
            </div>
            {/* Символ */}
            <div className="absolute w-[320px] h-[320px]">
              <Image
                src="/images/octo-symbol.png"
                alt="Octopus"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==== MOBILE (< md) ==== */}
      <div
        className="md:hidden relative z-[1]"
        style={{ width: 375, minHeight: 600, margin: '0 auto' }}
      >
        {/* Фон блока */}
        <div className="absolute inset-0 bg-black pointer-events-none" />

        {/* Верхний блик/градиенты */}
        <div
          className="absolute pointer-events-none"
          style={{ width: 335, height: 376, left: 15, top: -13, opacity: 0.3 }}
        >
          <div
            className="absolute"
            style={{
              width: 335,
              height: 376,
              left: 'calc(50% - 335px/2 - 5px)',
              top: -13,
              background: 'linear-gradient(180deg, #403C41 0%, #A49AA7 35.52%)',
              opacity: 0.1,
              filter: 'blur(47px)',
            }}
          />
          <div
            className="absolute"
            style={{
              width: 163,
              height: 376,
              left: 'calc(50% - 163px/2 - 5px)',
              top: -13,
              background: 'linear-gradient(180deg, #403C41 0%, #A49AA7 35.52%)',
              opacity: 0.9,
              filter: 'blur(47px)',
            }}
          />
        </div>

        {/* Центрированный знак */}
        {logoSrc ? (
          <div
            className="absolute inset-0 flex justify-center opacity-[0.15] pointer-events-none"
            style={{ top: '100px' }}
          >
            <div className="relative" style={{ width: 320, height: 320 }}>
              <Image src="/images/octo-ring.png" alt="ring" fill style={{ objectFit: 'contain' }} />
            </div>
            <div className="absolute" style={{ width: 270, height: 270, top: '25px' }}>
              <Image
                src="/images/octo-symbol.png"
                alt="octopus"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        ) : null}

        {/* Текст + кнопки (внизу, как на макете) */}
        <div className="absolute left-0 right-0 px-5 z-[10]" style={{ bottom: 0 }}>
          {/* Разбито по строкам и цветам как в фигме */}
          <div
            className="font-monoBrand small-caps text-center"
            style={{ fontWeight: 400, fontSize: 18, lineHeight: '145%', color: '#FFFFFF' }}
          >
            {/* 1-я строка — белая */}
            <div>Human insight, instantly.</div>
            {/* 2-4 — серые */}
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Read tiny cues from outfits</div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>to understand people</div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>with uncommon clarity —</div>
            {/* 5-я: and (серый) + typed (белый) + каретка */}
            <div
              className="flex items-center justify-center gap-[8px]"
              style={{ height: 26, lineHeight: '26px', flexWrap: 'nowrap', overflow: 'hidden' }}
            >
              <span
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 18,
                  lineHeight: '26px',
                  height: 26,
                }}
              >
                and
              </span>
              <span
                style={{ color: '#FFFFFF', fontSize: 18, lineHeight: '26px', height: 26 }}
                aria-live="polite"
                aria-atomic="true"
              >
                {typed}
              </span>
              <span
                className="ml-[2px] caret-blink"
                style={{
                  fontSize: 18,
                  lineHeight: '26px',
                  height: 26,
                  display: 'inline-block',
                  verticalAlign: 'bottom',
                }}
              >
                |
              </span>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center h-[50px] px-[13px] rounded-[8px] bg-white text-black font-mono [font-variant:small-caps] text-[15px] leading-[1.45] w-1/2 max-w-[170px]"
              onClick={handleWorkspaceClick}
              disabled={loadingWorkspace}
              aria-busy={loadingWorkspace}
            >
              {loadingWorkspace ? 'Opening…' : 'Workspace'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center h-[50px] px-[13px] rounded-[8px] bg-white/15 text-white font-mono [font-variant:small-caps] text-[15px] leading-[1.45] w-1/2 max-w-[170px]"
              onClick={() => {
                setLoadingGallery(true); // показать “Opening…”
                setTimeout(() => {
                  // дать UI перерисоваться и уйти
                  window.location.href = '/gallery';
                }, 0);
              }}
            >
              {loadingGallery ? 'Opening…' : 'Gallery'}
            </button>
          </div>
        </div>
      </div>

      {/* Локальные стили для каретки */}
      <style jsx>{`
        .caret-blink {
          display: inline-block;
          width: 1ch;
          text-align: left;
          animation: caretBlink 0.9s steps(1, start) infinite;
          will-change: opacity;
        }

        .typeLine {
          contain: layout paint; /* предотвращает каскадный repaint */
        }

        @keyframes caretBlink {
          0%,
          45% {
            opacity: 1;
          }
          50%,
          95% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .caret-blink {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
