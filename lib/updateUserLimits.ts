import { SupabaseClient } from '@supabase/supabase-js';
import { PACKAGE_LIMITS, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export async function updateUserLimits(
  supabase: SupabaseClient<Database>,
  userId: string,
  plan: ValidPackageType
) {
  const planLimits = PACKAGE_LIMITS[plan];
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('user_limits')
    .upsert(
      {
        user_id: userId,
        plan,
        daily_limit: planLimits.dailyGenerations,
        used_today: 0,
        limit_reset_at: now,
        updated_at: now,
        active: true,

        // ✅ добавлено для месячного лимита
        monthly_limit: planLimits.requestsPerMonth,
        used_monthly: 0,
        monthly_reset_at: now,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('❌ Failed to upsert user limits:', error);
  } else {
    console.log(`✅ user_limits upserted for ${userId} to plan ${plan}`);
  }
}
 