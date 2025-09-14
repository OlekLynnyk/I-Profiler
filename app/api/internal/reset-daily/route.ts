import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { createClient } from '@supabase/supabase-js';

type UserLimit = {
  user_id: string;
  used_today: number;
  used_monthly: number | null;
  monthly_limit: number | null;
  daily_limit: number;
  limit_reset_at: string | null;
  timezone?: string | null;
};

const CHUNK = 200;

export async function POST(req: NextRequest) {
  // 1) Проверяем секрет
  const secret = req.headers.get('authorization');
  const expectedKey = (process.env.SYNC_SECRET_KEY ?? '').trim();

  if (!expectedKey) {
    console.error('❌ SYNC_SECRET_KEY not set in environment');
    return new Response('Server misconfigured', { status: 500 });
  }

  if (secret !== `Bearer ${expectedKey}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2) Создаём service-role клиент Supabase
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    db: { schema: 'public' },
  });

  const nowUtc = DateTime.utc();
  let offset = 0;
  let totalUpdated = 0;
  let totalScanned = 0;

  while (true) {
    const { data, error } = await supabase
      .from('user_limits')
      .select(
        'user_id, used_today, used_monthly, monthly_limit, daily_limit, limit_reset_at, timezone'
      )
      .eq('active', true)
      .order('user_id', { ascending: true })
      .range(offset, offset + CHUNK - 1);

    if (error) {
      console.error('❌ read_batch_failed', error);
      return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 });
    }
    if (!data || data.length === 0) break;

    totalScanned += data.length;

    const updates: { user_id: string; used_today: number; limit_reset_at: string }[] = [];

    for (const user of data as UserLimit[]) {
      const { user_id, limit_reset_at, timezone } = user;

      const userTz = timezone || 'UTC';
      const nowLocal = nowUtc.setZone(userTz);

      let nextResetLocal: DateTime | null = null;
      if (limit_reset_at) {
        const parsed = DateTime.fromISO(limit_reset_at, { zone: 'utc' });
        if (parsed.isValid) {
          nextResetLocal = parsed.setZone(userTz);
        }
      }
      const lastResetLocal = nextResetLocal ? nextResetLocal.minus({ days: 1 }) : null;

      const isNewLocalDay =
        !lastResetLocal || nowLocal.startOf('day') > lastResetLocal.startOf('day');

      if (!isNewLocalDay) continue;

      const nextLocalReset = nowLocal.plus({ days: 1 }).startOf('day');
      const nextResetIso = nextLocalReset.toUTC().toISO();
      if (!nextResetIso) continue;

      updates.push({
        user_id,
        used_today: 0,
        limit_reset_at: nextResetIso,
      });
    }

    let batchUpdated = 0;
    let batchErrors = 0;

    for (const u of updates) {
      const { error: updErr } = await supabase
        .from('user_limits')
        .update({
          used_today: u.used_today,
          limit_reset_at: u.limit_reset_at,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', u.user_id);

      if (updErr) {
        batchErrors++;
        console.error('❌ update_failed', { user_id: u.user_id, error: updErr });
      } else {
        batchUpdated++;
      }
    }

    totalUpdated += batchUpdated;

    if (batchErrors > 0) {
      return NextResponse.json(
        {
          error: 'partial failure',
          scanned: data.length,
          updated: batchUpdated,
          updateErrors: batchErrors,
        },
        { status: 500 }
      );
    }

    if (data.length < CHUNK) break;
    offset += CHUNK;
  }

  console.log(
    JSON.stringify({
      event: 'reset_daily_done',
      scanned: totalScanned,
      updated: totalUpdated,
      ts: new Date().toISOString(),
    })
  );

  return NextResponse.json({ success: true, scanned: totalScanned, updated: totalUpdated });
}
