import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PACKAGE_LIMITS, isValidPackageType } from '@/types/plan';
import dayjs from 'dayjs';

export async function GET() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('user_subscription')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const plan = (subscription?.plan && isValidPackageType(subscription.plan)) ? subscription.plan : 'Freemium';
  const planLimits = PACKAGE_LIMITS[plan];

  const startOfDay = dayjs().startOf('day').toISOString();
  const { count: requestsToday } = await supabase
    .from('request_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfDay);

  // 🔽 Добавляем получение месячных лимитов
  const { data: limits, error: limitsError } = await supabase
    .from('user_limits')
    .select('monthly_limit, used_monthly')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    plan,
    usedToday: requestsToday ?? 0,
    limit: planLimits.dailyGenerations,

    // ✅ Добавлено:
    monthlyLimit: limits?.monthly_limit ?? planLimits.requestsPerMonth,
    usedMonthly: limits?.used_monthly ?? 0,
  });
}
