'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useStripeCheckout } from '@/app/hooks/useStripeCheckout';
import { useUserSubscription } from '@/app/hooks/useUserSubscription';

export default function SubscriptionSettings() {
  const { handleCheckout, loading: upgradeLoading, error: upgradeError } = useStripeCheckout();
  const { data, isLoading, error } = useUserSubscription();

  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const supabase = createPagesBrowserClient();

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
        setBillingHistory(invoices);
      }
    };

    fetchBillingHistory();
  }, []);

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
      if (url) {
        window.location.href = url;
      } else {
        setPortalError('Unexpected error. No portal URL.');
      }
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
    } catch (error) {
      console.error('❌ Cancel subscription error:', error);
      setPortalError('Failed to cancel subscription.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading subscription...</div>;
  if (error || !data) return <div className="p-4 text-red-600">Error: {error}</div>;

  const {
    plan,
    status,
    nextBillingDate,
    trialEndDate,
    cancelAtPeriodEnd,
    paymentMethod,
    packageType,
  } = data;

  return (
    <div className="min-h-screen w-full flex justify-center items-start p-4 bg-white">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-8 w-full">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Subscription Settings</h1>

          <div className="space-y-3 text-sm text-gray-800">
            <p><span className="font-medium text-gray-900">My Plan:</span> {plan}</p>
            <p><span className="font-medium text-gray-900">Package Type:</span> {packageType}</p>
            <p><span className="font-medium text-gray-900">Subscription Status:</span> {status}</p>
            <p><span className="font-medium text-gray-900">Next Billing Date:</span> {nextBillingDate}</p>
            <p><span className="font-medium text-gray-900">Trial Info:</span> {trialEndDate || 'Not on trial'}</p>

            <p className={`text-sm font-medium ${cancelAtPeriodEnd ? 'text-red-600' : 'text-green-600'}`}>
              {cancelAtPeriodEnd
                ? `Subscription will end on ${nextBillingDate}`
                : 'Subscription active and renewing'}
            </p>

            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Auto-Renewal:</span>
              <input type="checkbox" checked readOnly className="accent-[#A78BFA] h-4 w-4" />
            </p>

            <div className="border border-gray-200 rounded-md p-3 mt-4">
              <p><span className="font-medium text-gray-900">Payment Method:</span> {paymentMethod}</p>
              <button
                type="button"
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="mt-2 text-sm text-[#A78BFA] hover:text-[#8B5CF6] font-medium transition-colors"
              >
                {portalLoading ? 'Opening...' : 'Update via Stripe'}
              </button>
              {portalError && <p className="text-red-600 text-xs mt-2">{portalError}</p>}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-base font-medium text-gray-900 mb-3">Billing History</h2>
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {billingHistory.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center p-3 text-sm text-gray-700">
                  <div className="font-medium text-gray-900">{entry.date}</div>
                  <div>{entry.amount} {entry.currency}</div>
                  <a
                    href={entry.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A78BFA] hover:text-[#8B5CF6] font-medium transition-colors"
                  >
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start space-y-2">
            <button
              type="button"
              onClick={() => handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm')}
              disabled={upgradeLoading}
              className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-xl w-full md:w-auto transition-colors"
            >
              {upgradeLoading ? 'Redirecting...' : 'Upgrade to Smarter'}
            </button>

            <button
              type="button"
              onClick={() => handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV')}
              disabled={upgradeLoading}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-xl w-full md:w-auto transition-colors"
            >
              {upgradeLoading ? 'Redirecting...' : 'Upgrade to Business'}
            </button>

            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={portalLoading}
              className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-xl w-full md:w-auto transition-colors"
            >
              {portalLoading ? 'Processing...' : 'Unsubscribe'}
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
