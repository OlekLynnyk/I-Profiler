'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

type Props = {
  /** Путь к изображению часов (прозрачный PNG/JPG) */
  watchSrc: string; // напр.: "/images/watch1.png"
  watchAlt?: string;
  /** Подпись сверху (центральная метка) */
  topMetric?: { label: string; value: string };
  /** Боковые метрики (clockwise с левого-верхнего) */
  metrics?: Array<{ label: string; value: string }>; // [Austerity, Spontaneity, Reliability, Strictness]
  /** Тексты слева (заголовок большой + подпись малая) */
  titleDesktop?: string;
  captionDesktop?: string;
  /** Тексты (mobile) */
  titleMobile?: string;
  captionMobile?: string;
  className?: string;
};

const easing: any = [0.22, 1, 0.36, 1];

export default function WatchExplainer({
  watchSrc,
  watchAlt = 'Watch',
  topMetric = { label: 'Precision', value: '95%' },
  metrics = [
    { label: 'Austerity', value: '42%' },
    { label: 'Spontaneity', value: '6%' },
    { label: 'Reliability', value: '88%' },
    { label: 'Strictness', value: '17%' },
  ],
  titleDesktop = 'One accessory image is all it takes. No biometrics.\nNo profiling. Just Discernment.',
  captionDesktop = 'Built for clear judgement.\nPrivacy-minded by design.',
  titleMobile = 'One accessory image is all it takes. No biometrics. No profiling. Just Discernment.',
  captionMobile = 'Built for clear judgement.\nPrivacy-minded by design.',
  className,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <section
      className={clsx(
        'relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8',
        'py-10 md:py-16',
        className
      )}
      aria-label="Discernment explainer"
    >
      {/* ===== DESKTOP (≥ md) ===== */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 lg:gap-12 items-center">
        {/* LEFT: текст */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          whileInView={
            reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } }
          }
          viewport={{ once: true, amount: 0.5 }}
          className="relative z-20 flex flex-col gap-10"
        >
          <h2
            className="
              whitespace-pre-line text-white
              font-mono small-caps mono-sc-fix

              text-[28px] leading-[1.45]
              max-w-[652px]
            "
          >
            {titleDesktop}
          </h2>

          <p
            className="
              whitespace-pre-line text-white/50
              font-mono small-caps mono-sc-fix

              text-[18px] leading-[1.45] max-w-[351px]
            "
          >
            {captionDesktop}
          </p>
        </motion.div>

        {/* RIGHT: часы + оверлеи */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          whileInView={
            reduce
              ? undefined
              : { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing, delay: 0.05 } }
          }
          viewport={{ once: true, amount: 0.5 }}
          className="relative w-[635px] h-[803px] mx-auto overflow-hidden isolate z-0"
        >
          {/* ===== Градиентные тени из Figma (DESKTOP) ===== */}
          {/* Нижняя тень под часами */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[629px] w-[635px] h-[94.83px] z-[50]"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0.1))',
              filter: 'blur(10px)',
            }}
          />
          {/* Левая боковая тень */}
          <div
            className="pointer-events-none absolute left-0 top-[148px] h-[562px] w-[435px] rotate-90 z-[50]"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0.1))',
              filter: 'blur(30px)',
            }}
          />
          {/* Правая боковая тень */}
          <div
            className="pointer-events-none absolute right-[-426.72px] top-[148px] h-[562px] w-[435px] rotate-90 z-[50]"
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0.1))',
              filter: 'blur(30px)',
            }}
          />

          {/* Сами часы */}
          <div className="absolute left-1/2 top-[305px] -translate-x-1/2 z-10">
            <div className="relative w-[233.68px] h-[408.09px]">
              <div
                className="absolute inset-0 z-[1] rounded-none"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))' }}
              />
              <Image
                src={watchSrc}
                alt={watchAlt}
                width={234}
                height={409}
                className="relative z-0 w-[233.68px] h-[408.09px] object-contain"
                priority
              />
            </div>
          </div>

          {/* Верхняя центральная метка */}
          <div className="absolute left-1/2 top-[109px] -translate-x-[55%] w-[194px] text-center z-10">
            <div className="text-white font-mono [font-variant:small-caps] text-[20.09px] leading-[1.45] mt-[27px]">
              <div>[{topMetric.label}]</div>
              <div>{topMetric.value}</div>
            </div>

            {/* Полоска между текстом и линзой */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[90px] h-[75px] w-px bg-white/80 opacity-80" />

            {/* Линза */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[164px] w-[64.35px] h-[64.35px] rounded-full border border-white/40"
              style={{
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                boxShadow: 'inset 0px 6.77332px 11.8533px rgba(255, 255, 255, 0.55)',
                transform: 'rotate(-180deg)',
              }}
            />
          </div>

          {/* [Spontaneity] 6% */}
          <div className="absolute left-[428.41px] top-[273.25px] w-[187px] h-[64px] text-center text-white/40 font-mono [font-variant:small-caps] text-[18.01px] leading-[1.45]">
            <div>[{metrics[1].label}]</div>
            <div>{metrics[1].value}</div>
          </div>
          <svg
            className="absolute pointer-events-none z-20"
            width="270"
            height="270"
            style={{ left: 430, top: 230, zIndex: 50, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="5" y1="270" x2="80" y2="110" stroke="currentColor" strokeWidth="1" />
            <circle cx="7" cy="266" r="4" fill="currentColor" />
          </svg>

          {/* [Austerity] 42% */}
          <div className="absolute left-[47.41px] top-[273.25px] w-[158px] h-[64px] text-center text-white/40 font-mono [font-variant:small-caps] text-[18.01px] leading-[1.45]">
            [{metrics[0].label}] {metrics[0].value}
          </div>
          <svg
            className="absolute pointer-events-none"
            width="250"
            height="250"
            style={{ left: 0, top: 320, zIndex: 20, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="125" y1="15" x2="216" y2="95" stroke="currentColor" strokeWidth="1" />
            <circle cx="216" cy="95" r="4" fill="currentColor" />
          </svg>

          {/* [Strictness] 17% */}
          <div className="absolute left-[20.32px] top-[510.32px] w-[172px] h-[64px] text-center text-white/40 font-mono [font-variant:small-caps] text-[18.01px] leading-[1.45]">
            [{metrics[3].label}] {metrics[3].value}
          </div>
          <svg
            className="absolute pointer-events-none"
            width="250"
            height="250"
            style={{ left: -20, top: 552, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="125" y1="15" x2="216" y2="15" stroke="currentColor" strokeWidth="1" />
            <circle cx="216" cy="15" r="4" fill="currentColor" />
          </svg>

          {/* [Reliability] 88% */}
          <div className="absolute left-[443.65px] top-[550.96px] w-[187px] h-[64px] text-center text-white/40 font-mono [font-variant:small-caps] text-[18.01px] leading-[1.45]">
            [{metrics[2].label}] {metrics[2].value}
          </div>
          <svg
            className="absolute pointer-events-none z-20"
            width="570"
            height="570"
            style={{ left: 385, top: 560, zIndex: 50, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="-25" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="1" />
            <circle cx="4" cy="50" r="4" fill="currentColor" />
          </svg>
        </motion.div>
      </div>

      {/* ===== MOBILE (< md) ===== */}
      <div className="md:hidden flex flex-col items-center">
        <motion.h2
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          whileInView={
            reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.45, ease: easing } }
          }
          viewport={{ once: true, amount: 0.5 }}
          className="mt-18 text-center font-mono [font-variant:small-caps] text-white text-[20px] leading-[1.45] w-[351px]"
        >
          <span className="text-white">One accessory image is all it takes.</span>{' '}
          <span className="text-white/50">No biometrics. No profiling. Just Discernment.</span>
        </motion.h2>

        {/* ===== ГРУППА ЧАСОВ (MOBILE) — 1-в-1 визуально с десктопом, пропорционально ===== */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          whileInView={
            reduce
              ? undefined
              : { opacity: 1, y: 0, transition: { duration: 0.45, ease: easing, delay: 0.04 } }
          }
          viewport={{ once: true, amount: 0.5 }}
          className="relative w-[375px] h-[450px] mt-4"
        >
          {/* Нижняя тень (scaled) */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[30px] w-[375px] h-[56px] z-[5]"
            style={{ background: 'linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0))' }}
          />
          {/* Левая тень (горизонтальный градиент) */}
          <div
            className="pointer-events-none absolute left-0 top-[120px] h-[330px] w-[80px] z-[5]"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
              filter: 'blur(20px)',
            }}
          />
          {/* Правая тень (горизонтальный градиент) */}
          <div
            className="pointer-events-none absolute right-0 top-[120px] h-[330px] w-[80px] z-[5]"
            style={{
              background: 'linear-gradient(270deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Верхняя центральная метка (как на десктопе) */}
          <div className="absolute left-1/2 top-[40px] -translate-x-[53%] w-[180px] text-center z-10">
            <div className="text-white font-mono [font-variant:small-caps] text-[16px] leading-[1.45] mt-[10px]">
              <div>[{topMetric.label}]</div>
              <div>{topMetric.value}</div>
            </div>
            {/* Полоска над линзой — толще */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[68px] h-[60px] w-[2px] bg-white/80 opacity-80" />
            {/* Линза (scaled) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[128px] w-[44px] h-[44px] rounded-full border border-white/40"
              style={{
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                boxShadow: 'inset 0px 4px 8px rgba(255,255,255,0.55)',
                transform: 'rotate(-180deg)',
              }}
            />
          </div>

          {/* Часы */}
          <div className="absolute left-1/2 top-[180px] -translate-x-1/2">
            <div className="relative w-[138px] h-[241px]">
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))' }}
              />
              <Image
                src={watchSrc}
                alt={watchAlt}
                width={138}
                height={241}
                className="relative w-[138px] h-[241px] object-contain"
                priority
              />
            </div>
          </div>

          {/* Подписи & линии — те же цвета/логика что на десктопе */}
          {/* Spontaneity (право-верх) */}
          <div className="absolute left-[290px] top-[160px] w-[110px] h-[38px] text-center text-white/40 font-mono [font-variant:small-caps] text-[13px] leading-[1.45]">
            <div>[{metrics[1].label}]</div>
            <div>{metrics[1].value}</div>
          </div>
          <svg
            className="absolute pointer-events-none"
            width="280"
            height="280"
            style={{ left: 270, top: 160, color: 'rgba(255,255,255,0.5)' }}
          >
            <line x1="0" y1="140" x2="70" y2="40" stroke="currentColor" strokeWidth="1" />
            <circle cx="2" cy="137" r="3" fill="currentColor" />
          </svg>

          {/* Austerity (лево-верх) */}
          <div className="absolute left-[16px] top-[160px] w-[94px] h-[38px] text-center text-white/40 font-mono [font-variant:small-caps] text-[13px] leading-[1.45]">
            [{metrics[0].label}] {metrics[0].value}
          </div>
          <svg
            className="absolute pointer-events-none"
            width="150"
            height="130"
            style={{ left: -15, top: 200, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="75" y1="5" x2="130" y2="55" stroke="currentColor" strokeWidth="1" />
            <circle cx="130" cy="55" r="3" fill="currentColor" />
          </svg>

          {/* Strictness (лево-низ) */}
          <div className="absolute left-[10px] top-[320px] w-[102px] h-[38px] text-center text-white/40 font-mono [font-variant:small-caps] text-[13px] leading-[1.45]">
            [{metrics[3].label}] {metrics[3].value}
          </div>
          <svg
            className="absolute pointer-events-none"
            width="150"
            height="80"
            style={{ left: -10, top: 352, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="75" y1="10" x2="130" y2="10" stroke="currentColor" strokeWidth="1" />
            <circle cx="130" cy="10" r="3" fill="currentColor" />
          </svg>

          {/* Reliability (право-низ) */}
          <div className="absolute left-[285px] top-[350px] w-[110px] h-[38px] text-center text-white/40 font-mono [font-variant:small-caps] text-[13px] leading-[1.45]">
            [{metrics[2].label}] {metrics[2].value}
          </div>
          <svg
            className="absolute pointer-events-none"
            width="220"
            height="90"
            style={{ left: 215, top: 370, color: 'rgba(255,255,255,0.4)' }}
          >
            <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="1" />
            <circle cx="3" cy="20" r="3" fill="currentColor" />
          </svg>

          {/* Нижний fade (как на десктопе) */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[375px] h-[56px] bg-gradient-to-t from-black to-transparent" />
        </motion.div>

        <p className="mt-6 mb-8 text-center w-[351px] text-white font-mono [font-variant:small-caps] text-[16px] leading-[1.45] whitespace-pre-line">
          {captionMobile}
        </p>
      </div>
    </section>
  );
}
