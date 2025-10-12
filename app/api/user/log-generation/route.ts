// app/api/user/log-generation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/env.server';
import { tryLogUserAction } from '@/lib/logger';
import { PACKAGE_LIMITS, isValidPackageType, type ValidPackageType } from '@/types/plan';
import { updateUserLimits } from '@/lib/updateUserLimits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Безопасный парсинг JSON: если тела нет или контент-тайп другой — вернём null и не падём.
async function safeJson(req: NextRequest): Promise<any | null> {
  const ct = req.headers.get('content-type') || '';
  if (!ct.toLowerCase().includes('application/json')) return null;
  try {
    const parsed = await req.json();
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // ⬇️ БЕЗОПАСНО: не бросаем 400, если тело пустое/невалидное — просто считаем его отсутствующим.
  const body = await safeJson(req);
  const action = body?.action as string | undefined;
  const correlationId = body?.correlation_id as string | undefined;

  // Прерываем — не увеличиваем лимит, если это не генерация
  if (action && action !== 'profile_generation_incremented') {
    void tryLogUserAction({ userId, action, metadata: body?.metadata ?? null });
    return NextResponse.json({ success: true, skippedIncrement: true });
  }

  // Idempotency: если уже логировали эту попытку — не инкрементим повторно
  if (correlationId) {
    const { data: dup } = await supabase
      .from('user_log')
      .select('id')
      .eq('user_id', userId)
      .eq('action', 'profile_generation_incremented')
      .contains('metadata', { correlation_id: correlationId })
      .limit(1)
      .maybeSingle();
    if (dup) {
      return NextResponse.json({ success: true, deduped: true });
    }
  }

  const { data: limits, error: limitsError } = await supabase
    .from('user_limits')
    .select(
      'used_today, daily_limit, limit_reset_at, used_monthly, monthly_limit, monthly_reset_at, plan'
    )
    .eq('user_id', userId)
    .maybeSingle();

  const now = new Date();

  if (!limits || limitsError) {
    // Инициализируем лимиты из фактического плана пользователя (или Freemium) без хардкодов
    const { data: sub } = await supabase
      .from('user_subscription')
      .select('package_type')
      .eq('user_id', userId)
      .maybeSingle();

    const resolvedPlan: ValidPackageType = isValidPackageType(sub?.package_type ?? '')
      ? (sub!.package_type as ValidPackageType)
      : 'Freemium';

    await updateUserLimits(supabase as any, resolvedPlan, userId);

    // Поддерживаем прежнюю семантику monthly_reset_at (now + 28 дней) и считаем этот вызов попыткой (used=1)
    const nextMonthlyReset = new Date();
    nextMonthlyReset.setUTCDate(now.getUTCDate() + 28);

    const initBump = await supabase
      .from('user_limits')
      .update({
        used_today: 1,
        used_monthly: 1,
        monthly_reset_at: nextMonthlyReset.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId);

    if (initBump.error) {
      return NextResponse.json({ error: 'Failed to initialize limits' }, { status: 500 });
    }

    return NextResponse.json({ success: true, initialized: true });
  }

  const shouldResetDaily = now > new Date(limits.limit_reset_at || now);
  const shouldResetMonthly = now > new Date(limits.monthly_reset_at || now);

  const usedToday = shouldResetDaily ? 0 : limits.used_today || 0;
  const usedMonthly = shouldResetMonthly ? 0 : limits.used_monthly || 0;

  // Читаем фактические лимиты: сперва из БД, при null — из PACKAGE_LIMITS по плану
  const planForLimits: ValidPackageType = isValidPackageType(limits.plan ?? '')
    ? (limits.plan as ValidPackageType)
    : 'Freemium';
  const cfg = PACKAGE_LIMITS[planForLimits];
  const dailyLimit = limits.daily_limit ?? cfg.dailyGenerations;
  const monthlyLimit = limits.monthly_limit ?? cfg.requestsPerMonth;

  if (dailyLimit != null && usedToday >= dailyLimit) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 403 });
  }

  if (monthlyLimit != null && usedMonthly >= monthlyLimit) {
    return NextResponse.json({ error: 'Monthly limit reached' }, { status: 403 });
  }

  const nextDailyReset = new Date();
  nextDailyReset.setUTCHours(0, 0, 0, 0);
  nextDailyReset.setUTCDate(now.getUTCDate() + 1);

  const nextMonthlyReset = new Date();
  nextMonthlyReset.setUTCDate(now.getUTCDate() + 28);

  const { error: updateError } = await supabase
    .from('user_limits')
    .update({
      used_today: usedToday + 1,
      used_monthly: usedMonthly + 1,
      limit_reset_at: shouldResetDaily ? nextDailyReset.toISOString() : limits.limit_reset_at,
      monthly_reset_at: shouldResetMonthly
        ? nextMonthlyReset.toISOString()
        : limits.monthly_reset_at,
      updated_at: now.toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update limits' }, { status: 500 });
  }

  void tryLogUserAction({
    userId,
    action: 'profile_generation_incremented',
    metadata: {
      endpoint: '/app/api/user/log-generation',
      timestamp: new Date().toISOString(),
      correlation_id: correlationId ?? null,
    },
  });

  return NextResponse.json({ success: true });
}
