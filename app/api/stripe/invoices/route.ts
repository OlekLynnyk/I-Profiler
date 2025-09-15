import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, formatAmount, DEFAULT_CURRENCY } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
  }

  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Проверяем токен анонимным клиентом (без cookies)
  const authCli = createClient(URL, ANON, { auth: { persistSession: false } });
  const {
    data: { user },
    error: authError,
  } = await authCli.auth.getUser(token);

  if (authError || !user) {
    console.error('❌ Supabase auth error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Читаем БД админ-клиентом (service-role), без cookies
  const admin = createClient(URL, SRV, { auth: { persistSession: false } });

  const { data: subRecord, error: subError } = await admin
    .from('user_subscription')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (subError) {
    console.warn('⚠️ invoices: user_subscription read failed', subError);
    return NextResponse.json({ invoices: [] }, { status: 200 });
  }
  if (!subRecord?.stripe_customer_id) {
    // у Freemium клиентов это нормально — просто нет инвойсов
    return NextResponse.json({ invoices: [] }, { status: 200 });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: subRecord.stripe_customer_id,
      limit: 10,
    });

    const result = invoices.data.map((invoice) => {
      const currency = (invoice.currency || DEFAULT_CURRENCY).toLowerCase();
      return {
        id: invoice.id,
        amount: formatAmount(invoice.amount_paid, currency),
        currency: currency.toUpperCase(),
        date: new Date(invoice.created * 1000).toISOString().split('T')[0],
        invoiceUrl: invoice.invoice_pdf,
      };
    });

    return NextResponse.json({ invoices: result });
  } catch (error: any) {
    if (error?.code === 'resource_missing') {
      // нет инвойсов/клиента в Stripe — отдаём пусто, а не 500
      return NextResponse.json({ invoices: [] }, { status: 200 });
    }
    console.error('❌ Stripe invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
