import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForApi } from '@/lib/supabase/server';

// Гарантируем Node.js-рантайм (нужен доступ к server env / service-role key)
export const runtime = 'nodejs';

/** UPPERCASE + trim. Спец-коды (EU/T1/XX и т.п.) не трогаем, длину не режем. */
function normalizeCountry(input?: string | null): string | undefined {
  if (!input) return undefined;
  const v = String(input).trim();
  if (!v) return undefined;
  return v.toUpperCase();
}

/** Пытаемся извлечь страну из заголовков платформы/CDN */
function deriveRegionFromHeaders(req: NextRequest): string | undefined {
  const h = req.headers;
  return (
    normalizeCountry(h.get('x-vercel-ip-country')) ||
    normalizeCountry(h.get('x-country')) ||
    normalizeCountry(h.get('x-country-code')) ||
    normalizeCountry(h.get('cf-ipcountry')) ||
    normalizeCountry(h.get('x-appengine-country')) ||
    undefined
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      consent_id,
      pref,
      f,
      a,
      m,
      banner_version,
      locale,
      region: regionFromClient,
      ts,
    } = body ?? {};

    // Базовая валидация входа — без изменений
    if (!consent_id || !pref || !banner_version || !ts) {
      return NextResponse.json(
        { error: 'invalid_payload' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // region: клиентский приоритетен, иначе из заголовков (оба нормализуем)
    const region = normalizeCountry(regionFromClient) ?? deriveRegionFromHeaders(req) ?? undefined;

    // Инициализация серверного Supabase-клиента (service-role key)
    const supabase = await createServerClientForApi();

    const { error } = await supabase.from('consent_logs').insert({
      consent_id,
      pref,
      f,
      a,
      m,
      banner_version,
      locale,
      region, // <- добавили нормализованное значение
      ts,
    });

    if (error) {
      console.error('[consent_logs] insert error:', error);
      return NextResponse.json(
        { error: 'db_error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[log-consent] server error:', e);
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
