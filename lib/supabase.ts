// isomorphic: can be imported from server and client

import {
  createPagesBrowserClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';
import { env } from '@/env.server';

export function createBrowserClient(): SupabaseClient<Database> {
  return createPagesBrowserClient<Database>({
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function createServerClient(): SupabaseClient<Database> {
  return createServerComponentClient<Database>({ cookies });
}
