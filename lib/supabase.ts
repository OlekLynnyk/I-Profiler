'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '../types/supabase'; // (необязательно, если используешь типизацию для DB schema)

export const supabase: SupabaseClient<Database> = createPagesBrowserClient<Database>();
