'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';

export function useIsPro(): boolean {
  const { plan } = useUserPlan();
  return plan !== 'Freemium';
}
