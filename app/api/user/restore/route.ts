import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env } from '@/env.server';
import { logUserAction } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const anon = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const {
    data: { user },
  } = await anon.auth.getUser(token);

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ⛔️ здесь была ошибка — заменяем на service role
  const admin = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await admin
    .from('profiles')
    .update({
      is_deleted: false,
      deleted_at: null,
    })
    .eq('id', user.id)
    .gt('deleted_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }

  await logUserAction({
    userId: user.id,
    action: 'profile_restored',
    metadata: {
      endpoint: '/app/api/user/restore',
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true });
}
