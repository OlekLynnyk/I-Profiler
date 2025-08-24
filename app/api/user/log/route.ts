// app/api/user/log/route.ts
import { NextResponse } from 'next/server';
import { logUserAction } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    const userId = body?.userId;
    const action = body?.action;
    const metadata = body && 'metadata' in body ? body.metadata : null;

    if (!userId || !action) {
      return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 });
    }

    await logUserAction({ userId, action, metadata });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, reason: 'internal_error', message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
