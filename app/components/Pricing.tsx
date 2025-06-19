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
      description: 'Explore the platform with 10 AI queries per month.',
      features: ['10 AI queries/month', 'Basic profile analysis', 'Community support'],
      action: onDemoClick,
    },
    {
      name: 'Smarter',
      price: '€249/month',
      description: 'Enhanced AI features and deeper profiling for individuals & teams.',
      features: ['1,000 AI queries/month', 'Advanced profiling tools', 'Team dashboard', 'Email support'],
      highlight: true,
      action: () => handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm'),
    },
    {
      name: 'Business',
      price: '€899/month',
      description: 'Full-featured access for organisations.',
      features: ['10,000 AI queries/month', 'All features from Smarter', 'Priority support', 'Custom options'],
      action: () => handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV'),
    },
  ];

  return (
    <section className="py-24 bg-[#1A1E23]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl text-[#F5F5F5] mb-4">Pricing Plans</h2>
        <p className="text-[#E5E5E5] mb-16">Start small, scale as you grow.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-xl bg-[#F6F5ED] border shadow transition-all ${
                plan.highlight ? 'border-[#C084FC]' : 'border-[#D1D4D6]'
              }`}
            >
              <h3 className="text-2xl text-[#111827] mb-2">{plan.name}</h3>
              <p className="text-3xl text-[#111827] mb-4">{plan.price}</p>
              <p className="text-[#374151] mb-6">{plan.description}</p>
              <ul className="text-left text-sm text-[#374151] mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="before:content-['✔'] before:mr-2 before:text-[#C084FC]">
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={plan.name === 'Freemium' && isLoggedIn ? undefined : plan.action}
                className="w-full py-2 px-4 rounded-2xl bg-[#C084FC] text-[#212529] hover:bg-[#D8B4FE] disabled:opacity-50"
                disabled={plan.name === 'Freemium' && isLoggedIn}
              >
                {loadingPlan === plan.name ? 'Redirecting...' : plan.name === 'Freemium' ? 'Try Demo' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
