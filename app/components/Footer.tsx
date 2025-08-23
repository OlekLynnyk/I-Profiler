'use client';

import { FaLinkedin } from 'react-icons/fa';
import { motion, useReducedMotion } from 'framer-motion';

const EMAIL = 'support@hinted.ai';

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="mt-2 sm:mt-4 px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-8 relative overflow-hidden bg-transparent pb-[env(safe-area-inset-bottom)]">
      {/* Верхний hairline — ОСТАВЛЯЕМ */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      {/* Фоновый арт (осьминог) — ОСТАВЛЯЕМ. На мобиле делаем лёгкую версию */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-center bg-no-repeat
                   bg-[length:18px_auto] sm:bg-[length:45px_auto] md:bg-[length:85px_auto] lg:bg-[length:125px_auto]"
        style={{
          backgroundImage: "url('/images/footer-art.png')",
          maskImage: 'radial-gradient(circle at 50% 60%, white 32%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 60%, white 32%, transparent 78%)',
        }}
        initial={false}
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={reduce ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* === MOBILE (< md): компактный 3-строчный футер === */}
      <div className="md:hidden relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-4">
        {/* 1. Email */}
        <p className="text-center text-[13px] leading-relaxed text-white/70">
          Questions or feedback? Email us at{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="font-medium text-[#A855F7] underline-offset-2 hover:underline"
          >
            {EMAIL}
          </a>
        </p>

        {/* 2. Адрес */}
        <p className="text-center text-[12px] text-white/60">
          123 Example Street, Dublin, Ireland, The British Isles.
        </p>

        {/* 3. Навигация (пилюли + LinkedIn) */}
        <nav
          aria-label="Footer navigation"
          className="mt-1 w-full flex items-center justify-center gap-3"
        >
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-4 rounded-full
                       text-[13px] text-white/80 ring-1 ring-white/15
                       hover:ring-[#A855F7]/40 hover:bg-[#A855F7]/10 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
          >
            Terms of Use
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-4 rounded-full
                       text-[13px] text-white/80 ring-1 ring-white/15
                       hover:ring-[#A855F7]/40 hover:bg-[#A855F7]/10 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.linkedin.com/in/oleksandrlynnyk/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full
                       ring-1 ring-white/15 hover:ring-[#A855F7]/40 hover:bg-[#A855F7]/10
                       transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
          >
            <FaLinkedin size={16} className="text-white/80" />
          </a>
        </nav>

        {/* Разделитель (тонкая линия) */}
        <div className="w-full mt-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        </div>

        {/* Копирайт */}
        <p className="pt-3 text-[12px] text-white/60 text-center">
          © {new Date().getFullYear()} H1NTED Ltd. All rights reserved.
        </p>
      </div>

      {/* === DESKTOP (>= md): твоя исходная компоновка — без изменений === */}
      <div className="hidden md:block relative z-10">
        {/* Tier A */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4 text-left">
            <p className="text-sm text-white/70">
              Questions or feedback? Email us at{' '}
              <a href={`mailto:${EMAIL}`} style={{ color: '#A855F7' }} className="font-medium">
                {EMAIL}
              </a>
            </p>
            <p className="text-[13px] text-white/60">
              123 Example Street, Dublin, Ireland, The British Isles.
            </p>
          </div>

          <nav className="flex flex-col items-end gap-5 text-sm" aria-label="Footer navigation">
            <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md px-1"
              >
                Terms of Use
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-md px-1"
              >
                Privacy Policy
              </a>
              <a
                href="https://www.linkedin.com/in/oleksandrlynnyk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/15 hover:ring-[#A855F7]/40 hover:bg-[#A855F7]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
              >
                <FaLinkedin size={16} className="text-white/80" />
              </a>
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        </div>

        {/* Tier B */}
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-[13px] text-white/60">
            © {new Date().getFullYear()} H1NTED Ltd. All rights reserved.
          </p>
          <div className="text-[13px] text-white/60" />
        </div>
      </div>
    </footer>
  );
}
