'use client';

import { useAuth } from '@/app/context/AuthProvider';

export type OnboardingFlags = {
  desktopSeen: boolean;
  mobileSeen: boolean;
};

const TABLE = 'profiles';
const mapFromRow = (row: any): OnboardingFlags => ({
  desktopSeen: !!row?.onboarding_home_desktop_seen,
  mobileSeen: !!row?.onboarding_home_mobile_seen,
});

export async function getOnboardingFlags(
  client: ReturnType<typeof useAuth>['supabase'],
  userId: string
) {
  const { data, error } = await client
    .from(TABLE)
    .select('onboarding_home_desktop_seen,onboarding_home_mobile_seen')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return mapFromRow(data);
}

export async function setOnboardingFlags(
  client: ReturnType<typeof useAuth>['supabase'],
  userId: string,
  partial: Partial<OnboardingFlags>
) {
  const payload: Record<string, boolean> = {};
  if (partial.desktopSeen !== undefined) payload.onboarding_home_desktop_seen = partial.desktopSeen;
  if (partial.mobileSeen !== undefined) payload.onboarding_home_mobile_seen = partial.mobileSeen;

  const { error } = await client.from(TABLE).update(payload).eq('id', userId);
  if (error) throw error;
}
