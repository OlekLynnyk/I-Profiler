import { NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';
import { logUserAction } from '@/lib/logger';

export async function POST(req: Request) {
  // авторизация по секрету (если уже включили — оставляйте)
  const secretHeader = req.headers.get('x-sync-secret');
  const expected = process.env.SYNC_SECRET_KEY || '';
  if (expected && secretHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServerClientForApi();
  const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;

  // ВАЖНО: count передаём в delete(...)
  const { error, count } = await supabase
    .from('chat_messages')
    .delete({ count: 'exact' }) // ← supabase-js v2
    .lt('timestamp', twelveHoursAgo)
    .select('id'); // ← только id, чтобы не тянуть тело строк

  if (error) {
    console.error('[Cleanup Error]', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }

  try {
    await logUserAction({
      userId: 'system',
      action: 'chat_messages:cleanup',
      metadata: {
        thresholdMs: twelveHoursAgo,
        deletedCount: count ?? 0,
        ts: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.warn('[Cleanup Log Warning]', e);
  }

  return NextResponse.json({ success: true, deleted: count ?? 0 });
}
