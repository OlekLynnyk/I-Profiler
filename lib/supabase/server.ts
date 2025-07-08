'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function createServerClientForApi() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        flowType: 'pkce',
      },
      cookies: {
        getAll: async () => await cookieStore.getAll(),
        setAll: async (all) => {
          for (const { name, value, options } of all) {
            await cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}
