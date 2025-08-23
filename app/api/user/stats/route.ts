import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PACKAGE_LIMITS, isValidPackageType } from '@/types/plan';
import dayjs from 'dayjs';
import { logUserAction } from '@/lib/logger';

export async function GET() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('user_subscription')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const plan =
    subscription?.plan && isValidPackageType(subscription.plan) ? subscription.plan : 'Freemium';
  const planLimits = PACKAGE_LIMITS[plan];

  const startOfDay = dayjs().startOf('day').toISOString();
  const { count: requestsToday } = await supabase
    .from('request_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfDay);

  const { data: limits, error: limitsError } = await supabase
    .from('user_limits')
    .select('monthly_limit, used_monthly')
    .eq('user_id', user.id)
    .maybeSingle();
  if (limitsError) {
    console.warn('⚠️ Failed to fetch user_limits:', limitsError);
  }

  const statsPayload = {
    plan,
    usedToday: requestsToday ?? 0,
    limit: planLimits.dailyGenerations,
    monthlyLimit: limits?.monthly_limit ?? planLimits.requestsPerMonth,
    usedMonthly: limits?.used_monthly ?? 0,
  };

  await logUserAction({
    userId: user.id,
    action: 'user_stats_fetched',
    metadata: {
      endpoint: '/app/api/user/stats',
      ...statsPayload,
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json(statsPayload);
}
