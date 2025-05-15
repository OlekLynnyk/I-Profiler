import { PackageType, isValidPackageType } from '@/types/plan';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getPackageFromServer(supabase: SupabaseClient): Promise<PackageType> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('package_type')
    .single();

  if (error || !data || !isValidPackageType(data.package_type)) {
    return 'Freemium'; // fallback
  }

  return data.package_type;
}
