import { SupabaseClient } from '@supabase/supabase-js';
import { PACKAGE_LIMITS, ValidPackageType } from '@/types/plan';
import { Database } from '@/types/supabase';

export async function updateUserLimits(
  supabase: SupabaseClient<Database>,
  userId: string,
  plan: ValidPackageType
) {
  const newLimit = PACKAGE_LIMITS[plan].dailyGenerations;

  const { error } = await supabase
    .from('user_limits')
    .upsert(
      {
        user_id: userId,
        plan,
        daily_limit: newLimit,
        used_today: 0,
        limit_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('❌ Failed to upsert user limits:', error);
  } else {
    console.log(`✅ user_limits upserted for ${userId} to plan ${plan}`);
  }
}
