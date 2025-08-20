'use client';

import { FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-2 sm:mt-4 px-4 sm:px-6 py-10 sm:py-12 pb-14 sm:pb-12 relative overflow-hidden bg-transparent pb-[env(safe-area-inset-bottom)]">
      {/* стеклянный разделитель сверху */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Фоновый арт (осьминог) — как было */}
      <div
        className="hidden sm:block absolute inset-0 bg-center bg-no-repeat opacity-5 pointer-events-none
                   bg-[length:5px_auto] sm:bg-[length:45px_auto] md:bg-[length:85px_auto] lg:bg-[length:125px_auto]"
        style={{
          backgroundImage: "url('/images/footer-art.png')",
          maskImage: 'radial-gradient(circle at center, white 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, white 30%, transparent 80%)',
        }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 text-center md:text-left">
        {/* Левая колонка */}
        <div className="w-full md:w-auto space-y-2 text-[13px] sm:text-sm text-white/70 font-inter">
          <p>© {new Date().getFullYear()} H1NTED Ltd. All rights reserved.</p>
          <p>123 Example Street, Dublin, Ireland, The British Isles. </p>
          <p>
            Questions or feedback? Write to us at{' '}
            <a
              href="mailto:support@hinted.ai"
              className="text-purple-300 hover:text-purple-200 underline underline-offset-[6px] decoration-purple-300/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50 rounded-sm"
            >
              support@hinted.ai
            </a>
          </p>
        </div>

        {/* Правая колонка */}
        <nav className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-sm font-inter">
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50 rounded-md px-1"
          >
            Terms of Use
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/50 rounded-md px-1"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.linkedin.com/in/oleksandrlynnyk/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/15 hover:ring-purple-300/40 hover:bg-purple-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
          >
            <FaLinkedin size={16} className="text-white/80" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
