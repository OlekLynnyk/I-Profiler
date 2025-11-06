'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, MessageSquare, Pin, AlertTriangle, Ban, User } from 'lucide-react';

type Item = { icon: React.ComponentType<any>; label: string };

const items: Item[] = [
  { icon: Eye, label: 'Hidden Drivers\nand Risks' },
  { icon: MessageSquare, label: 'Communication\nApproach' },
  { icon: Pin, label: 'Decision-\nMaking Style' },
  { icon: AlertTriangle, label: 'Conflict\nManagement' },
  { icon: Ban, label: '‘Go/No-Go’\nAssistance' },
  { icon: User, label: 'C-level\nRecruitment' },
];

const easing: any = [0.22, 1, 0.36, 1];

export default function InsightsGrid() {
  const reduce = useReducedMotion();
  const [openingGallery, setOpeningGallery] = React.useState(false);

  return (
    <section
      aria-labelledby="insights-grid-title"
      className="relative z-10 mx-auto w-full max-w-7xl px-3 md:px-6 pt-6 md:pt-12 pb-[90px] md:pb-[120px]"
    >
      {/* Заголовок — только мобильный (как в фигме) */}
      <motion.h2
        id="insights-grid-title"
        className="md:hidden text-center font-mono [font-variant:small-caps] text-white text-[16px] leading-[1.45]"
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        whileInView={
          reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.45, ease: easing } }
        }
        viewport={{ once: true, amount: 0.6 }}
      >
        We blend behavioural science with AI
      </motion.h2>

      {/* GRID */}
      <div className="mt-4 md:mt-6 flex justify-center">
        {/* Desktop: 6 иконок в ряд; Mobile: 3x2 плитки 124x124 с зазором 2px */}
        <div
          className="
            md:flex md:flex-row md:items-center md:gap-5
            hidden
          "
          aria-hidden={false}
        >
          {items.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              className="w-[122px] md:w-[126px] lg:w-[132px] h-[124px] md:h-[112px] flex flex-col items-center justify-start"
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              whileInView={
                reduce
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, delay: 0.02 * i, ease: easing },
                    }
              }
              viewport={{ once: true, amount: 0.6 }}
            >
              <div className="mt-3 flex items-center justify-center w-10 h-10 md:w-9 md:h-9">
                <Icon className="w-9 h-9 text-white" aria-hidden />
              </div>
              <div
                className="
                  mt-3 text-center text-white font-mono [font-variant:small-caps]
                  text-[14px] leading-[1.45] whitespace-pre-line opacity-95
                "
              >
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* MOBILE grid */}
        <div
          className="
            md:hidden
            w-[377px] max-w-full
            bg-[#010101]
            flex flex-wrap gap-[2px] p-0
          "
          role="list"
          aria-label="Insights categories"
        >
          {items.map(({ icon: Icon, label }, i) => (
            <motion.div
              role="listitem"
              key={label}
              className="w-[calc((100%-4px)/3)] h-[124px] bg-[#0C0C0C] flex flex-col items-center"
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              whileInView={
                reduce
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.35, delay: 0.02 * i, ease: easing },
                    }
              }
              viewport={{ once: true, amount: 0.6 }}
            >
              <div className="mt-5 flex items-center justify-center w-6 h-6">
                <Icon className="w-6 h-6 text-white" aria-hidden />
              </div>
              <div className="mt-3 text-center text-white font-mono [font-variant:small-caps] text-[12px] leading-[1.45] whitespace-pre-line px-2">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA — “See 11 more in Gallery” */}
      <div className="mt-4 md:mt-6 flex justify-center">
        <Link
          href="/gallery"
          onMouseDown={() => setOpeningGallery(true)} // показать "Opening…" до перехода
          aria-busy={openingGallery}
          className="
              inline-flex items-center justify-center
              h-14 md:h-[50px] rounded-[8px] bg-white/15 text-white
              font-mono [font-variant:small-caps]
              text-[15px] md:text-[18px] leading-[1.45]
              px-[15px] md:px-[30px]
              w-[353px] md:w-[325px]
              ring-1 ring-white/10 hover:ring-white/20 transition
              text-center
             "
        >
          {openingGallery ? 'Opening…' : 'See 11 more in Gallery'}
        </Link>
      </div>
    </section>
  );
}
