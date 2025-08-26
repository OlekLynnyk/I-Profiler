'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion, useReducedMotion, type Easing, LayoutGroup } from 'framer-motion';

const supabase = createPagesBrowserClient();
const easing: Easing = [0.22, 1, 0.36, 1];
const ACCENT = '#A855F7';

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
      description: 'Human Risk Analytics with AI Discernment',
      features: [
        '10 AI queries',
        'Basic profile insights',
        'Templates for structured analysis',
        'Standard support',
      ],
      highlight: false,
      action: onDemoClick,
    },
    {
      id: 'price_1RQYE4AGnqjZyhfAY8kOMZwm', // Smarter
      name: 'Smarter',
      price: '€249',
      description: 'Advanced profiling tools for individuals',
      features: [
        'Everything in Freemium',
        '250 AI queries',
        'Enhanced AI toolset',
        'Professional Profiling Library',
      ],
      highlight: true,
    },
    {
      id: 'price_1RQYEXAGnqjZyhfAryCzNkqV', // Business
      name: 'Business',
      price: '€799',
      description: 'Enterprise-level access with onboarding',
      features: [
        'Everything in Smarter',
        '1,000 AI queries',
        'Premium support',
        'Advisory session or training on request',
      ],
      highlight: false,
    },
  ];

  // ----- MOBILE STATE -----
  const [activeId, setActiveId] = useState<string>(plans[1].id); // Smarter по умолчанию
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
    const isDisabled = (!isLoggedIn && !isFree) || (isFree && isLoggedIn) || isLoading;

    // базовые стили карточек (крем на тёмном фоне)
    const baseCream = 'bg-[#F6F5ED] text-[#111827]';
    const ringBase = 'ring-1 ring-[#E7E5DD]';
    const radius = 'rounded-3xl';
    const luxShadow = 'shadow-[0_10px_30px_rgba(0,0,0,0.10)]';
    const highlightGlow = plan.highlight
      ? 'ring-1 ring-[#A855F7]/40 shadow-[0_12px_40px_rgba(168,85,247,0.28)]'
      : '';

    const layoutId = `plan-${plan.id}`;

    if (size === 'small') {
      // маленькая карточка — стейбильный блок под ценой
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
            px-5 py-4 min-h-[120px] flex items-start justify-between gap-3
            transition-[transform,box-shadow] duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[${ACCENT}]/60
          `}
          aria-label={`Activate ${plan.name} plan`}
        >
          <div className="flex-1">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em]">{plan.name}</h3>
            <p className="mt-1 text-[22px] font-extrabold">
              {plan.price}
              {!isFree && (
                <span className="text-[11px] align-baseline text-[#4B5563]"> /4 weeks</span>
              )}
            </p>
            <p
              id={`desc-${plan.id}`}
              className="mt-1 text-[#374151] text-[13px] leading-snug line-clamp-2 min-h-[36px]" /* фикс высоты под 2 строки */
            >
              {plan.description}
            </p>
          </div>
          {/* chevron */}
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

    // Large card (главная карточка)
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
        {/* тонкая HL/Accent сверху */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-[#A855F7]/55 to-transparent" />

        {/* бейдж */}
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
            <span className="align-baseline text-[12px] font-medium text-[#4B5563]"> /4 weeks</span>
          )}
        </p>

        {/* Стабильный блок описания — без «прыжков» */}
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

        {/* CTA — c замком при disabled */}
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
          disabled={isDisabled}
          title={!isLoggedIn && !isFree ? 'Please sign in to continue' : ''}
          aria-describedby={`desc-${plan.id}`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {isLoading ? 'Redirecting...' : isFree ? 'Try Demo' : 'Go Executive'}
            {isDisabled && !isLoading && <LockIcon className="opacity-80" />}
          </span>
        </motion.button>
      </motion.div>
    );
  };

  return (
    <section className="pt-6 md:pt-8 pb-16 md:pb-24 bg-transparent" aria-labelledby="pricing-title">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative">
        {/* мягкий глоу сверху */}
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2
          h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl"
          aria-hidden
        />

        <h2
          id="pricing-title"
          className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 sm:mb-8"
        >
          Pricing
        </h2>

        {/* ===== MOBILE (< md) ===== */}
        <LayoutGroup>
          <div className="md:hidden space-y-5">
            {/* КРУПНАЯ КАРТОЧКА — активный план */}
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

            {/* Остальные планы — стэком */}
            <motion.div
              layout
              variants={containerVar}
              initial={false}
              animate="show"
              className="grid grid-cols-1 gap-5"
            >
              {smallPlans.map((p) => (
                <motion.div key={p.id} layout variants={itemVar} initial={false} animate="show">
                  <PlanCard plan={p} size="small" onClick={() => setActiveId(p.id)} />
                </motion.div>
              ))}
            </motion.div>

            <div className="pb-[calc(16px+env(safe-area-inset-bottom))]" />
          </div>
        </LayoutGroup>

        {/* ===== DESKTOP (>= md) ===== */}
        <motion.div
          variants={containerVar}
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, amount: 0.35 }}
          className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left"
        >
          {plans.map((plan) => {
            const isFree = plan.id === 'free';
            const isLoading = loadingPlan === plan.id;
            const isDisabled = (!isLoggedIn && !isFree) || isLoading || (isFree && isLoggedIn);

            return (
              <motion.div
                key={plan.id}
                variants={itemVar}
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
                    <span className="align-middle text-sm font-medium text-white/70">/4 weeks</span>
                  )}
                </div>

                <p className="mt-3 text-base leading-relaxed text-white/70">{plan.description}</p>

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

                {/* CTA — с замком при disabled */}
                <button
                  onClick={
                    isFree
                      ? isLoggedIn
                        ? undefined
                        : plan.action
                      : isLoggedIn
                        ? () => handleCheckout(plan.id)
                        : undefined
                  }
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
                  disabled={
                    (!isLoggedIn && !isFree) || loadingPlan === plan.id || (isFree && isLoggedIn)
                  }
                  title={!isLoggedIn && !isFree ? 'Please sign in to continue' : ''}
                  aria-describedby={`title-desktop-${plan.id}`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loadingPlan === plan.id
                      ? 'Redirecting...'
                      : isFree
                        ? 'Try Demo'
                        : 'Go Executive'}
                    {!isLoggedIn && !isFree && loadingPlan !== plan.id && (
                      <LockIcon className="opacity-85" />
                    )}
                    {isFree && isLoggedIn && loadingPlan !== plan.id && (
                      <LockIcon className="opacity-85" />
                    )}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-[13px] leading-6 text-white/75 mt-6 sm:mt-8 max-w-3xl mx-auto text-center px-2">
          For individual professional advice, training, or API integration, please contact us
          through email.
        </p>

        <span className="sr-only" aria-live="polite">
          {loadingPlan ? 'Redirecting to checkout…' : ''}
        </span>
      </div>
    </section>
  );
}
