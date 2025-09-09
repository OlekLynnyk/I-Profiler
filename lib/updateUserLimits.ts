// lib/updateUserLimits.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { PACKAGE_LIMITS, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export type LimitsResetMode = 'none' | 'daily' | 'monthly' | 'all';

type UpdateUserLimitsOptions = {
  /** Политика сброса счётчиков; по умолчанию не сбрасываем. */
  reset?: LimitsResetMode;
  /** Необязательная причина для логов/аудита. */
  reason?: string;
};

/** Тип строки user_limits из сгенерённых Supabase-типов (с фоллбеком). */
type UserLimitsRow = Database extends { public: any }
  ? Database['public']['Tables']['user_limits']['Row']
  : {
      user_id: string;
      plan: string | ValidPackageType;
      daily_limit: number | null;
      monthly_limit: number | null;
      used_today: number | null;
      used_monthly: number | null;
      limit_reset_at: string | null;
      monthly_reset_at: string | null;
      active: boolean | null;
      created_at: string | null;
      updated_at: string | null;
    };

/**
 * Обновляет лимиты пользователя под новый план.
 * Совместимо с текущей архитектурой:
 *  - по умолчанию НЕ сбрасывает счётчики (reset='none');
 *  - insert/update без перетирания created_at;
 *  - сохраняет used_* если reset не запрошен.
 */
export async function updateUserLimits(
  supabase: SupabaseClient<Database>,
  plan: ValidPackageType,
  userId?: string,
  opts?: UpdateUserLimitsOptions
) {
  const resetMode: LimitsResetMode = opts?.reset ?? 'none';

  // 1) userId из контекста, если не передан
  if (!userId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Failed to get user:', authError?.message);
      return;
    }
    userId = user.id;
  }

  const planLimits = PACKAGE_LIMITS[plan];
  const now = new Date().toISOString();

  // 2) Берём текущую запись СТРОГО типизированно
  const { data: existing, error: readErr } = await supabase
    .from('user_limits')
    .select(
      [
        'user_id',
        'plan',
        'daily_limit',
        'monthly_limit',
        'used_today',
        'used_monthly',
        'limit_reset_at',
        'monthly_reset_at',
        'active',
        'created_at',
        'updated_at',
      ].join(', ')
    )
    .eq('user_id', userId)
    .maybeSingle<UserLimitsRow>();

  if (readErr) {
    console.error('⚠️ Failed to fetch user_limits (proceeding with insert/update):', readErr);
  }

  // 3) Рассчитываем значения с учётом политики reset
  let usedToday = existing?.used_today ?? 0;
  let usedMonthly = existing?.used_monthly ?? 0;
  let limitResetAt = existing?.limit_reset_at ?? now;
  let monthlyResetAt = existing?.monthly_reset_at ?? now;

  if (resetMode === 'daily' || resetMode === 'all') {
    usedToday = 0;
    limitResetAt = now;
  }
  if (resetMode === 'monthly' || resetMode === 'all') {
    usedMonthly = 0;
    monthlyResetAt = now;
  }

  const payload = {
    user_id: userId,
    plan,
    daily_limit: planLimits.dailyGenerations,
    monthly_limit: planLimits.requestsPerMonth,
    used_today: usedToday,
    used_monthly: usedMonthly,
    limit_reset_at: limitResetAt,
    monthly_reset_at: monthlyResetAt,
    active: true,
    updated_at: now,
  };

  // 4) Вставка/обновление без перетирания created_at
  if (!existing) {
    const insertPayload = { ...payload, created_at: now } as Partial<UserLimitsRow> & {
      user_id: string;
      plan: string;
    };
    const { error: insertErr } = await supabase.from('user_limits').insert(insertPayload as any);
    if (insertErr) {
      console.error('❌ Failed to insert user_limits:', insertErr);
    } else {
      console.log(
        `✅ user_limits inserted for ${userId} plan=${plan} reset=${resetMode} reason=${opts?.reason ?? 'n/a'}`
      );
    }
    return;
  }

  const { error: updateErr } = await supabase
    .from('user_limits')
    .update(payload as Partial<UserLimitsRow>)
    .eq('user_id', userId);

  if (updateErr) {
    console.error('❌ Failed to update user_limits:', updateErr);
  } else {
    console.log(
      `✅ user_limits updated for ${userId} plan=${plan} reset=${resetMode} reason=${opts?.reason ?? 'n/a'}`
    );
  }
}
