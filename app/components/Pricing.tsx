'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

export default function Pricing({ onDemoClick }: { onDemoClick: () => void }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkSession();
  }, []);

  const handleCheckout = async (priceId: string) => {
    try {
      setLoadingPlan(priceId);

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
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Freemium',
      price: '€0',
      description: 'Human Risk Analytics with AI Discernment',
      features: [
        '10 AI queries',
        'Basic profile insights',
        'Templates for structured analysis',
        'Standard support',
      ],
      action: onDemoClick,
      highlight: false,
    },
    {
      name: 'Smarter',
      price: '€249',
      description: 'Advanced profiling tools for individuals and teams.',
      features: [
        'Everything in Freemium',
        '250 AI queries',
        'Enhanced AI toolset',
        'Professional Profiling Library',
      ],
      action: () => handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm'),
      highlight: true,
    },
    {
      name: 'Business',
      price: '€899',
      description: 'Enterprise-level access and personalised onboarding.',
      features: [
        'Everything in Smarter',
        '1,000 AI queries',
        'Premium support',
        'Advisory session or training on request',
      ],
      action: () => handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV'),
      highlight: false,
    },
  ];

  return (
    <section className="pt-4 md:pt-6 pb-16 md:pb-24 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl text-[#F5F5F5] mb-10">
          Pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 md:p-7 rounded-xl bg-[#F6F5ED] border shadow transition-all 
                ${
                  plan.highlight
                    ? 'border-[#C084FC] shadow-[0_6px_12px_rgba(192,132,252,0.5)]'
                    : 'border-[#D1D4D6]'
                }`}
            >
              <h3 className="text-xl md:text-2xl text-[#111827] mb-2">
                {plan.name}
              </h3>
              <p className="text-2xl md:text-3xl text-[#111827] mb-4">
                {plan.price}
                {plan.name !== 'Freemium' && (
                  <span className="text-xs align-middle"> /4 weeks</span>
                )}
              </p>
              <p className="text-[#374151] mb-5 text-sm md:text-base">
                {plan.description}
              </p>
              <ul className="text-left text-xs md:text-sm text-[#374151] mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="before:content-['✔'] before:mr-2 before:text-[#C084FC]"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={plan.name === 'Freemium' && isLoggedIn ? undefined : plan.action}
                className="w-full py-2 md:py-2.5 px-4 rounded-2xl bg-[#C084FC] text-[#212529] hover:bg-[#D8B4FE] disabled:opacity-50 text-sm md:text-base"
                disabled={plan.name === 'Freemium' && isLoggedIn}
              >
                {loadingPlan === plan.name
                  ? 'Redirecting...'
                  : plan.name === 'Freemium'
                  ? 'Try Demo'
                  : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs md:text-sm text-[#E5E5E5] mt-8 max-w-3xl mx-auto leading-relaxed">
          For individual professional advice, training, or API integration, please contact us through email.
        </p>
      </div>
    </section>
  );
}
