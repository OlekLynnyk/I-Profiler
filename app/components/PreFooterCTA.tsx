'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  onTryClick?: () => void; // откроем AuthModal из HomePage
  className?: string;
};

const easing: any = [0.22, 1, 0.36, 1];

export default function PreFooterCTA({ onTryClick, className }: Props) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="prefooter-cta-title"
      className={[
        // размеры/отступы из фигмы: desktop pY=72 gap=40, mobile pY=24 gap=12
        'relative z-10 mx-auto w-full',
        'px-3 md:px-3',
        'pt-6 pb-24 md:py-[72px]',
        'flex flex-col items-center justify-center',
        'gap-3 md:gap-10',
        'bg-black',
        className ?? '',
      ].join(' ')}
    >
      {/* Заголовок */}
      <motion.h2
        id="prefooter-cta-title"
        className={[
          'text-center text-white/50 font-normal',
          // font-variant: small-caps; и моно-семейство из фигмы
          'font-monoBrand small-caps mono-sc-fix',
          // desktop: 32/48, mobile: 15/22 (в макете mobile заголовка нет — оставим мягче)
          'text-[15px] leading-[1.45] md:text-[28px] md:leading-[1.5]',
          'max-w-[90%] md:max-w-[652px]',
        ].join(' ')}
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        whileInView={
          reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } }
        }
        viewport={{ once: true, amount: 0.6 }}
      >
        Do better, move further
        <br className="hidden md:block" />
        <span className="md:whitespace-nowrap">
          {' '}
          with <strong className="text-white/80">H1NTED</strong>
        </span>
      </motion.h2>

      {/* Кнопки */}
      <motion.div
        className={[
          'w-full md:w-auto',
          // mobile: row, equal widths; gap 12  — desktop gap 24
          'flex flex-row items-center justify-center',
          'gap-3 md:gap-6',
          'py-6 md:pb-[120px]',
          'max-w-[351px] md:max-w-none',
        ].join(' ')}
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        whileInView={
          reduce
            ? undefined
            : { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.05, ease: easing } }
        }
        viewport={{ once: true, amount: 0.6 }}
      >
        {/* Try for free — белая */}
        <button
          type="button"
          onClick={onTryClick}
          className={[
            'inline-flex items-center justify-center',
            // размеры из фигмы:
            // desktop: h56 px35; mobile: h56 px15; radius 8
            'h-[50px] md:h-[50px]',
            'px-[13px] md:px-[30px]',
            'rounded-[8px] bg-white text-black',
            // шрифт:
            'font-mono font-normal [font-variant:small-caps]',
            'text-[15px] leading-[1.45] md:text-[20px] md:leading-[1.45]',
            // минимальные ширины из макета (mobile 167.5 / desktop 227)
            'w-1/2 md:w-auto md:min-w-[227px]',
            'shadow-[inset_0_1px_0_rgba(0,0,0,0.12)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          ].join(' ')}
        >
          Try for free
        </button>

        {/* See plans — полупрозрачная */}
        <Link
          href="/pricing#pricing"
          className={[
            'inline-flex items-center justify-center',
            'h-[50px] md:h-[50px]',
            'px-[13px] md:px-[30px]',
            'rounded-[8px] bg-white/15 text-white',
            'font-mono font-normal [font-variant:small-caps]',
            'text-[15px] leading-[1.45] md:text-[20px] md:leading-[1.45]',
            'w-1/2 md:w-auto md:min-w-[188px]',
            'ring-1 ring-white/10 hover:ring-white/20 transition',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          ].join(' ')}
        >
          See plans
        </Link>
      </motion.div>
    </section>
  );
}
