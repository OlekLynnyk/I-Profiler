'use client';

import { FaLinkedin } from 'react-icons/fa';
import { motion, useReducedMotion } from 'framer-motion';

const EMAIL = 'support@hinted.ai';

// палитра и акцент — согласованы со стилем Pricing
const PANEL_BG = '#F6F5ED';
const PANEL_RING = '#E7E5DD';
const TEXT_STRONG = '#111827';
const TEXT = '#1F2937';
const TEXT_DIM = '#4B5563';
const ACCENT = '#A855F7';

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="mt-6 sm:mt-2 px-4 sm:px-6 pt-12 sm:pt-12 pb-12 md:pb-8 relative overflow-hidden bg-transparent pb-[env(safe-area-inset-bottom)]">
      {/* верхний hairline — только на мобиле (оставил как было) */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/18 to-transparent md:hidden" />

      {/* ===== MOBILE (< md) — светлая «панель-окно» ===== */}
      <section className="md:hidden relative z-10 mx-auto max-w-7xl w-full">
        {/* мягкое свечение под панелью */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -top-3 -translate-x-1/2 h-[56px] w-[min(680px,92%)] rounded-[999px] bg-white/10 blur-2xl"
        />

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[720px] rounded-3xl overflow-hidden"
          style={{
            backgroundColor: PANEL_BG,
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            border: `1px solid ${PANEL_RING}`,
          }}
        >
          {/* акцентная «полка» сверху панели */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#A855F7]/55 to-transparent"
            animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
            transition={reduce ? undefined : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* тонкие scanlines внутри (едва заметно, чтобы не отвлекало) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.04,
              backgroundImage:
                'repeating-linear-gradient(0deg, #111827 0px, #111827 0.5px, transparent 0.5px, transparent 6px)',
              maskImage:
                'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)',
            }}
          />

          {/* контент панели */}
          <div className="relative px-5 pt-6 pb-5">
            <p className="text-center text-[14px] leading-6" style={{ color: TEXT }}>
              Questions or feedback? Email us at{' '}
              <a
                href={`mailto:${EMAIL}`}
                className="font-medium underline decoration-[0.08em] underline-offset-[3px]"
                style={{ color: ACCENT }}
              >
                {EMAIL}
              </a>
            </p>

            <p className="mt-2 text-center text-[13px] leading-6" style={{ color: '#374151' }}>
              123 Example Street, Dublin, Ireland, The British Isles.
            </p>

            <div className="mt-6 h-px w-full" style={{ backgroundColor: PANEL_RING }} />

            <nav
              aria-label="Footer navigation"
              className="mt-4 w-full flex items-center justify-center gap-3"
            >
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-4 rounded-full text-[13px] transition-colors focus:outline-none focus-visible:ring-2"
                style={{
                  color: TEXT_STRONG,
                  border: `1px solid ${PANEL_RING}`,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(4px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                Terms of Use
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-4 rounded-full text-[13px] transition-colors focus:outline-none focus-visible:ring-2"
                style={{
                  color: TEXT_STRONG,
                  border: `1px solid ${PANEL_RING}`,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(4px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                Privacy Policy
              </a>

              <a
                href="https://www.linkedin.com/in/oleksandrlynnyk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2"
                style={{
                  color: TEXT_STRONG,
                  border: `1px solid ${PANEL_RING}`,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(4px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
                title="LinkedIn"
              >
                <FaLinkedin size={16} />
              </a>
            </nav>

            <div className="mt-6 h-px w-full" style={{ backgroundColor: PANEL_RING }} />

            {/* легал — сдержанные тона */}
            <div className="mt-4 space-y-2 text-center">
              <p className="text-[12px] leading-6" style={{ color: TEXT_DIM }}>
                © 2025 H1NTED. Proprietary technology protected by IP and trade-secret laws.
              </p>
              <p className="text-[12px] leading-6" style={{ color: '#6B7280' }}>
                No reverse engineering, scraping, automated extraction, benchmarking, or training AI
                models on our data or outputs.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== DESKTOP (>= md) — без изменений ===== */}
      <div className="hidden md:block relative z-10">
        {/* Внешний контейнер как у Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Внутренние отступы как у Header */}
          <div className="md:pl-[40px] lg:pl-[72px] md:pr-4 lg:pr-[72px]">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-y-6 items-start">
              {/* Левая колонка — ещё уже, больше строк */}
              <div className="flex flex-col gap-2 text-[13px] leading-6 text-white/75 max-w-[46ch] md:max-w-[calc(46ch*0.95)]">
                <p>
                  Questions or feedback? Email us at{' '}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-[#A855F7] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-sm"
                  >
                    {EMAIL}
                  </a>
                </p>
                <p>123 Example Street, Dublin, Ireland, The British Isles.</p>

                <p className="mt-2 text-white/70">
                  © 2025 H1NTED. Proprietary technology protected by IP and trade-secret laws.
                </p>
                <p className="text-[12.5px] leading-relaxed text-white/60">
                  No reverse engineering, scraping, automated extraction, benchmarking, or training
                  AI models on our data or outputs.
                </p>
                {/* Отдельная строка в самом низу */}
                <p className="text-[12.5px] leading-relaxed text-white/60">
                  See{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-sm"
                  >
                    Terms
                  </a>{' '}
                  &{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 rounded-sm"
                  >
                    Privacy
                  </a>
                  .
                </p>
              </div>

              {/* Справа — только LinkedIn */}
              <nav className="flex items-center gap-6 text-[13px]" aria-label="Footer navigation">
                <a
                  href="https://www.linkedin.com/in/oleksandrlynnyk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/12 hover:ring-[#A855F7]/35 hover:bg-[#A855F7]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60"
                >
                  <FaLinkedin size={16} className="text-white/80" />
                </a>
              </nav>
            </div>

            {/* Нижний разделитель внутри тех же внутренних отступов */}
            <div className="mt-4">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
