'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

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

  // ----- MOBILE STATE (оставляем как есть) -----
  const [activeId, setActiveId] = useState<string>(plans[1].id); // по умолчанию Smarter
  const activePlan = useMemo(() => plans.find((p) => p.id === activeId)!, [plans, activeId]);
  const smallPlans = useMemo(() => plans.filter((p) => p.id !== activeId), [plans, activeId]);

  // ======= Универсальная карточка (ИСПОЛЬЗУЕТСЯ ТОЛЬКО НА МОБИЛЬНОМ — НЕ МЕНЯЕМ ВИЗУАЛ) =======
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
    const borderShadow = plan.highlight
      ? 'border-[#C084FC] shadow-[0_4px_10px_rgba(192,132,252,0.35)]'
      : 'border-[#D1D4D6]';

    if (size === 'small') {
      return (
        <button
          type="button"
          onClick={onClick}
          className={`bg-[#F6F5ED] border ${borderShadow} rounded-xl
                      aspect-square w-full overflow-hidden
                      transition-transform duration-200 active:scale-[0.98]`}
        >
          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
            <h3 className="text-base text-[#111827] font-semibold">{plan.name}</h3>
            <p className="text-2xl text-[#111827] mt-1">
              {plan.price}
              {!isFree && <span className="text-[10px] align-middle"> /4 weeks</span>}
            </p>
            <p className="text-[#374151] text-sm mt-2 line-clamp-3">{plan.description}</p>
          </div>
        </button>
      );
    }

    return (
      <div className={`bg-[#F6F5ED] border ${borderShadow} p-5 rounded-xl shadow`}>
        <h3 className="text-xl text-[#111827] mb-1">{plan.name}</h3>
        <p className="text-3xl text-[#111827] mb-3">
          {plan.price}
          {!isFree && <span className="text-xs align-middle"> /4 weeks</span>}
        </p>
        <p className="text-[#374151] text-base leading-relaxed mb-4">{plan.description}</p>
        <ul className="text-left text-sm text-[#374151] mb-6 space-y-2 leading-relaxed">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span aria-hidden className="mt-0.5 text-[#6B21A8]">
                ✔
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={isFree ? (isLoggedIn ? undefined : plan.action) : () => handleCheckout(plan.id)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#C084FC] text-[#212529] hover:bg-[#D8B4FE] disabled:opacity-50 text-base min-h-11"
          disabled={(isFree && isLoggedIn) || isLoading}
        >
          {isLoading ? 'Redirecting...' : isFree ? 'Try Demo' : 'Get Started'}
        </button>
      </div>
    );
  };

  return (
    <section className="pt-6 md:pt-8 pb-16 md:pb-24 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative">
        {/* лёгкий верхний глоу — как в How it works */}
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2
          h-[120px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl"
        />

        {/* Заголовок — lux */}
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 sm:mb-8">
          Pricing
        </h2>

        {/* ===== MOBILE (< md): ОСТАВЛЕНО БЕЗ ИЗМЕНЕНИЙ ===== */}
        <div className="md:hidden space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {smallPlans.map((p) => (
              <PlanCard key={p.id} plan={p} size="small" onClick={() => setActiveId(p.id)} />
            ))}
          </div>

          <div
            key={activePlan.id}
            className="transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95"
          >
            <PlanCard plan={activePlan} size="large" />
          </div>

          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>

        {/* ===== DESKTOP (>= md): ✨ LUX DESKTOP ✨ ===== */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => {
            const isFree = plan.id === 'free';
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`
                  group relative rounded-3xl bg-white/5 backdrop-blur
                  ring-1 ring-white/10 p-8 text-left
                  shadow-[0_10px_40px_rgba(0,0,0,0.35)]
                  transition-transform duration-200 hover:-translate-y-1
                  hover:shadow-[0_20px_60px_rgba(168,85,247,0.15)]
                  ${plan.highlight ? 'ring-purple-300/30' : ''}
                `}
              >
                {/* светящаяся тонкая полоса сверху */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-purple-400/0 via-purple-400/60 to-purple-400/0 rounded-t-3xl" />

                {/* бейдж на популярном плане */}
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500/15 text-purple-200 px-3 py-1 text-xs tracking-wide ring-1 ring-purple-300/20">
                    Most popular
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white tracking-tight">{plan.name}</h3>

                <div className="mt-1 text-3xl font-extrabold text-white">
                  {plan.price}{' '}
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
                        <path
                          d="M5 12l4 4 10-10"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-purple-300"
                        />
                      </svg>
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={
                    isFree ? (isLoggedIn ? undefined : plan.action) : () => handleCheckout(plan.id)
                  }
                  className="
                    mt-8 w-full rounded-full px-6 py-4
                    bg-purple-500/20 text-white
                    ring-1 ring-purple-300/30
                    backdrop-blur
                    transition-colors duration-200
                    hover:bg-purple-500/30 hover:ring-purple-300/50
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60
                    disabled:opacity-60
                  "
                  disabled={(isFree && isLoggedIn) || isLoading}
                >
                  {isLoading ? 'Redirecting...' : isFree ? 'Try Demo' : 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-xs sm:text-sm text-[#E5E5E5] mt-6 sm:mt-8 max-w-3xl mx-auto leading-relaxed px-2">
          For individual professional advice, training, or API integration, please contact us
          through email.
        </p>
      </div>
    </section>
  );
}
