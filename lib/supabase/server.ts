'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { env } from '@/env.server';

export async function createServerClientForApi() {
  const cookieStore = await cookies();

  const SUPABASE_URL = env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[Supabase Init] Missing ENV vars', {
      SUPABASE_URL,
      SERVICE_ROLE_KEY_EXISTS: !!SERVICE_ROLE_KEY,
    });

    throw new Error('Supabase ENV variables are not available at runtime');
  }

  return createServerClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { flowType: 'pkce' },
    cookies: {
      getAll: async () => await cookieStore.getAll(),
      setAll: async (all) => {
        for (const { name, value, options } of all) {
          await cookieStore.set(name, value, options);
        }
      },
    },
  });
}
