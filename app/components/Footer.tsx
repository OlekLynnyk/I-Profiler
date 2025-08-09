'use client';

import { FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-16 sm:mt-24 px-4 sm:px-6 py-10 sm:py-12 relative overflow-hidden bg-transparent pb-[env(safe-area-inset-bottom)]">
      {/* Фоновый арт (осьминог) — МЕНЬШЕ и скрыт на мобиле */}
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

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 text-center md:text-left">
        {/* Левая колонка */}
        <div className="w-full md:w-auto space-y-2 text-[13px] sm:text-sm text-[#E5E5E5] font-inter">
          <p>© {new Date().getFullYear()} H1NTED Ltd. All rights reserved.</p>
          <p>123 Example Street, Dublin, Ireland</p>
          <p>
            Questions or feedback? Write to us at:{' '}
            <a
              href="mailto:support@hinted.ai"
              className="text-[#C084FC] hover:underline transition-all break-all"
            >
              support@hinted.ai
            </a>
          </p>
        </div>

        {/* Правая колонка */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-3 text-[#E5E5E5] text-sm font-inter">
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C084FC] hover:underline transition-all"
          >
            Terms of Use
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C084FC] hover:underline transition-all"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.linkedin.com/in/oleksandrlynnyk/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-[#C084FC] transition-all"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
