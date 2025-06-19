import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token or no user' }, { status: 401 });
  }

  const insertIfNotExists = async <
    T extends keyof Database['public']['Tables']
  >(
    table: T,
    match: Partial<Database['public']['Tables'][T]['Row']>,
    data: Partial<Database['public']['Tables'][T]['Insert']>
  ) => {
    const { data: existing, error: selectError } = await supabase
      .from(table)
      .select('*') // ✅ Исправлено: универсально работает для всех таблиц
      .match(match)
      .maybeSingle();

    if (selectError) {
      console.warn(`❌ [${table}] select error:`, selectError);
      return;
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from(table)
        .insert([data as any]);

      if (insertError) {
        console.warn(`❌ [${table}] insert error:`, insertError);
      } else {
        console.log(`✅ Inserted into ${table}:`, data);
      }
    }
  };

  // 👤 Профиль пользователя
  await insertIfNotExists('profiles', { id: user.id }, {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    avatar_url: user.user_metadata?.avatar_url || null,
    role: 'user',
    email_verified: Boolean(user.email_confirmed_at),
    agreed_to_terms: false,
  });

  // 🧾 Централизованная инициализация лимитов
  await insertIfNotExists('user_limits', { user_id: user.id }, {
    user_id: user.id,
    plan: 'Freemium',
    used_today: 0,
    daily_limit: 10,
    limit_reset_at: new Date().toISOString(),
    active: false,
  });

  return NextResponse.json({ success: true });
}
