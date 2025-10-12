'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion, useReducedMotion, type Easing, LayoutGroup } from 'framer-motion';
import { PACKAGE_TO_PRICE, PACKAGE_LIMITS } from '@/types/plan';

const supabase = createPagesBrowserClient();
const easing: Easing = [0.22, 1, 0.36, 1];
const ACCENT = '#A855F7';

// Stripe IDs (centralized)
const SMARTER_ID = PACKAGE_TO_PRICE.Smarter!;
const BUSINESS_ID = PACKAGE_TO_PRICE.Business!;
const SELECT_ID = PACKAGE_TO_PRICE.Select!;

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  action?: () => void;
  highlight?: boolean;
};

export default function Pricing({ onDemoClick }: { onDemoClick: () => void }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(data.session));
    };
    checkSession();
  }, []);

  const handleCheckout = async (priceId: string) => {
    try {
      setLoadingPlan(priceId);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token || '';

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`Stripe checkout failed (${res.status}): ${await res.text()}`);
      const { url } = await res.json();
      if (!url) throw new Error('Missing Stripe redirect URL');
      window.location.href = url;
    } catch (error) {
      console.error('❌ Stripe Checkout Error:', error);
      alert('Something went wrong with Stripe checkout. Please try again later.');
      setLoadingPlan(null);
    }
  };

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Freemium',
      price: '€0',
      description: 'Intro to Advanced AI Discernment',
      features: [
        `${PACKAGE_LIMITS.Freemium.requestsPerMonth} AI analyses`,
        'Deep profile insights',
        'Templates for structured work',
        'Standard support',
      ],
      highlight: false,
      action: onDemoClick,
    },
    {
      id: SELECT_ID,
      name: 'Select',
      price: '€299',
      description: 'For Individual Decision-Makers',
      features: [
        `${PACKAGE_LIMITS.Select.requestsPerMonth} AI analyses`,
        'Advanced Discernment Tools',
        'Deep profile insights',
        'Private workspace',
      ],
      highlight: false,
    },
    {
      id: SMARTER_ID, // Smarter
      name: 'Smarter',
      price: '€449',
      description: 'For Teams That Move Smarter',
      features: [
        'Everything in Select',
        `${PACKAGE_LIMITS.Smarter.requestsPerMonth} AI analyses`,
        'Professional library',
        'Onboarding session on request',
      ],
      highlight: true,
    },
    {
      id: BUSINESS_ID, // Business
      name: 'Business',
      price: '€799',
      description: 'Enterprise Access',
      features: [
        'Everything in Smarter',
        `${PACKAGE_LIMITS.Business.requestsPerMonth} AI analyses`,
        'Premium support',
        'Training session on request',
      ],
      highlight: false,
    },
  ];

  // ----- MOBILE STATE -----
  const [activeId, setActiveId] = useState<string>(SMARTER_ID); // Smarter по умолчанию
  const activePlan = useMemo(() => plans.find((p) => p.id === activeId)!, [plans, activeId]);
  const smallPlans = useMemo(() => plans.filter((p) => p.id !== activeId), [plans, activeId]);

  // ======= Анимации (Framer) =======
  const containerVar = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: reduce ? 0 : 0.06,
        duration: 0.4,
        ease: easing,
      },
    },
  };

  const itemVar = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: easing },
    },
  };

  // ======= Иконка замка (общая) =======
  const LockIcon = ({ className = '' }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`w-4 h-4 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="11" width="15" height="9" rx="2.5" />
      <path d="M8 11V8.5a4 4 0 0 1 8 0V11" />
      <circle cx="12" cy="15.5" r="1.2" />
    </svg>
  );

  // ======= Универсальная карточка (Mobile LUX) =======
  const PlanCard = ({
    plan,
    size,
    onClick,
  }: {
    plan: Plan;
    size: 'small' | 'large';
    onClick?: () => void;
  }) => {
    const isFree = plan.id === 'free';
    const isLoading = loadingPlan === plan.id;

    // базовые стили карточек (крем на тёмном фоне)
    const baseCream = 'bg-[#F6F5ED] text-[#111827]';
    const ringBase = 'ring-1 ring-[#E7E5DD]';
    const radius = 'rounded-3xl';
    const luxShadow = 'shadow-[0_10px_30px_rgba(0,0,0,0.10)]';
    const highlightGlow = plan.highlight
      ? 'ring-1 ring-[#A855F7]/40 shadow-[0_12px_40px_rgba(168,85,247,0.28)]'
      : '';

    const layoutId = `plan-${plan.id}-${size}`;

    if (size === 'small') {
      return (
        <motion.button
          type="button"
          layout
          layoutId={layoutId}
          whileTap={{ scale: 0.985 }}
          transition={{ layout: { duration: 0.35, ease: easing } }}
          onClick={onClick}
          className={`
            ${baseCream} ${radius} ${ringBase} ${luxShadow} ${highlightGlow}
            w-full overflow-hidden text-left
            px-4 py-2 min-h-[72px] flex items-start justify-between gap-3
            transition-[transform,box-shadow] duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[${ACCENT}]/60
          `}
          aria-label={`Activate ${plan.name} plan`}
        >
          <div className="flex-1">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em]">{plan.name}</h3>
            <p className="mt-0 text-[20px] font-extrabold">
              {plan.price}
              {!isFree && (
                <span className="text-[11px] align-baseline text-[#4B5563]"> /month</span>
              )}
            </p>
            <p
              id={`desc-${plan.id}`}
              className="mt-0.5 text-[#374151] text-[12px] leading-tight line-clamp-1 min-h-0"
            >
              {plan.description}
            </p>
          </div>
          <svg
            className="mt-1 h-5 w-5 flex-none opacity-60"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" stroke="#111827" strokeWidth="2" />
          </svg>
        </motion.button>
      );
    }

    // Large card
    return (
      <motion.div
        layout
        layoutId={layoutId}
        transition={{ layout: { duration: 0.35, ease: easing } }}
        className={`
          relative ${baseCream} ${radius} ${ringBase} ${luxShadow} ${highlightGlow}
          p-6
        `}
        role="group"
        aria-labelledby={`title-${plan.id}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-[#A855F7]/55 to-transparent" />
        {plan.highlight && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full
                       px-3 py-1 text-[11px] tracking-wide
                       bg-[#EDE7F6] text-[#4C1D95] ring-1 ring-[#C4B5FD]"
            aria-label="Most popular plan"
          >
            Most popular
          </div>
        )}

        <h3
          id={`title-${plan.id}`}
          className="text-[13px] uppercase tracking-[0.14em] text-[#374151]"
        >
          {plan.name}
        </h3>

        <p className="mt-1 text-[clamp(26px,6vw,32px)] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#1F2937] via-[#1F2937] to-[#6B21A8]">
          {plan.price}
          {!isFree && (
            <span className="align-baseline text-[12px] font-medium text-[#4B5563]"> /month</span>
          )}
        </p>

        <p
          id={`desc-${plan.id}`}
          className="mt-3 text-[#374151] text-[15px] leading-relaxed line-clamp-3 min-h-[60px]"
        >
          {plan.description}
        </p>

        <ul className="mt-5 text-left text-[14px] text-[#374151] space-y-2.5 leading-relaxed">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <svg
                className="mt-[2px] h-4 w-4 flex-none"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path d="M5 12l4 4 10-10" stroke={ACCENT} strokeWidth="2" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={isFree ? (isLoggedIn ? undefined : plan.action) : () => handleCheckout(plan.id)}
          className="
            mt-6 w-full min-h-11 rounded-2xl
            text-[#111827]
            transition-[background,ring,transform] duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60
            disabled:cursor-not-allowed
          "
          style={{
            backgroundImage: `
              radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 60%),
              linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.82))
            `,
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.10)',
            border: '1px solid rgba(168,85,247,0.35)',
          }}
          disabled={(!isLoggedIn && !isFree) || (isFree && isLoggedIn) || loadingPlan === plan.id}
          title={!isLoggedIn && !isFree ? 'Please sign in to continue' : ''}
          aria-describedby={`desc-${plan.id}`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {loadingPlan === plan.id
              ? 'Redirecting...'
              : plan.id === 'free'
                ? 'Start Free'
                : `Choose ${plan.name}`}
            {((!isLoggedIn && !isFree) || (isFree && isLoggedIn)) && loadingPlan !== plan.id && (
              <LockIcon className="opacity-80" />
            )}
          </span>
        </motion.button>
      </motion.div>
    );
  };

  // ===== Desktop window: показываем только 3 карточки (Select, Smarter, Business) =====
  const desktopVisiblePlans = useMemo(
    () => plans.filter((p) => p.id !== 'free').slice(0, 3),
    [plans]
  );

  // === hotspot эффект как в Hero (для десктоп-кнопок) + tooltip для Activate Freemium
  const hotspotMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    (e.currentTarget as HTMLElement).style.setProperty('--mx', `${e.clientX - r.left}px`);
    (e.currentTarget as HTMLElement).style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const [showFreeTip, setShowFreeTip] = useState(false);

  // состояние доступности для верхней кнопки "Activate Freemium" (перенесена логика free-карточки)
  const freeCtaDisabled = isLoggedIn;

  return (
    <section className="pt-6 md:pt-8 pb-16 md:pb-24 bg-transparent" aria-labelledby="pricing-title">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative">
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2
          h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl"
          aria-hidden
        />

        <h2
          id="pricing-title"
          className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#CDB4FF] md:text-white mb-3 sm:mb-8 md:mb-6 uppercase"
        >
          <span
            className="md:hidden block font-extrabold tracking-tight text-[clamp(1.6rem,6.5vw,2rem)]"
            style={{
              letterSpacing: '-0.02em',
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.86))',
              textShadow:
                '0 0 14px rgba(255,255,255,0.12), 1px 0 0 rgba(168,85,247,0.20), -1px 0 0 rgba(99,102,241,0.20)',
            }}
          >
            Find your perfect plan
          </span>
          <span className="hidden md:inline">Find your perfect plan</span>
        </h2>

        {/* ===== DESKTOP CTA ===== */}
        <div className="hidden md:flex items-center justify-center gap-3 mb-8 relative z-30">
          {/* Левая: Activate Freemium со встроенной логикой free-карточки + tooltip */}
          <div className="relative">
            <motion.button
              onMouseMove={hotspotMove}
              onMouseEnter={() => setShowFreeTip(true)}
              onMouseLeave={() => setShowFreeTip(false)}
              onFocus={() => setShowFreeTip(true)}
              onBlur={() => setShowFreeTip(false)}
              onClick={!freeCtaDisabled ? onDemoClick : undefined}
              disabled={freeCtaDisabled}
              aria-describedby="freemium-tip"
              className="relative inline-flex items-center justify-center rounded-full px-5 py-[0.72rem] font-normal text-[15px] leading-snug text-[#F5F3FF] transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23] hover:-translate-y-[1px] min-w-[200px] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundImage: `
                  radial-gradient(160px 160px at var(--mx, 50%) var(--my, 0%), rgba(168,85,247,0.26), rgba(168,85,247,0) 60%),
                  linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))
                `,
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35)',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              whileInView={
                reduce
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: easing, delay: 0.12 },
                    }
              }
              viewport={{ once: true, amount: 0.7 }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-full opacity-60 blur-[6px]"
                style={{
                  background:
                    'radial-gradient(80% 80% at 50% 50%, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0) 70%)',
                }}
              />
              <span className="relative z-[1] inline-flex items-center gap-2">
                Activate Freemium
                {freeCtaDisabled && <LockIcon className="opacity-85" />}
              </span>
            </motion.button>

            {/* Tooltip (только десктоп, лёгкий blur) */}
            {showFreeTip && (
              <div
                id="freemium-tip"
                role="tooltip"
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-[280px] rounded-2xl px-4 py-3 text-[13px] leading-snug text-white/90 bg-black/40 backdrop-blur-md ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)] z-50 pointer-events-none"
              >
                <div className="font-medium">Intro to Advanced AI Discernment</div>
                <div className="opacity-90">Get 4 Free AI Analysis</div>
              </div>
            )}
          </div>

          {/* Правая: Calendly (без изменений логики, активна всегда) */}
          <motion.a
            href="https://calendly.com/founder-h1nted/30min"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={hotspotMove}
            className="relative inline-flex items-center justify-center rounded-full px-5 py-[0.72rem] font-normal text-[15px] leading-snug text-[#F5F3FF] transition-[transform,box-shadow,background,opacity] duration-200 ring-1 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E23] hover:-translate-y-[1px] min-w-[200px]"
            style={{
              backgroundImage: `
                radial-gradient(160px 160px at var(--mx, 50%) var(--my, 0%), rgba(168,85,247,0.26), rgba(168,85,247,0) 60%),
                linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))
              `,
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.10), inset 0 1px 0 rgba(0,0,0,0.35)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            whileInView={
              reduce
                ? undefined
                : {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: easing, delay: 0.16 },
                  }
            }
            viewport={{ once: true, amount: 0.7 }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-full opacity-60 blur-[6px]"
              style={{
                background:
                  'radial-gradient(80% 80% at 50% 50%, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0) 70%)',
              }}
            />
            <span className="relative z-[1]">Book a Video Call</span>
          </motion.a>
        </div>
        {/* ===== /DESKTOP CTA ===== */}

        {/* --- линия под заголовком только для мобайла (как было) --- */}
        <div className="md:hidden mx-auto mt-3 h-px w-[72%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* ===== MOBILE (< md) — без изменений ===== */}
        <LayoutGroup>
          <div className="md:hidden space-y-4">
            <motion.div
              key={activePlan.id}
              layout
              variants={itemVar}
              initial={false}
              animate="show"
              transition={{ layout: { duration: 0.35, ease: easing } }}
              className="transition-all duration-300 ease-out"
            >
              <PlanCard plan={activePlan} size="large" />
            </motion.div>

            <motion.div
              layout
              variants={containerVar}
              initial={false}
              animate="show"
              className="grid grid-cols-1 gap-4"
            >
              {smallPlans.map((p) => (
                <motion.div key={p.id} layout variants={itemVar} initial={false} animate="show">
                  <PlanCard plan={p} size="small" onClick={() => setActiveId(p.id)} />
                </motion.div>
              ))}
            </motion.div>

            <div className="pb-4" />
          </div>
        </LayoutGroup>

        {/* ===== DESKTOP (>= md) — показываем ровно 3 карточки, стрелок нет ===== */}
        <div className="relative hidden md:block">
          <motion.div
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: easing }}
          >
            <motion.div
              variants={containerVar}
              initial={false}
              whileInView={reduce ? undefined : 'show'}
              viewport={{ once: true, amount: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left"
            >
              {desktopVisiblePlans.map((plan) => {
                const isFree = plan.id === 'free'; // всегда false здесь
                const isLoading = loadingPlan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    variants={itemVar}
                    initial={false}
                    className={`
                      group relative rounded-3xl bg-white/5 backdrop-blur
                      ring-1 ring-white/10 p-8
                      shadow-[0_10px_40px_rgba(0,0,0,0.35)]
                      transition-all duration-200
                      hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(168,85,247,0.15)]
                      ${plan.highlight ? 'ring-[#A855F7]/30' : ''}
                    `}
                    role="group"
                    aria-labelledby={`title-desktop-${plan.id}`}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#A855F7]/60 to-transparent rounded-t-3xl" />
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#EDE7F6] text-[#4C1D95] px-3 py-1 text-xs tracking-wide ring-1 ring-[#C4B5FD]">
                        Most popular
                      </div>
                    )}

                    <h3
                      id={`title-desktop-${plan.id}`}
                      className="text-xl font-semibold text-white tracking-tight uppercase"
                    >
                      {plan.name}
                    </h3>

                    <div className="mt-1 text-3xl font-extrabold">
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-[#C4B5FD]">
                        {plan.price}
                      </span>{' '}
                      {!isFree && (
                        <span className="align-middle text-sm font-medium text-white/70">
                          /month
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-base leading-relaxed text-white/70">
                      {plan.description}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <svg
                            className="mt-1 h-5 w-5 flex-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <path d="M5 12l4 4 10-10" stroke={ACCENT} strokeWidth="2" />
                          </svg>
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA карточки (как было) */}
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      className="
                        mt-8 w-full rounded-full px-6 py-4
                        text-white
                        ring-1 ring-[#A855F7]/30
                        backdrop-blur
                        transition-[transform,box-shadow,background] duration-200
                        hover:-translate-y-[1px]
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                      style={{
                        backgroundImage: `
                          radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 60%),
                          linear-gradient(180deg, rgba(168,85,247,0.25), rgba(168,85,247,0.18))
                        `,
                        boxShadow: '0 12px 36px rgba(168,85,247,0.25)',
                      }}
                      disabled={!isLoggedIn || loadingPlan === plan.id}
                      title={!isLoggedIn ? 'Please sign in to continue' : ''}
                      aria-describedby={`title-desktop-${plan.id}`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {loadingPlan === plan.id ? 'Redirecting...' : `Choose ${plan.name}`}
                        {!isLoggedIn && loadingPlan !== plan.id && (
                          <LockIcon className="opacity-85" />
                        )}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        <p className="text-[13px] leading-6 text-white/75 mt-6 sm:mt-8 max-w-3xl mx-auto text-center px-2 min-h-[48px]">
          For individual professional advice, training or partnership, please contact us through{' '}
          <a
            href="mailto:hello@h1nted.com"
            className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-[#A855F7]/70"
          >
            hello@h1nted.com
          </a>
          .
        </p>

        <span className="sr-only" aria-live="polite">
          {loadingPlan ? 'Redirecting to checkout…' : ''}
        </span>
      </div>
    </section>
  );
}
