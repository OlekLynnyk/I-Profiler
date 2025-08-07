import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
  }

  const supabase = await createServerClientForApi();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('❌ Supabase auth error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subRecord, error: subError } = await supabase
    .from('user_subscription')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (subError || !subRecord?.stripe_customer_id) {
    return NextResponse.json({ error: 'Database error or customer not found' }, { status: 500 });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: subRecord.stripe_customer_id,
      limit: 10,
    });

    const result = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: (invoice.amount_paid / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      date: new Date(invoice.created * 1000).toISOString().split('T')[0],
      invoiceUrl: invoice.invoice_pdf,
    }));

    return NextResponse.json({ invoices: result });
  } catch (error) {
    console.error('❌ Stripe invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
