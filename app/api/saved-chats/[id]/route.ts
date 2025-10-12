import { NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';

// (можно оставить без жёсткой v4-проверки, чтобы не ловить ложные 400)
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // ← params — Promise
) {
  // обязательный await
  const { id } = await ctx.params;
  const trimmed = id?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = await createServerClientForApi();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('saved_chats')
    .delete()
    .match({ id: trimmed, user_id: user.id })
    .select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
