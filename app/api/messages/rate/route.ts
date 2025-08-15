import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message_id, rating, timestamp } = await req.json();

  if (!message_id || !timestamp || !['up', 'down'].includes(rating)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { error } = await supabase.from('message_ratings').upsert(
    [
      {
        message_id,
        rating,
        timestamp,
        user_id: user.id,
      },
    ],
    { onConflict: 'message_id,user_id' }
  );

  if (error) {
    console.error('Error storing rating:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
