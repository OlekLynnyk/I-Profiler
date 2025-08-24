'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function createServerClientForApi() {
  // ⬅️ В твоём билде cookies() возвращает Promise — нужно await
  const cookieStore = await cookies();

  // ⬅️ Читаем ТОЛЬКО с рантайма, без env.server (иначе на Amplify может быть undefined)
  const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[Supabase Init] Missing ENV vars at runtime', {
      SUPABASE_URL_OK: !!SUPABASE_URL,
      SERVICE_ROLE_KEY_OK: !!SERVICE_ROLE_KEY,
    });
    throw new Error('Supabase ENV variables are not available at runtime');
  }

  return createServerClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { flowType: 'pkce' },
    cookies: {
      // ⬅️ Методы остаются async и работают с уже разрешённым cookieStore
      getAll: async () => cookieStore.getAll(),
      setAll: async (all) => {
        for (const { name, value, options } of all) {
          await cookieStore.set(name, value, options);
        }
      },
    },
  });
}
