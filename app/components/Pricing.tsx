'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Pricing({ onDemoClick }: { onDemoClick: () => void }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    setLoadingPlan(plan);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ plan }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { url } = await res.json();
    window.location.href = url;
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
      price: '€19.99/month',
      description: 'Enhanced AI features and deeper profiling for individuals & teams.',
      features: ['1,000 AI queries/month', 'Advanced profiling tools', 'Team dashboard', 'Email support'],
      highlight: true,
      action: () => handleCheckout('smarter'),
    },
    {
      name: 'Business',
      price: '€249.99/month',
      description: 'Full-featured access for organisations.',
      features: ['10,000 AI queries/month', 'All features from Smarter', 'Priority support', 'Custom options'],
      action: () => handleCheckout('business'),
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
                onClick={plan.action}
                className="w-full py-2 px-4 rounded-2xl bg-[#C084FC] text-[#212529] hover:bg-[#D8B4FE]"
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
