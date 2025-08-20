'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/supabase';
import { env } from '@/env.server';

export const supabase = createPagesBrowserClient<Database>({
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
