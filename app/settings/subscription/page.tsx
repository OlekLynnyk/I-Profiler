'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useStripeCheckout } from '@/app/hooks/useStripeCheckout';
import { useUserSubscription } from '@/app/hooks/useUserSubscription';
import { motion, useReducedMotion } from 'framer-motion';
import GlobalLoading from '@/app/loading';
import {
  PACKAGE_TO_PRICE,
  isPaidPlan,
  isValidPackageType,
  type ValidPackageType,
} from '@/types/plan';

const ACCENT = '#A855F7';

export default function SubscriptionSettings() {
  const { handleCheckout, loading: upgradeLoading, error: upgradeError } = useStripeCheckout();
  const { data, isLoading, error } = useUserSubscription();

  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const supabase = createPagesBrowserClient();
  const reduce = useReducedMotion();

  useEffect(() => {
    const fetchBillingHistory = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const res = await fetch('/api/stripe/invoices', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const { invoices } = await res.json();
        setBillingHistory(invoices ?? []);
      }
    };

    fetchBillingHistory();
  }, [supabase]);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setPortalError('Authorization failed: no token.');
        return;
      }

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Portal fetch failed:', errorText);
        setPortalError('Failed to open billing portal.');
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
      else setPortalError('Unexpected error. No portal URL.');
    } catch (e) {
      console.error('❌ Portal error:', e);
      setPortalError('Something went wrong.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setPortalLoading(true);
    setPortalError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setPortalError('Authorization failed: no token.');
        return;
      }

      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      alert('Subscription cancellation scheduled. It will end after the current period.');
      window.location.reload();
    } catch (err) {
      console.error('❌ Cancel subscription error:', err);
      setPortalError('Failed to cancel subscription.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) return <GlobalLoading />;
  if (error || !data)
    return <div className="p-8 text-red-300">Error: {String(error || 'unknown')}</div>;

  const {
    plan,
    status,
    next_billing_date: nextBillingDate,
    trial_end_date: trialEndDate,
    cancel_at_period_end: cancelAtPeriodEnd,
    payment_method: paymentMethod,
  } = data;

  // Нормализация текущего плана
  const currentPlan: ValidPackageType = isValidPackageType(plan)
    ? (plan as ValidPackageType)
    : 'Freemium';

  const statusBadge = cancelAtPeriodEnd
    ? {
        text: `Ends on ${nextBillingDate ?? ''}`.trim(),
        cls: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
      }
    : {
        text: isPaidPlan(currentPlan) ? 'Active & renewing' : 'Inactive',
        cls: isPaidPlan(currentPlan)
          ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20'
          : 'bg-white/10 text-white/70 ring-white/15',
      };

  // История: сортировка и 3 последних
  const sortedInvoices = [...billingHistory].sort((a, b) => {
    const da = new Date(a.date as string).getTime();
    const db = new Date(b.date as string).getTime();
    return db - da;
  });
  const visibleInvoices = showAllInvoices ? sortedInvoices : sortedInvoices.slice(0, 3);
  const hasMoreInvoices = sortedInvoices.length > 3;

  return (
    <div className="min-h-screen w-full bg-[#1A1E23] text-white">
      {/* уменьшил верхний отступ страницы */}
      <div className="mx-auto max-w-3xl px-4 pt-2 md:pt-4 pb-10 md:pb-12">
        {/* glow оставлен, но компактнее */}
        <div
          aria-hidden
          className="pointer-events-none -mb-1 mx-auto h-[64px] w-[min(680px,90%)] rounded-[999px] bg-white/5 blur-2xl"
        />

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, transition: { duration: 0.5 } }}
          className="relative rounded-3xl bg-white/5 backdrop-blur ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)] p-5 md:p-8"
        >
          {/* hairline сверху */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <header className="mb-6 md:mb-8">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight">
              Subscription Settings
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/15">
                Plan: <span className="font-semibold text-white">{plan}</span>
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs ring-1 ${statusBadge.cls}`}
                title={status}
              >
                {statusBadge.text}
              </span>
            </div>
          </header>

          {/* детали подписки — убрал дублирующий статус и Auto-Renewal */}
          <div className="grid gap-3 text-sm">
            {isPaidPlan(currentPlan) && nextBillingDate && (
              <p className="text-white/80">
                <span className="font-medium text-white/90">Next Billing Date:</span>{' '}
                {nextBillingDate}
              </p>
            )}

            {trialEndDate && (
              <p className="text-white/80">
                <span className="font-medium text-white/90">Trial Info:</span> Trial until{' '}
                {trialEndDate}
              </p>
            )}

            {/* оплата (только для платных планов) */}
            {isPaidPlan(currentPlan) && (
              <div className="mt-2 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <p className="text-white/80">
                  <span className="font-medium text-white/90">Payment Method:</span> {paymentMethod}
                </p>
                <button
                  type="button"
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="mt-3 w-fit rounded-full px-5 py-2 text-[#111827] transition-[transform,box-shadow,background] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/60 disabled:opacity-60"
                  style={{
                    backgroundImage: `
                      radial-gradient(120% 120% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(168,85,247,0) 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))
                    `,
                    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.6), 0 8px 28px rgba(0,0,0,0.10)',
                    border: '1px solid rgba(168,85,247,0.35)',
                  }}
                >
                  {portalLoading ? 'Opening…' : 'Update via Stripe'}
                </button>
                {portalError && <p className="mt-2 text-xs text-red-300">{portalError}</p>}
              </div>
            )}
          </div>

          {/* история платежей */}
          <div className="mt-8">
            <h2 className="text-base font-semibold tracking-tight mb-3">Billing History</h2>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              {sortedInvoices.length === 0 ? (
                <div className="p-4 text-sm text-white/60 bg-white/5">No invoices yet.</div>
              ) : (
                <>
                  <ul className="divide-y divide-white/10 bg-white/5">
                    {visibleInvoices.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between gap-3 p-3 text-sm text-white/80 hover:bg-white/7"
                      >
                        <div className="font-medium text-white/90">{entry.date}</div>
                        <div className="whitespace-nowrap">
                          {entry.amount} {entry.currency}
                        </div>
                        <a
                          href={entry.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full px-3 py-1 text-xs text-white ring-1 ring-white/15 hover:ring-[#A855F7]/40 hover:bg-[#A855F7]/10 transition-colors"
                        >
                          Download PDF
                        </a>
                      </li>
                    ))}
                  </ul>

                  {hasMoreInvoices && (
                    <div className="bg-white/5 flex justify-center p-3">
                      <button
                        type="button"
                        onClick={() => setShowAllInvoices((v) => !v)}
                        className="rounded-full px-3 py-1 text-xs text-white ring-1 ring-white/15 hover:ring-[#A855F7]/40 hover:bg-[#A855F7]/10 transition-colors"
                      >
                        {showAllInvoices ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* действия — удалил все апгрейды, оставил только отписку справа */}
          <div className="mt-8 flex justify-end">
            {isPaidPlan(currentPlan) && !cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={portalLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 h-10 text-sm text-red-200 ring-1 ring-red-400/20 bg-red-500/10 hover:bg-red-500/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:opacity-60"
              >
                {portalLoading ? 'Processing…' : 'Unsubscribe'}
              </button>
            )}
          </div>

          {(upgradeError || portalError) && (
            <p className="mt-4 text-xs text-red-300">{upgradeError || portalError}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
