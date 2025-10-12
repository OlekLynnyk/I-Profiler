'use client';

import { useAuth } from '@/app/context/AuthProvider';

export type Device = 'desktop' | 'mobile';

export type WSFlags = {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  firstImageDrag: boolean; // step5
  step6: boolean;
};

export const COLMAP = {
  step1: { desktop: 'onboarding_ws_step1_desktop_seen', mobile: 'onboarding_ws_step1_mobile_seen' },
  step2: { desktop: 'onboarding_ws_step2_desktop_seen', mobile: 'onboarding_ws_step2_mobile_seen' },
  step3: { desktop: 'onboarding_ws_step3_desktop_seen', mobile: 'onboarding_ws_step3_mobile_seen' },
  step4: { desktop: 'onboarding_ws_step4_desktop_seen', mobile: 'onboarding_ws_step4_mobile_seen' },
  firstImageDrag: {
    desktop: 'onboarding_ws_first_image_drag_desktop_seen',
    mobile: 'onboarding_ws_first_image_drag_mobile_seen',
  },
  step6: { desktop: 'onboarding_ws_cdrs_desktop_seen', mobile: 'onboarding_ws_cdrs_mobile_seen' },
} as const;

type Supa = ReturnType<typeof useAuth>['supabase'];

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export const lsKey = (userId: string, device: Device, key: keyof WSFlags) =>
  `onb.ws.${key}_seen.${device}:${userId}`;

export async function getOnboardingWSFlags(
  client: Supa,
  userId: string,
  device: Device
): Promise<WSFlags> {
  try {
    const fields = Object.values(COLMAP)
      .flatMap((m) => [m.desktop, m.mobile])
      .join(',');
    const { data, error } = await client
      .from('profiles')
      .select(fields as any)
      .eq('id', userId)
      .single();
    if (error) throw error;

    const row: Record<string, unknown> = isRecord(data) ? data : {};
    const devKey: keyof typeof COLMAP.step1 = device === 'mobile' ? 'mobile' : 'desktop';

    return {
      step1: !!row[COLMAP.step1[devKey]],
      step2: !!row[COLMAP.step2[devKey]],
      step3: !!row[COLMAP.step3[devKey]],
      step4: !!row[COLMAP.step4[devKey]],
      firstImageDrag: !!row[COLMAP.firstImageDrag[devKey]],
      step6: !!row[COLMAP.step6[devKey]],
    };
  } catch {
    return {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      firstImageDrag: false,
      step6: false,
    };
  }
}

export async function setOnboardingWSFlags(
  client: Supa,
  userId: string,
  device: Device,
  partial: Partial<WSFlags>
) {
  const devKey: keyof typeof COLMAP.step1 = device === 'mobile' ? 'mobile' : 'desktop';
  const payload: Record<string, boolean> = {};
  (Object.keys(partial) as (keyof WSFlags)[]).forEach((k) => {
    if (partial[k] !== undefined) payload[COLMAP[k][devKey]] = !!partial[k];
  });
  try {
    if (Object.keys(payload).length > 0) {
      const { error } = await client.from('profiles').update(payload).eq('id', userId);
      if (error) throw error;
    }
  } catch {
    // offline — останется в LS
  }
}
