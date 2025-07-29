// app/api/chat_messages/cleanup/route.ts

import { createServerClientForApi } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DELETE all chat messages older than 12 hours.
 * Should be invoked by a scheduled job or cron trigger every hour.
 */
export async function POST() {
  const supabase = await createServerClientForApi();
  const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .lt('timestamp', twelveHoursAgo);

  if (error) {
    console.error('[Cleanup Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
