'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Видео-блок:
 * - Desktop: 880×494, фиолетовая рамка #BC81F3, радиус 8px
 * - Mobile: 278×525, та же рамка + caption ниже
 * - Ссылки на видео берутся из NEXT_PUBLIC_VIDEO_BASE_URL (AWS)
 */
export default function VideoShowcase({
  className,
  mobileCaption = 'Do better, move further with H1NTED',
}: {
  className?: string;
  mobileCaption?: string;
}) {
  const reduce = useReducedMotion();

  // 🔗 Ссылки на видео — из ENV (AWS)
  const VIDEO_BASE = process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? '';
  const DESKTOP_VIDEO = `${VIDEO_BASE}/how-it-works-desktop.MP4`;
  const MOBILE_VIDEO = `${VIDEO_BASE}/how-it-works-mobile.MP4`;

  // 🖼️ Постеры (пока статичные)
  const POSTER = '/images/howitworks-poster.jpg';

  return (
    <section
      className={clsx(
        'relative z-10 mx-auto w-full max-w-7xl px-3 md:px-6',
        'flex flex-col items-center justify-center gap-4 md:gap-6',
        className
      )}
      aria-label="Product video"
    >
      {/* DESKTOP */}
      <motion.div
        className="hidden md:block"
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        whileInView={
          reduce
            ? undefined
            : {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              }
        }
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="w-[980px] h-[494px] rounded-[8px] border border-[#BC81F3] overflow-hidden bg-transparent">
          <video
            className="w-full h-full object-cover"
            src={DESKTOP_VIDEO}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </div>
      </motion.div>

      {/* MOBILE */}
      <motion.div
        className="md:hidden"
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        whileInView={
          reduce
            ? undefined
            : {
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              }
        }
        viewport={{ once: true, amount: 0.6 }}
      >
        <div className="w-[278px] h-[525px] rounded-[8px] border border-[#BC81F3] overflow-hidden bg-black/50 mx-auto">
          <video
            className="w-full h-full object-cover"
            src={MOBILE_VIDEO}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </div>

        {/* Caption под видео */}
        <p className="mt-4 mx-auto w-[371px] max-w-[95vw] text-center text-white/50 font-mono [font-variant:small-caps] text-[16px] leading-[1.45]">
          {mobileCaption}
        </p>
      </motion.div>
    </section>
  );
}
