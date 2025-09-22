// app/api/csp-report/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // на всякий

export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || '';
    const body = ct.includes('json') ? await req.text() : await req.text(); // отчёты часто как raw JSON
    console.warn('[CSP-REPORT]', body.slice(0, 10000));
  } catch (e) {
    // молча игнорируем ошибки
  }
  return new NextResponse(null, { status: 204 }); // no content
}
