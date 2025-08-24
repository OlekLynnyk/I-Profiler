// app/api/user/log/route.ts
import { NextResponse } from 'next/server';
import { tryLogUserAction } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // 1) Безопасный парсинг тела — никаких исключений наружу
  const body = (await req.json().catch(() => null)) as any;
  const userId = body?.userId;
  const action = body?.action;
  const metadata = body && 'metadata' in body ? body.metadata : null;

  // 2) Даже при кривом теле — не роняем клиент/пайплайн
  if (!userId || !action) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'bad_request' });
  }

  // 3) Лог пишем мягко: любые ошибки подавляются внутри
  await tryLogUserAction({ userId, action, metadata });

  // 4) Всегда успешный JSON-ответ
  return NextResponse.json({ ok: true });
}
