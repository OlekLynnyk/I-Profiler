'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function createServerClientForApi() {
  const cookieStore = await cookies(); // ✅ async — твоя среда требует этого

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
      },
      cookies: {
        getAll: async () => await cookieStore.getAll(), // ✅ async
        setAll: async (all) => {
          for (const { name, value, options } of all) {
            await cookieStore.set(name, value, options); // ✅ await
          }
        },
      },
    }
  );
}
 