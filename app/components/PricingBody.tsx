'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const FONT = { family: 'Azeret Mono, monospace' } as const;

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M1 5L4.5 8.5L11 1"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ✅ обновлённый FeatureRow — решает ТЗ без изменения структуры
function FeatureRow({ children }: { children: React.ReactNode }) {
  // Преобразуем в строку для проверки наличия скобок
  const text = typeof children === 'string' ? children : '';

  // Если есть "(", разбиваем текст
  const hasParentheses = text.includes('(');
  let mainText = text;
  let subText = '';

  if (hasParentheses) {
    const [main, rest] = text.split('(');
    mainText = main.trim();
    subText = rest ? '(' + rest.trim() : '';
  }

  return (
    <div className="flex items-start gap-2 rounded-[8px] bg-white/[0.10] px-2 py-2">
      <span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden>
        <CheckIcon />
      </span>

      <span
        className="flex-1 text-white [font-variant-caps:small-caps]"
        style={{ fontFamily: FONT.family }}
      >
        {/* Основная строка */}
        <div className="text-[14px] leading-[145%]">{mainText}</div>
        {/* Подстрока в скобках, если есть */}
        {subText && (
          <div className="text-[12px] leading-[145%] text-white/70 mt-[2px]">{subText}</div>
        )}
      </span>
    </div>
  );
}

function Card({
  title,
  price,
  subtitle,
  preface,
  features,
  buttonLabel,
  onButtonClick,
}: {
  title: string;
  price: React.ReactNode;
  subtitle?: React.ReactNode;
  preface?: React.ReactNode;
  features: React.ReactNode[];
  buttonLabel: string;
  onButtonClick?: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 md:min-h-[637px] md:w-[360px] md:justify-between">
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-start gap-5">
        {/* Title & price */}
        <div className="flex w-full flex-col items-center gap-3">
          <div
            className="flex flex-col items-center"
            style={{ width: title === 'Premium' ? 250 : title === 'Signature Services' ? 188 : 84 }}
          >
            <div
              className="text-[16px] leading-[145%] text-white [font-variant-caps:small-caps]"
              style={{ fontFamily: FONT.family }}
            >
              {title}
            </div>
            <div
              className="text-[32px] leading-[145%] text-white [font-variant-caps:small-caps]"
              style={{ fontFamily: FONT.family }}
            >
              {price}
            </div>
          </div>
          {subtitle && (
            <div
              className="w/full text-center text-[16px] leading-[145%] text-white [font-variant-caps:small-caps]"
              style={{ fontFamily: FONT.family }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Preface (optional, e.g., for Premium) */}
        {preface && (
          <div className="flex w-full items-center justify-center py-2">
            <span
              className="text-center text-[14px] leading-[145%] text-white [font-variant-caps:small-caps]"
              style={{ fontFamily: FONT.family }}
            >
              {preface}
            </span>
          </div>
        )}

        {/* Features */}
        <div className="w-full">
          <div className="flex w-full flex-col gap-3">
            {features.map((f, i) => (
              <FeatureRow key={i}>{f}</FeatureRow>
            ))}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="mx-auto w-full max-w-[360px]">
        <button
          type="button"
          onClick={onButtonClick}
          className="flex h-[56px] w-full items-center justify-center rounded-[8px] bg-white px-[15px] py-[10px]"
        >
          <span
            className="text-center text-[20px] leading-[145%] text-black [font-variant-caps:small-caps]"
            style={{ fontFamily: FONT.family }}
          >
            {buttonLabel}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function PricingBody({ onLoginClick }: { onLoginClick: () => void }) {
  const router = useRouter();

  return (
    <section id="pricing" className="w-full bg-black" aria-label="Pricing plans">
      <div className="mx-auto max-w-[1440px] px-3 md:px-[100px]">
        <div className="relative pt-[48px] md:pt-[64px] pb-10 md:pb-16">
          <div
            className="mb-4 text-center text-[18px] leading-[145%] text-white [font-variant-caps:small-caps] md:hidden"
            style={{ fontFamily: FONT.family }}
          >
            Plans:
          </div>

          <div className="mx-auto flex w-full max-w/[351px] flex-col gap-10 md:max-w/[1240px] md:flex-row md:items-start md:justify-between md:gap-[40px]">
            {/* Card 1 */}
            <Card
              title="Freemium"
              price={<span>€0</span>}
              subtitle={<span>Intro to Your Human Insights</span>}
              features={[
                '5 Discernment Reports',
                'Private workspace',
                'Templates for structured work',
                'Standard support',
              ]}
              buttonLabel="Start Free"
              onButtonClick={() => {
                sessionStorage.setItem('loginRedirectTo', window.location.pathname);
                onLoginClick();
              }}
            />

            <div className="h-px w-full bg-white/20 opacity-20 md:h-[637px] md:w-px" aria-hidden />

            {/* Card 2 */}
            <Card
              title="Premium"
              price={<span>€399 / month</span>}
              subtitle={<span>Diplomacy-grade Signal Reader</span>}
              preface={<span>Everything in Freemium, plus:</span>}
              features={[
                'Unlimited Discernment Reports',
                'Enhanced work tools',
                'Secret Stype Library',
                'Onboarding on request',
              ]}
              buttonLabel="Upgrade to Premium"
              onButtonClick={async () => {
                try {
                  // Проверяем, залогинен ли пользователь
                  const supabase = createClientComponentClient();
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  if (!session || !session.user) {
                    sessionStorage.setItem('loginRedirectTo', window.location.pathname);
                    onLoginClick();
                    return;
                  }
                  // Пользователь есть → создаём Checkout
                  const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      priceId: 'price_1SOHlgAGnqjZyhfA7Z9fMlSl',
                    }),
                  });

                  if (!res.ok) throw new Error('Stripe checkout failed');
                  const { url } = await res.json();
                  if (url) window.location.href = url;
                  else throw new Error('Missing Stripe redirect URL');
                } catch (err) {
                  console.error('❌ Stripe checkout error:', err);
                  alert('Payment redirect failed. Please try again later.');
                }
              }}
            />

            <div className="h-px w-full bg-white/20 opacity-20 md:h-[637px] md:w-px" aria-hidden />

            {/* Card 3 */}
            <Card
              title="Signature Services"
              price={<span>Custom</span>}
              subtitle={<span>For leadership teams and enterprises</span>}
              features={[
                'Read & Close Workshop (live body language and appearance reads without disclosing confidential details.)',
                'Culture Snapshot Review (for change-makers who need the real mood.)',
                'Psychographics for Marketing (anonymised group wisdom without personal data; real crowds, no files required.)',
                'Shadow Fit Consultancy (anonymous human audit.)',
              ]}
              buttonLabel="Book a Call"
              onButtonClick={() =>
                window.open('https://calendly.com/founder-h1nted/30min', '_blank')
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
