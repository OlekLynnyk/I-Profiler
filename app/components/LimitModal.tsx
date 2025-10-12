'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { PACKAGE_TO_PRICE, PACKAGE_LIMITS } from '@/types/plan';

interface LimitModalProps {
  show: boolean;
  onClose: () => void;
}

const ACCENT = '#A855F7';

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`h-4 w-4 flex-none mt-[2px] ${className}`}
    >
      <path d="M5 12l4 4 10-10" stroke={ACCENT} strokeWidth="2" />
    </svg>
  );
}

export default function LimitModal({ show, onClose }: LimitModalProps) {
  const [expanded, setExpanded] = useState(false);
  const supabase = createPagesBrowserClient();

  const handleCheckout = async (priceId: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Stripe checkout failed (${res.status}): ${errorText}`);
      }

      const { url } = await res.json();
      if (!url) throw new Error('Missing Stripe redirect URL');
      window.location.href = url;
    } catch (error) {
      console.error('❌ Stripe Checkout Error:', error);
      alert('Something went wrong with Stripe checkout. Please try again later.');
    }
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setExpanded(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setExpanded(false);
    }
  }, [show]);

  if (!show) return null;

  const buttonClasses = 'text-xs px-5 py-2 rounded-xl min-w-[120px] text-center';

  return (
    <div
      className="fixed w-full flex justify-center px-2 sm:px-4 z-50"
      style={{ bottom: 'calc(145px + env(safe-area-inset-bottom, 0px))' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={expanded ? 'expanded' : 'compact'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className={`
            w-full max-w-2xl rounded-2xl border border-gray-300 shadow-2xl shadow-gray-400/20 
            overflow-hidden
            bg-gradient-to-br from-black via-gray-900 to-black
            text-[var(--text-primary)]
          `}
        >
          {/* --- COMPACT: НЕ МЕНЯЕМ --- */}
          {!expanded ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 text-sm text-white">
              <span className="whitespace-normal md:whitespace-nowrap text-center md:text-left">
                Your subscription limit has been reached: 🚀
              </span>
              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
                <button
                  onClick={() => handleCheckout(PACKAGE_TO_PRICE.Smarter!)}
                  className="text-[11px] bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md w-full md:w-auto min-w-[95px]"
                >
                  Smarter
                </button>
                <button
                  onClick={() => handleCheckout(PACKAGE_TO_PRICE.Select!)}
                  className="text-[11px] bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md w-full md:w-auto min-w-[95px]"
                >
                  Select
                </button>
                <button
                  onClick={() => handleCheckout(PACKAGE_TO_PRICE.Business!)}
                  className="text-[11px] bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md w-full md:w-auto min-w-[95px]"
                >
                  Business
                </button>
                <button
                  onClick={() => setExpanded(true)}
                  className="text-gray-400 hover:text-white flex items-center justify-center w-full md:w-auto"
                  aria-label="Expand"
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* --- EXPANDED: МЕНЯЕМ ТОЛЬКО ЗДЕСЬ --- */
            <div
              className="relative px-4 pt-2 pb-4 sm:px-6 sm:pt-2 sm:pb-5 rounded-2xl overflow-y-auto"
              style={{ maxHeight: 'min(65svh, calc(100vh - 200px))' }}
            >
              <div className="sticky top-0 z-10">
                <div className="flex justify-end pl-4 pr-2 sm:pl-6 sm:pr-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md bg-transparent hover:bg-white/10 text-gray-300 hover:text-white -mr-1 sm:-mr-2 focus:outline-none focus:ring-2 focus:ring-white/20"
                    aria-label="Collapse"
                  >
                    <ArrowDownLeft size={16} />
                  </button>
                </div>
              </div>
              {/* порядок: Select → Smarter → Business */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Select */}
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-base md:text-lg font-semibold">Select</h3>
                    <div className="text-white text-sm md:text-base font-semibold mt-1 mb-2">
                      €299 <span className="text-xs text-white/70 align-middle">/month</span>
                    </div>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Advanced Tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>{PACKAGE_LIMITS.Select!.requestsPerMonth} AI analyses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Deep insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Private workspace</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleCheckout(PACKAGE_TO_PRICE.Select!)}
                    className={`bg-gray-500 hover:bg-gray-600 text-white ${buttonClasses} w-full mt-4`}
                  >
                    Choose Select
                  </button>
                </div>

                {/* Smarter */}
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-base md:text-lg font-semibold">Smarter</h3>
                    <div className="text-white text-sm md:text-base font-semibold mt-1 mb-2">
                      €449 <span className="text-xs text-white/70 align-middle">/month</span>
                    </div>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>All in Select</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>{PACKAGE_LIMITS.Smarter!.requestsPerMonth} AI analyses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Professional library</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Onboarding session</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleCheckout(PACKAGE_TO_PRICE.Smarter!)}
                    className={`bg-gray-500 hover:bg-gray-600 text-white ${buttonClasses} w-full mt-4`}
                  >
                    Choose Smarter
                  </button>
                </div>

                {/* Business */}
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-base md:text-lg font-semibold">Business</h3>
                    <div className="text-white text-sm md:text-base font-semibold mt-1 mb-2">
                      €799 <span className="text-xs text-white/70 align-middle">/month</span>
                    </div>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>All in Smarter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>{PACKAGE_LIMITS.Business!.requestsPerMonth} AI analyses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Premium support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon />
                        <span>Training session</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleCheckout(PACKAGE_TO_PRICE.Business!)}
                    className={`bg-purple-600 hover:bg-purple-700 text-white ${buttonClasses} w-full mt-4`}
                  >
                    Choose Business
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button onClick={onClose} className="hidden" aria-hidden="true" />
    </div>
  );
}
