// lib/supabase.types.ts
import { Database } from '@/types/supabase'; // путь может отличаться!

export type TypedSupabaseClient = ReturnType<
  typeof import('@supabase/auth-helpers-nextjs').createClientComponentClient<Database>
>;
