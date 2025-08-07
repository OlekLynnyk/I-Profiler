'use client';

import {
  createPagesBrowserClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

export function createBrowserClient(): SupabaseClient<Database> {
  return createPagesBrowserClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
}

export function createServerClient(): SupabaseClient<Database> {
  return createServerComponentClient<Database>({ cookies });
}
