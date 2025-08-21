import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/env.server';

/** 🔹 Client-side безопасные логгеры */
export function logError(message: string, context?: any) {
  console.error(`[ERROR]: ${message}`, context);
  // TODO: интеграция с Sentry
}

export function logInfo(message: string, context?: any) {
  console.info(`[INFO]: ${message}`, context);
}

export function logWarn(message: string, context?: any) {
  console.warn(`[WARN]: ${message}`, context);
}

/** 🔐 Серверная инициализация Supabase-клиента */
function getServerSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerSupabaseClient() called in client environment');
  }

  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

/** 📄 Логирование пользовательского действия в Supabase (сервер только) */
export async function logUserAction({
  userId,
  action,
  metadata = null,
}: {
  userId: string;
  action: string;
  metadata?: Record<string, any> | null;
}) {
  const supabase = getServerSupabaseClient();

  const { error } = await supabase.from('user_log').insert([{ user_id: userId, action, metadata }]);

  if (error) {
    logWarn('Failed to insert user_log', { error });
  } else {
    logInfo(`User action logged: ${action}`, { userId, metadata });
  }
}
