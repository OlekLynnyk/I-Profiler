// lib/stripe.ts
import 'server-only';

import Stripe from 'stripe';
import { env } from '@/env.server';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY /*, { apiVersion: '2024-06-20' } */);
export const DEFAULT_CURRENCY = 'eur';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

export function formatAmount(amountMinor: number, currency: string = 'eur') {
  const c = currency.toLowerCase();
  const divisor = ZERO_DECIMAL_CURRENCIES.has(c) ? 1 : 100;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: c.toUpperCase() }).format(
    amountMinor / divisor
  );
}
