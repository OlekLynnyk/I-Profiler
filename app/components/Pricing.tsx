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

  // ----- MOBILE STATE (не влияет на десктоп) -----
  const [activeId, setActiveId] = useState<string>(plans[1].id); // по умолчанию Smarter
  const activePlan = useMemo(() => plans.find((p) => p.id === activeId)!, [plans, activeId]);
  const smallPlans = useMemo(() => plans.filter((p) => p.id !== activeId), [plans, activeId]);

  // Универсальная карточка
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
      // КВАДРАТ: показываем только name, price, короткое описание
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
            {/* чек‑лист и кнопка скрыты на small */}
          </div>
        </button>
      );
    }

    // LARGE: полный контент
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#F5F5F5] mb-6 sm:mb-8">Pricing</h2>

        {/* ===== MOBILE (< md): 2 квадрата сверху + развернутый снизу ===== */}
        <div className="md:hidden space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {smallPlans.map((p) => (
              <PlanCard key={p.id} plan={p} size="small" onClick={() => setActiveId(p.id)} />
            ))}
          </div>

          {/* Развёрнутый блок — с плавной анимацией появления/смены */}
          <div
            key={activePlan.id}
            className="transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95"
          >
            <PlanCard plan={activePlan} size="large" />
          </div>

          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>

        {/* ===== DESKTOP (>= md): исходный макет без изменений) ===== */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => {
            const isFree = plan.id === 'free';
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-5 sm:p-6 md:p-7 rounded-xl bg-[#F6F5ED] border shadow
                  ${
                    plan.highlight
                      ? 'border-[#C084FC] shadow-[0_4px_10px_rgba(192,132,252,0.35)]'
                      : 'border-[#D1D4D6]'
                  }`}
              >
                <h3 className="text-lg sm:text-xl md:text-2xl text-[#111827] mb-1">{plan.name}</h3>
                <p className="text-2xl sm:text-3xl text-[#111827] mb-3 sm:mb-4">
                  {plan.price}
                  {!isFree && (
                    <span className="text-[10px] sm:text-xs align-middle"> /4 weeks</span>
                  )}
                </p>
                <p className="text-[#374151] mb-4 sm:mb-5 text-sm md:text-base leading-relaxed">
                  {plan.description}
                </p>
                <ul className="text-left text-sm text-[#374151] mb-5 sm:mb-6 space-y-2 leading-relaxed">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span aria-hidden className="mt-0.5 text-[#C084FC]">
                        ✔
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={
                    isFree ? (isLoggedIn ? undefined : plan.action) : () => handleCheckout(plan.id)
                  }
                  className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-[#C084FC] text-[#212529]
                             hover:bg-[#D8B4FE] disabled:opacity-50 text-sm md:text-base min-h-11"
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
