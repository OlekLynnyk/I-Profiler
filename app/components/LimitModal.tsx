'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

interface LimitModalProps {
  show: boolean;
  onClose: () => void;
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
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Missing Stripe redirect URL');
      }
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
    <div className="fixed bottom-[145px] w-full flex justify-center px-2 sm:px-4 z-50">
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
          {!expanded ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 text-sm text-white">
              <span className="whitespace-normal md:whitespace-nowrap text-center md:text-left">
                Your subscription limit has been reached 🚀 Upgrade to:
              </span>
              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
                <button
                  onClick={() => handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm')}
                  className="text-[11px] bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md w-full md:w-auto min-w-[95px]"
                >
                  Smarter
                </button>
                <button
                  onClick={() => handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV')}
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
            <div className="relative px-4 py-5 sm:px-6 sm:py-5 rounded-2xl overflow-y-auto max-h-[80vh]">
              <h2 className="text-center text-sm text-gray-300 mb-6">
                Your subscription limit has been reached 🚀
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Smarter Block */}
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-base md:text-lg font-semibold mb-2">Smarter</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Text description for the Smarter plan goes here.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm')}
                    className={`bg-gray-500 hover:bg-gray-600 text-white ${buttonClasses} w-full`}
                  >
                    Upgrade to Smarter
                  </button>
                </div>

                {/* Business Block */}
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-base md:text-lg font-semibold mb-2">Business</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Text description for the Business plan goes here.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV')}
                    className={`bg-purple-600 hover:bg-purple-700 text-white ${buttonClasses} w-full`}
                  >
                    Upgrade to Business
                  </button>
                </div>
              </div>

              <button
                onClick={() => setExpanded(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                aria-label="Collapse"
              >
                <ArrowDownLeft size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button onClick={onClose} className="hidden" aria-hidden="true" />
    </div>
  );
}
