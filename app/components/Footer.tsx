'use client';

import { FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="py-12 px-6 mt-24 relative overflow-hidden bg-[#1A1E23]">
      {/* Блок для фонового изображения */}
      <div
        className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-contain opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('/images/footer-art.png')",
          maskImage:
            'radial-gradient(circle at center, white 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, white 30%, transparent 80%)',
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
        <div className="space-y-2 text-sm text-[#E5E5E5] font-inter font-weight-400">
          <p>© {new Date().getFullYear()} Fractal+ Inc. All rights reserved.</p>
          <p>123 Example Street, Berlin, Germany</p>
          <p>
            Questions or feedback? Write to us at:{' '}
            <a
              href="mailto:support@fractalplus.ai"
              className="text-[#C084FC] hover:underline transition-all"
            >
              support@fractalplus.ai
            </a>
          </p>
        </div>

        <div className="flex items-center gap-6 text-[#E5E5E5] text-lg font-inter font-weight-400">
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C084FC] hover:underline text-sm transition-all"
          >
            Terms of Use
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C084FC] hover:underline text-sm transition-all"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.linkedin.com/in/oleksandrlynnyk/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C084FC] transition-all"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
