'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type DayLimitModalProps = {
  show: boolean;
  onClose: () => void;
  used: number;
  limit: number;
  dailyResetsAtLabel?: string;
  /** если хочешь показывать вместе с месячным — оставь true */
  offsetFromBottomPx?: number; // по умолчанию 145, чтобы не перекрывать monthly
};

export default function DayLimitModal({
  show,
  onClose,
  used,
  limit,
  dailyResetsAtLabel,
  offsetFromBottomPx = 145,
}: DayLimitModalProps) {
  useEffect(() => {
    if (!show) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [show, onClose]);

  if (!show) return null;

  // компактный баннер (как месячный), без затемнения, без expand
  return (
    <div
      className="fixed w-full flex justify-center px-2 sm:px-4 z-40"
      style={{ bottom: `${offsetFromBottomPx}px` }} // чуть выше месячного (который bottom-[100px])
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="daily-compact"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="
            w-full max-w-2xl rounded-2xl border border-gray-300 shadow-2xl shadow-gray-400/20
            overflow-hidden
            bg-gradient-to-br from-black via-gray-900 to-black
            text-[var(--text-primary)]
          "
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 text-sm text-white">
            <span className="whitespace-normal md:whitespace-nowrap text-center md:text-left">
              Daily limit reached: {used}/{limit}
              {dailyResetsAtLabel ? ` • Resets at ${dailyResetsAtLabel}` : ''}
            </span>
            <div className="flex gap-2 md:items-center w-full md:w-auto justify-center md:justify-end">
              <button
                onClick={onClose}
                className="text-[11px] bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md w-full md:w-auto min-w-[95px]"
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
