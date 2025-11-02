'use client';

import { FaLinkedin } from 'react-icons/fa';
import { motion, useReducedMotion } from 'framer-motion';

const EMAIL = 'hello@h1nted.com';

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="relative overflow-hidden bg-black pb-[env(safe-area-inset-bottom)] font-monoBrand">
      {/* ── ТОП-ЛАЙН (hairline) как в фигме ───────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px z-10
                   bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[144px] left-1/2 -translate-x-1/2 w-[min(1100px,92%)] h-[200px] bg-white/5 blur-2xl rounded-[999px] z-0"
      />

      {/* ── DESKTOP BACKDROP: размазанные градиенты/подсветка ─────────────────── */}
      <div
        aria-hidden
        className="hidden md:block pointer-events-none absolute inset-x-0 bottom-0 h-[430px] -z-10"
      >
        {/* большой размытый слой (радиальная подсветка снизу) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[303px] w-[3449px] h-[753px] opacity-20"
          style={{
            // мягкая белая «подложка» как glow
            background:
              'radial-gradient(60% 60% at 50% 100%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
            filter: 'blur(117px)',
          }}
        />
        {/* задний вертикальный градиент (opacity 0.6 по фигме) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[54px] w-[3449px] h-[679px] opacity-60"
          style={{
            background: 'linear-gradient(180deg, #403C41 0%, #A49AA7 35.52%)',
            filter: 'blur(47px)',
            transform: 'matrix(1, 0, 0, -1, 0, 0)',
          }}
        />
        {/* передний вертикальный градиент (opacity 0.9 по фигме) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-[1249px] h-[679px] opacity-90"
          style={{
            background: 'linear-gradient(180deg, #403C41 0%, #FFFFFF 35.52%)',
            filter: 'blur(47px)',
            transform: 'matrix(1, 0, 0, -1, 0, 0)',
          }}
        />
      </div>

      {/* ── MOBILE (< md): чёрная панель по фигме ─────────────────────────────── */}
      <section className="md:hidden relative mx-auto w-full max-w-[376px] px-3 py-8">
        <div className="mx-auto flex w-full max-w-[352px] flex-col items-center gap-6">
          {/* Title */}
          <p
            className="w-[352px] text-center text-white"
            style={{
              fontWeight: 400,
              fontSize: 18,
              lineHeight: '145%',
              fontVariant: 'small-caps',
            }}
          >
            Questions or feedback?
            <br />
            Email us:
          </p>

          {/* Email pill (187×40, 10/15 padding) */}
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center rounded-[8px]"
            style={{
              width: 187,
              height: 40,
              padding: '10px 15px',
              background: 'rgba(255,255,255,0.15)',
            }}
          >
            <span
              className="text-white text-center"
              style={{
                fontWeight: 400,
                fontSize: 15,
                lineHeight: '145%',
                fontVariant: 'small-caps',
              }}
            >
              {EMAIL}
            </span>
          </a>

          {/* Legal (13px, 145%, opacity .5, центр) */}
          <div className="pt-1 w-[352px] text-center">
            <p
              className="mx-auto text-white/50"
              style={{
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '145%',
                fontVariant: 'small-caps',
              }}
            >
              <br />
              © 2025 LLC “H1NTED”. Proprietary technology protected by IP and trade-secret laws.
              <br />
              No reverse engineering, scraping, automated extraction, benchmarking, or training AI
              models on our data or outputs.
              <br />
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">
                See Terms
              </a>{' '}
              &amp;{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                Privacy
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── DESKTOP (≥ md): сетка/размеры по фигме ────────────────────────────── */}
      <section className="hidden md:block relative">
        <div className="mx-auto w-full max-w-[1441px] px-[100px]">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-[430px] items-center"
          >
            {/* Контентный фрейм: padding 72px 100px, gap 40, justify-between */}
            <div className="flex w-full items-center justify-between gap-10 py-[72px]">
              {/* Левая колонка: 377, gap 24 */}
              <div className="flex w-[377px] flex-col items-start gap-6">
                <p
                  className="text-white"
                  style={{
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: '24px',
                    fontVariant: 'small-caps',
                  }}
                >
                  Questions or feedback?
                  <br />
                  Email us:
                </p>

                {/* Email pill 187×56 */}
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center justify-center rounded-[8px]"
                  style={{
                    width: 160,
                    height: 45,
                    padding: '10px 15px',
                    background: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <span
                    className="text-white text-center"
                    style={{
                      fontWeight: 400,
                      fontSize: 15,
                      lineHeight: '145%',
                      fontVariant: 'small-caps',
                    }}
                  >
                    {EMAIL}
                  </span>
                </a>
              </div>

              {/* Правая колонка: легал + ссылки (ширина/центр как в фигме) */}
              <div className="flex w-[767px] mx-auto flex-col items-start gap-4">
                <p
                  className="mx-auto text-white/50"
                  style={{
                    fontSize: 16,
                    lineHeight: '24px',
                    fontWeight: 400,
                    fontVariant: 'small-caps',
                  }}
                >
                  <br />
                  © 2025 LLC “H1NTED”. Proprietary technology protected by IP and trade-secret
                  laws.
                  <br />
                  No reverse engineering, scraping, automated extraction, benchmarking, or training
                  AI models on our data or outputs.
                </p>

                <p
                  className="text-white/50"
                  style={{
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: '24px',
                    fontVariant: 'small-caps',
                  }}
                >
                  See{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Terms
                  </a>{' '}
                  ·{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Privacy
                  </a>{' '}
                  ·{' '}
                  <a
                    href="/cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Cookies
                  </a>{' '}
                  ·{' '}
                  <a
                    href="/cookies/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Cookie Settings
                  </a>{' '}
                  ·{' '}
                  <a
                    href="/sub-processors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Sub-processors
                  </a>
                </p>
              </div>

              {/* Соц.иконка */}
              <nav className="ml-6 flex items-center" aria-label="Footer navigation">
                <a
                  href="https://www.linkedin.com/in/oleksandrlynnyk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/12 hover:ring-white/25 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2"
                  title="LinkedIn"
                >
                  <FaLinkedin size={16} className="text-white/80" />
                </a>
              </nav>
            </div>
          </motion.div>
        </div>
      </section>
    </footer>
  );
}
