import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { message_id, user_id, rating, timestamp } = body;

  if (!message_id || !user_id || !timestamp || !['up', 'down'].includes(rating)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('message_ratings')
    .upsert([{ message_id, user_id, rating, timestamp }], { onConflict: 'message_id,user_id' });

  if (error) {
    console.error('Error storing rating:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
