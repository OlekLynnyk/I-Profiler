'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

type Plan = {
  id: string; // стабильный идентификатор (для loading/checkout)
  name: string;
  price: string;
  description: string;
  features: string[];
  action?: () => void; // для фри-плана
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
      description: 'Advanced profiling tools for individuals and teams.',
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
      description: 'Enterprise-level access and personalised onboarding.',
      features: [
        'Everything in Smarter',
        '1,000 AI queries',
        'Premium support',
        'Advisory session or training on request',
      ],
      highlight: false,
    },
  ];

  return (
    <section className="pt-6 md:pt-8 pb-16 md:pb-24 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#F5F5F5] mb-6 sm:mb-8">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
