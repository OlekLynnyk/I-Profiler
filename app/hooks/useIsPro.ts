'use client';

import { useUserPlan } from '@/app/hooks/useUserPlan';
import { isPaidPlan } from '@/types/plan';

export function useIsPro(): boolean {
  const { plan } = useUserPlan();
  return isPaidPlan(plan);
}
