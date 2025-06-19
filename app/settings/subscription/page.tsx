'use client';

import { useEffect, useState } from 'react';

export default function SubscriptionSettings() {
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [trialEndDate, setTrialEndDate] = useState('');

  useEffect(() => {
    // Здесь будут реальные запросы к API
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Subscription Settings</h1>

      <div className="space-y-6">
        <div>
          <h2 className="font-medium text-lg">My Plan</h2>
          <p>{plan}</p>
        </div>

        <div>
          <h2 className="font-medium text-lg">Subscription Status</h2>
          <p>{status}</p>
        </div>

        <div>
          <h2 className="font-medium text-lg">Next Billing Date</h2>
          <p>{nextBillingDate}</p>
        </div>

        <div>
          <h2 className="font-medium text-lg">Payment Method</h2>
          <p>{paymentMethod}</p>
          <button className="mt-2 text-sm text-purple-600 underline">Update via Stripe</button>
        </div>

        <div>
          <h2 className="font-medium text-lg">Trial Info</h2>
          <p>{trialEndDate || 'Not on trial'}</p>
        </div>

        <div>
          <h2 className="font-medium text-lg">Auto-Renewal</h2>
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox" checked readOnly />
            <span className="ml-2">Enabled</span>
          </label>
        </div>

        <div>
          <h2 className="font-medium text-lg">Billing History</h2>
          <ul className="space-y-2">
            {billingHistory.map(entry => (
              <li key={entry.id} className="flex justify-between">
                <span>{entry.date}</span>
                <span>{entry.amount}</span>
                <a href={entry.invoiceUrl} className="text-sm text-purple-600 underline">
                  Download PDF
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Unsubscribe</button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
