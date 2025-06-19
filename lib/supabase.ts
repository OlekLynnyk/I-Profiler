// lib/supabase.ts
import { createPagesBrowserClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

export function createBrowserClient(): SupabaseClient<Database> {
  return createPagesBrowserClient<Database>();
}

export function createServerClient(): SupabaseClient<Database> {
  return createServerComponentClient<Database>({ cookies });
}
