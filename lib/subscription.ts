// lib/subscription.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { PackageType, isValidPackageType } from '@/types/plan';

/**
 * Проверяет наличие активной подписки.
 * Работает в любом окружении, требует SupabaseClient.
 */
export async function hasActiveSubscription(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return false;

  const { data, error } = await supabase
    .from('user_subscription')
    .select('status, subscription_ends_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return false;

  return (
    data.status === 'active' &&
    new Date(data.subscription_ends_at) > new Date()
  );
}

/**
 * Получает пакет подписки пользователя.
 * Работает в любом окружении, требует SupabaseClient.
 */
export async function getPackageFromServer(supabase: SupabaseClient): Promise<PackageType> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return 'Freemium';

  const { data, error } = await supabase
    .from('user_subscription')
    .select('package_type')
    .eq('user_id', user.id)
    .single();

  if (error || !data || !isValidPackageType(data.package_type)) {
    return 'Freemium'; // fallback
  }

  return data.package_type;
}
 