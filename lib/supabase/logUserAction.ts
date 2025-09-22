import type { SupabaseClient } from '@supabase/supabase-js';

export async function logUserAction(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    await supabase.from('user_log').insert({
      user_id: userId,
      action,
      metadata: metadata || {},
    });
  } catch (err) {
    console.warn('❌ Failed to log user action:', err);
  }
}
