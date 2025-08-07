// lib/auth.ts

// ✅ correct
import { createServerClient } from '@/lib/supabase';

export async function getUserFromSession() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
