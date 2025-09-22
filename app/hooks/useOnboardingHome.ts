'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { getOnboardingFlags, setOnboardingFlags } from '@/lib/supabase/profileFlags';
import { logUserAction } from '@/lib/supabase/logUserAction';

const TARGET_SELECTOR = '#nav-workspace';

type Device = 'desktop' | 'mobile';

function detectDevice(): Device {
  if (typeof window === 'undefined') return 'desktop';
  const isCoarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua);
  return isCoarse || isMobileUA ? 'mobile' : 'desktop';
}

// персонализированный ключ в localStorage
const makeLSKey = (userId: string, device: Device) => `onb.home.${device}.seen:${userId}`;

export function useOnboardingHome() {
  const { session, user, supabase } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [ready, setReady] = useState(false);
  const device = useMemo(detectDevice, []);
  const syncing = useRef(false);

  useEffect(() => {
    (async () => {
      if (!session || !user) {
        setReady(true);
        return;
      }

      // 1) Быстрый кэш (персонально для юзера)
      const key = makeLSKey(user.id, device);
      if (localStorage.getItem(key) === 'true') {
        setShouldShow(false);
        setReady(true);
        return;
      }

      // 2) Источник истины — профиль
      try {
        const flags = await getOnboardingFlags(supabase, user.id);
        const seen = device === 'mobile' ? flags.mobileSeen : flags.desktopSeen;

        if (seen) {
          localStorage.setItem(key, 'true');
          setShouldShow(false);
        } else {
          setShouldShow(true);
          // логируем показ один раз, пока не отметили
          try {
            await logUserAction(supabase, user.id, 'onboarding_home_shown', { device });
          } catch {}
        }
      } catch {
        // fail-safe: не ломаем страницу
        setShouldShow(false);
      } finally {
        setReady(true);
      }
    })();
  }, [session, user, supabase, device]);

  const markSeen = async () => {
    if (!session || !user || syncing.current) return;
    syncing.current = true;

    const key = makeLSKey(user.id, device);
    localStorage.setItem(key, 'true');
    setShouldShow(false);

    try {
      await setOnboardingFlags(
        supabase,
        user.id,
        device === 'mobile' ? { mobileSeen: true } : { desktopSeen: true }
      );
    } catch {
      // в худшем случае останется отметка в localStorage
    } finally {
      syncing.current = false;
    }
  };

  return { ready, shouldShow, markSeen, device, targetSelector: TARGET_SELECTOR };
}
