'use client';

import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useStripeCheckout } from '@/app/hooks/useStripeCheckout';

export default function SubscriptionSettings() {
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [trialEndDate, setTrialEndDate] = useState('');

  const supabase = createPagesBrowserClient();
  const { handleCheckout, loading: upgradeLoading, error: upgradeError } =
    useStripeCheckout();

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    setPlan('Business');
    setStatus('active');
    setNextBillingDate('2025-07-18');
    setPaymentMethod('Visa •••• 4242');
    setTrialEndDate('');
    setBillingHistory([
      { id: '1', date: '2025-06-18', amount: '€899', invoiceUrl: '#' },
      { id: '2', date: '2025-05-18', amount: '€899', invoiceUrl: '#' },
    ]);
  }, []);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Portal fetch failed:', errorText);
        setPortalError('Failed to open billing portal.');
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('❌ No URL returned from billing portal API');
        setPortalError('Unexpected error. No portal URL.');
      }
    } catch (e) {
      console.error('❌ Portal error:', e);
      setPortalError('Something went wrong.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center items-start p-4"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-8 w-full">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
            Subscription Settings
          </h1>

          <div className="space-y-3 text-sm text-gray-800">
            <p>
              <span className="font-medium text-gray-900">My Plan:</span>{' '}
              {plan}
            </p>
            <p>
              <span className="font-medium text-gray-900">
                Subscription Status:
              </span>{' '}
              {status}
            </p>
            <p>
              <span className="font-medium text-gray-900">
                Next Billing Date:
              </span>{' '}
              {nextBillingDate}
            </p>
            <p>
              <span className="font-medium text-gray-900">Trial Info:</span>{' '}
              {trialEndDate || 'Not on trial'}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                Auto-Renewal:
              </span>
              <input
                type="checkbox"
                checked
                readOnly
                className="accent-[#A78BFA] h-4 w-4"
              />
            </p>

            {/* Payment block with border */}
            <div className="border border-gray-200 rounded-md p-3 mt-4">
              <p>
                <span className="font-medium text-gray-900">
                  Payment Method:
                </span>{' '}
                {paymentMethod}
              </p>
              <button
                type="button"
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="mt-2 text-sm text-[#A78BFA] hover:text-[#8B5CF6] font-medium transition-colors"
              >
                {portalLoading ? 'Opening...' : 'Update via Stripe'}
              </button>
              {portalError && (
                <p className="text-red-600 text-xs mt-2">{portalError}</p>
              )}
            </div>
          </div>

          {/* Billing History */}
          <div className="mt-8">
            <h2 className="text-base font-medium text-gray-900 mb-3">
              Billing History
            </h2>
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {billingHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-3 text-sm text-gray-700"
                >
                  <div className="font-medium text-gray-900">
                    {entry.date}
                  </div>
                  <div>{entry.amount}</div>
                  <a
                    href={entry.invoiceUrl}
                    className="text-[#A78BFA] hover:text-[#8B5CF6] font-medium transition-colors"
                  >
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons vertical left */}
          <div className="mt-8 flex flex-col items-start space-y-2">
            <button
              type="button"
              onClick={() =>
                handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm')
              }
              disabled={upgradeLoading}
              className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-xl w-full md:w-auto transition-colors"
            >
              {upgradeLoading ? 'Redirecting...' : 'Upgrade to Smarter'}
            </button>

            <button
              type="button"
              onClick={() =>
                handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV')
              }
              disabled={upgradeLoading}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-xl w-full md:w-auto transition-colors"
            >
              {upgradeLoading ? 'Redirecting...' : 'Upgrade to Business'}
            </button>

            <button
              type="button"
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-xl w-full md:w-auto transition-colors"
            >
              {portalLoading ? 'Opening...' : 'Unsubscribe'}
            </button>
          </div>

          {(upgradeError || portalError) && (
            <p className="text-red-600 text-xs mt-4">
              {upgradeError || portalError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
