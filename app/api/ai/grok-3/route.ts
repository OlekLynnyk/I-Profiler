import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { createServerClientForApi } from '@/lib/supabase/server';
import { parseExcel } from '@/scripts/downloadExcel';
import { randomUUID } from 'crypto';
import { detectUserLanguage } from '@/scripts/detectUserLanguage';
import { STANDARD_PROMPTS } from '@/scripts/constants';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { existsSync, writeFileSync } from 'fs';
import { Readable } from 'stream';

function redactHeaders(h: any) {
  if (!h) return {};
  const safe: Record<string, string> = {};
  const entries: Iterable<[string, string]> = typeof h.entries === 'function' ? h.entries() : [];
  for (const [k, v] of entries) {
    if (/authorization|cookie|set-cookie|api[-]?key|secret|password/i.test(k)) {
      safe[k] = '[REDACTED]';
    } else {
      safe[k] = v;
    }
  }
  return safe;
}
function withTraceJson(traceId: string, data: any, init?: number | ResponseInit) {
  const res = NextResponse.json(data, init as any);
  res.headers.set('x-trace-id', traceId);
  return res;
}

// Функция очистки текста от # и *
function sanitizeText(text: string): string {
  return text.replace(/[#*]/g, '').trim();
}

import { env } from '@/env.server';

const s3 = new S3Client({
  region: env.MY_AWS_REGION,
  credentials: {
    accessKeyId: env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: env.MY_AWS_SECRET_ACCESS_KEY,
  },
});

async function ensureExcelFileExists() {
  const tmpPath = '/tmp/file.xlsx';

  if (existsSync(tmpPath)) {
    console.log('Excel file already exists in /tmp. Skipping download.');
    return;
  }

  console.log('Excel file missing. Downloading from S3...');

  const command = new GetObjectCommand({
    Bucket: 'profiling-formulas',
    Key: 'profiling-formula_v2508.xlsx',
  });

  const response = await s3.send(command);

  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  const buffer = Buffer.concat(chunks);

  writeFileSync(tmpPath, buffer);

  console.log('Excel file downloaded to /tmp/file.xlsx');
}

// ── CDRs: optional formula loader (env → fallback; xlsx/text) ───────────────
async function tryLoadCdrsFormula(traceId: string): Promise<string | null> {
  // 1) сначала как было — читаем из env
  const envBucket = (env as any).CDRS_S3_BUCKET;
  const envKey = (env as any).CDRS_S3_KEY;

  // 2) если env нет — жёсткий fallback (как в Image)
  const bucket = envBucket || 'profiling-formulas';
  const key = envKey || 'cdrs:cdrs-formula.en.v1.md.xlsx';

  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = resp.Body as Readable;

    const chunks: Buffer[] = [];
    for await (const ch of body) chunks.push(ch as Buffer);
    const buf = Buffer.concat(chunks);

    // Если формула в xlsx — парсим, как в Image
    if (key.toLowerCase().endsWith('.xlsx')) {
      const tmp = '/tmp/cdrs-formula.xlsx';
      writeFileSync(tmp, buf);
      const { parsedLines } = await parseExcel(tmp);
      const text = (parsedLines ?? [])
        .map((l) => `Sheet: ${l.sheetName}\nRow: ${l.rowNumber}\n${l.text}`)
        .join('\n\n')
        .trim();
      return text || null;
    }

    // Иначе считаем текстом
    const text = buf.toString('utf8').trim();
    return text || null;
  } catch (e) {
    console.warn(
      `[GROK][${traceId}] Failed to load CDRs formula from S3 (bucket=${bucket}, key=${key}).`,
      String(e)
    );
    return null;
  }
}

// ── PATCH: helpers for safe image normalization ──────────────────────────────
const URL_RE = /^https?:\/\/\S+$/i;
const DATA_URL_IMG_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i;

/** Нормализует вход из Excel */
function normalizeExcelImage(input: string): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (URL_RE.test(s)) return s;
  if (DATA_URL_IMG_RE.test(s)) return s;

  const b64 = s.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(b64)) {
    return `data:image/png;base64,${b64}`;
  }
  return null;
}

function sniffMimeFromBase64(b64: string): string | null {
  const head = b64.slice(0, 24);
  if (head.startsWith('/9j/')) return 'image/jpeg';
  if (head.startsWith('iVBORw0KG')) return 'image/png';
  if (head.startsWith('UklGR')) return 'image/webp';
  return null;
}

function buildUserImageDataUrl(raw: string): string {
  const s = String(raw || '')
    .trim()
    .replace(/\s+/g, '');
  if (!s) return s;
  if (s.startsWith('data:image/')) return s;
  if (URL_RE.test(s)) return s;
  const mime = sniffMimeFromBase64(s) || 'image/jpeg';
  return `data:${mime};base64,${s}`;
}

// ── RETRY HELPERS ────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const jitter = (base: number) => Math.max(0, Math.floor(base * (0.5 + Math.random())));
const isRetriableStatus = (s: number) => s === 408 || s === 429 || (s >= 500 && s <= 599);

// Диагностические флаги
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Constants (no-regression) ────────────────────────────────────────────────
const MODEL_CHAT = 'grok-4-fast-reasoning' as const;
const MODEL_IMAGE = 'grok-2-vision-1212' as const;
const MODEL_CDRS = 'grok-4-fast-reasoning' as const;
const MAX_TOKENS_IMAGE = 3500;
const MAX_TOKENS_CDRS = 50000;
const CDRS_MIN_SAVED = 2;
const CDRS_MAX_SAVED = 5;
// 🔸 Новый флаг — включает стрим для CDRs. По умолчанию выключен (регрессий нет).
const CDRS_STREAMING_ENABLED = process.env.CDRS_STREAMING_ENABLED === '1';

// ── Image intake guards (NEW) ────────────────────────────────────────────────
const IMG_MAX_COUNT = Number(process.env.IMG_MAX_COUNT ?? '3');
const IMG_MAX_INLINE_MB = Number(process.env.IMG_MAX_INLINE_MB ?? '4');

const HTTP_URL_RE = /^https?:\/\/\S+$/i;
const DATA_URL_RE = /^data:image\/([a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i;
const SUPPORTED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function approxBytesFromBase64Len(len: number) {
  // base64 payload is ~ 4/3 of bytes ⇒ bytes ≈ len * 0.75
  return Math.floor(len * 0.75);
}

function parseDataUrlMeta(u: string) {
  const m = DATA_URL_RE.exec(String(u || '').trim());
  if (!m) return null;
  const [, subtype, payload] = m;
  const mime = `image/${subtype.toLowerCase()}`;
  return { mime, payload, bytes: approxBytesFromBase64Len(payload.length) };
}

function isSupportedMime(mime: string) {
  return SUPPORTED_MIME.has(String(mime || '').toLowerCase());
}

function mb(n: number) {
  return Math.round((n / (1024 * 1024)) * 10) / 10; // one decimal place
}

export async function POST(req: NextRequest) {
  noStore();

  const traceId = randomUUID();
  const reqHeaders = await headers();
  const startedAt = Date.now();

  const authzHeader = (
    req.headers.get('authorization') ||
    reqHeaders.get('authorization') ||
    ''
  ).trim();
  const correlationId =
    req.headers.get('x-correlation-id') || reqHeaders.get('x-correlation-id') || randomUUID();

  console.log(`[GROK][${traceId}] META`, {
    hasAuthz: authzHeader ? 'yes' : 'no',
    correlationId,
  });

  console.log(`[GROK][${traceId}] START`, {
    xai_api_key: env.XAI_API_KEY ? '✅ PRESENT' : '❌ MISSING',
    method: 'POST',
    headers: redactHeaders(reqHeaders),
  });

  try {
    const body = await req.json();
    const {
      profileId,
      prompt,
      imageBase64,
      profiling,
      userLanguage: userLangFromRequest,

      // ── New for CDRs ──
      mode, // 'cdrs' | 'image' | 'chat' (optional, backwards-compatible)
      savedMessageIds, // string[] for CDRs
    } = body || {};

    if (!profileId) {
      console.warn(`[GROK][${traceId}] MISSING profileId`);
      return withTraceJson(
        traceId,
        { error: 'Missing profileId', code: 'PAYLOAD_INVALID' },
        { status: 400 }
      );
    }

    // ── Validate CDRs mode (no regression for other modes) ──────────────────
    const isCdrs = mode === 'cdrs';
    const isImage = mode === 'image';
    const shouldStream = isCdrs && CDRS_STREAMING_ENABLED;

    if (isImage && Array.isArray(savedMessageIds) && savedMessageIds.length > 0) {
      return withTraceJson(
        traceId,
        { error: 'Saved reports cannot be attached in Image mode.', code: 'MODE_CONFLICT' },
        { status: 400 }
      );
    }

    if (isCdrs) {
      const ids: string[] = Array.isArray(savedMessageIds) ? savedMessageIds : [];
      if (ids.length < CDRS_MIN_SAVED) {
        return withTraceJson(
          traceId,
          {
            error: `Select at least ${CDRS_MIN_SAVED} saved reports to run CDRs.`,
            code: 'CDRS_MIN_ITEMS_NOT_MET',
          },
          { status: 400 }
        );
      }
      if (ids.length > CDRS_MAX_SAVED) {
        return withTraceJson(
          traceId,
          {
            error: `You can attach up to ${CDRS_MAX_SAVED} saved reports in CDRs.`,
            code: 'PAYLOAD_INVALID',
          },
          { status: 400 }
        );
      }
    }

    // ── Single supabase client (avoid redeclare) ────────────────────────────
    const supabase = await createServerClientForApi();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let messages: any[] = [];

    // ────────────────────────────────────────────────────────────────────────
    // Profiling flow (existing behaviour)
    // ────────────────────────────────────────────────────────────────────────
    if (profiling) {
      const excelFilePath = '/tmp/file.xlsx';

      console.log(`[GROK][${traceId}] PROFILING: ensureExcelFileExists`);
      await ensureExcelFileExists();

      const parseT0 = Date.now();
      const { parsedLines, imagesBase64, formulaLanguage } = await parseExcel(excelFilePath);
      console.log(`[GROK][${traceId}] PROFILING: parsed excel in ${Date.now() - parseT0}ms`, {
        lines: parsedLines.length,
        images: imagesBase64.length,
        formulaLanguage,
      });

      const userLanguage = userLangFromRequest || formulaLanguage || 'en';

      const allFormulaText = parsedLines
        .map((l) => `Sheet: ${l.sheetName}\nRow: ${l.rowNumber}\n${l.text}`)
        .join('\n\n');

      const standardPrompt = STANDARD_PROMPTS.profiling.trim();

      const fullSystemPrompt = [
        `INSTRUCTION:`,
        `- Always answer strictly in ${userLanguage}.`,
        `- Do not answer in any other language.`,
        `- Even if previous context or formula is in Russian, ignore that and answer only in ${userLanguage}.`,
        ``,
        `--- START OF FORMULA ---`,
        allFormulaText,
        `--- END OF FORMULA ---`,
        ``,
        `NOTE:`,
        `- The formula above is written in Russian.`,
        `- However, always reply in ${userLanguage}, regardless of the formula language.`,
        ``,
        `--- START OF INSTRUCTIONS ---`,
        standardPrompt,
        `--- END OF INSTRUCTIONS ---`,
      ].join('\n\n');

      messages.push({
        role: 'system',
        content: fullSystemPrompt,
      });

      for (const img of imagesBase64) {
        const url = normalizeExcelImage(img);
        if (!url) {
          console.warn(`[GROK][${traceId}] PROFILING: skipped invalid image input`);
          continue;
        }
        messages.push({
          role: 'system',
          content: [
            {
              type: 'image_url',
              image_url: { url, detail: 'high' },
            },
          ],
        });
      }

      const { error: insertSystemError } = await supabase.from('chat_messages').insert([
        {
          id: randomUUID(),
          user_id: null,
          profile_id: profileId,
          profile_name: null,
          role: 'system',
          type: 'system_marker',
          content: JSON.stringify({
            marker: 'profiling_formula_reference',
            formula_version: 'v1',
          }),
          timestamp: Date.now(),
        },
      ]);
      if (insertSystemError) {
        console.error(`[GROK][${traceId}] Failed to save system_marker:`, insertSystemError);
      }
    } else {
      // ──────────────────────────────────────────────────────────────────────
      // Non-profiling: Chat / Image / CDRs
      // ──────────────────────────────────────────────────────────────────────

      // (A) If CDRs: inject CDRs formula (text) & selected saved reports
      if (isCdrs) {
        const userLanguage =
          userLangFromRequest || (prompt?.trim() ? detectUserLanguage(prompt, 'en') : 'en');

        // Optional CDRs formula from S3 (English); graceful if absent
        const cdrsFormula = await tryLoadCdrsFormula(traceId);
        if (cdrsFormula) {
          messages.push({
            role: 'system',
            content: [
              `INSTRUCTION:`,
              `- Always answer strictly in ${userLanguage}.`,
              `- Use the attached CDRs formula as the primary reasoning framework.`,
              ``,
              `--- START OF CDRs FORMULA (EN) ---`,
              cdrsFormula,
              `--- END OF CDRs FORMULA ---`,
            ].join('\n\n'),
          });
        } else {
          messages.push({
            role: 'system',
            content: [
              `INSTRUCTION:`,
              `- Always answer strictly in ${userLanguage}.`,
              `- If an internal formula is unavailable, produce the best possible analysis using the provided saved reports.`,
            ].join('\n\n'),
          });
        }

        // Load saved reports (attachments) from Supabase.saved_chats
        const ids: string[] = Array.isArray(savedMessageIds) ? savedMessageIds : [];
        if (ids.length > 0) {
          const { data: savedRows, error: savedErr } = await supabase
            .from('saved_chats')
            .select('id, profile_name, chat_json')
            .in('id', ids);

          if (savedErr) {
            console.error(`[GROK][${traceId}] failed to fetch saved_chats`, savedErr);
            return withTraceJson(
              traceId,
              { error: 'Failed to fetch saved reports.', code: 'INTERNAL_ERROR' },
              { status: 500 }
            );
          }

          const savedMap = new Map<string, any>();
          for (const r of savedRows || []) savedMap.set(String(r.id), r);

          ids.forEach((id: string, idx: number) => {
            const row = savedMap.get(id);
            if (!row) {
              console.warn(`[GROK][${traceId}] saved report not found: ${id}`);
              return;
            }
            const title = row.profile_name || `Saved Report #${idx + 1}`;
            const cj = row.chat_json || {};
            const text =
              typeof cj?.ai_response === 'string'
                ? cj.ai_response
                : JSON.stringify(cj ?? {}, null, 2);

            messages.push({
              role: 'system',
              content: [
                `--- START OF ATTACHMENT #${idx + 1}: ${title} ---`,
                String(text),
                `--- END OF ATTACHMENT #${idx + 1} ---`,
              ].join('\n'),
            });
          });
        }
      }

      // (B) Existing history (kept for Chat/Image). For CDRs we do NOT inject chat history.
      if (!isCdrs) {
        const since = Date.now() - 12 * 60 * 60 * 1000;
        const { data: historyRows, error: historyError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('profile_id', profileId)
          .gt('timestamp', since)
          .order('timestamp', { ascending: true });

        if (historyError) {
          console.error(`[GROK][${traceId}] Error loading history:`, historyError);
          return withTraceJson(traceId, { error: 'Failed to load chat history' }, { status: 500 });
        }

        for (const row of historyRows || []) {
          let parsedContent = row.content;
          try {
            const parsed = JSON.parse(row.content);
            if (typeof parsed === 'object' && (parsed as any)?.text) {
              parsedContent = (parsed as any).text;
            }
          } catch {
            // keep as is
          }
          messages.push({ role: row.role, content: parsedContent });
        }

        const userLanguage =
          userLangFromRequest || (prompt?.trim() ? detectUserLanguage(prompt, 'en') : 'en');

        messages.unshift({
          role: 'system',
          content: `
INSTRUCTION:
- Always answer strictly in ${userLanguage}.
- Do not answer in any other language.
- Even if previous context is in Russian, ignore that and answer only in ${userLanguage}.
          `.trim(),
        });
      }
    }

    // ── Build user content (prompt/images) ───────────────────────────────────
    const imagesInput: string[] = Array.isArray((body as any)?.images)
      ? (body as any).images
      : imageBase64
        ? [String(imageBase64)]
        : [];

    if (imagesInput.length > IMG_MAX_COUNT) {
      return withTraceJson(
        traceId,
        {
          error: `Too many images: ${imagesInput.length}. Maximum allowed is ${IMG_MAX_COUNT}.`,
          code: 'IMG_COUNT_EXCEEDED',
          hint: 'Reduce the number of images or send them in several smaller requests.',
        },
        { status: 413 }
      );
    }

    type NormalizedImage = {
      kind: 'data' | 'url';
      url: string;
      mime?: string;
      approxBytes?: number;
    };
    const normalized: NormalizedImage[] = [];

    for (const raw of imagesInput) {
      const s = String(raw || '').trim();
      if (!s) continue;

      if (HTTP_URL_RE.test(s)) {
        normalized.push({ kind: 'url', url: s });
        continue;
      }

      const meta = parseDataUrlMeta(s);
      if (!meta) {
        return withTraceJson(
          traceId,
          {
            error:
              'Invalid image payload. Use a data URL (data:image/*;base64,...) or an HTTPS link.',
            code: 'PAYLOAD_INVALID',
            hint: 'Ensure the image is properly encoded as base64 or provide a valid HTTPS URL.',
          },
          { status: 400 }
        );
      }

      if (!isSupportedMime(meta.mime)) {
        return withTraceJson(
          traceId,
          {
            error: `Unsupported image format: ${meta.mime}. Supported formats are JPG, PNG and WebP.`,
            code: 'UNSUPPORTED_MEDIA_TYPE',
            hint: 'Please save the image as JPG/PNG/WebP and try again.',
          },
          { status: 415 }
        );
      }

      const maxBytes = IMG_MAX_INLINE_MB * 1024 * 1024;
      if (meta.bytes > maxBytes) {
        return withTraceJson(
          traceId,
          {
            error: `The image is too large (~${mb(meta.bytes)} MB). The maximum inline size is ${IMG_MAX_INLINE_MB} MB.`,
            code: 'PAYLOAD_TOO_LARGE',
            hint: 'Compress the image, reduce its dimensions, or upload it via cloud storage and send an HTTPS link.',
          },
          { status: 413 }
        );
      }

      normalized.push({ kind: 'data', url: s, mime: meta.mime, approxBytes: meta.bytes });
    }

    console.log(`[GROK][${traceId}] IMG_INTAKE`, {
      count: normalized.length,
      items: normalized.map((n) =>
        n.kind === 'url'
          ? { kind: n.kind, url: n.url.slice(0, 64) + (n.url.length > 64 ? '…' : '') }
          : { kind: n.kind, mime: n.mime, approxMB: mb(n.approxBytes!) }
      ),
    });

    const userContent: any[] = [];
    for (const n of normalized) {
      userContent.push({
        type: 'image_url',
        image_url: { url: n.url, detail: 'high' },
      });
    }

    if (prompt?.trim()) {
      userContent.push({ type: 'text', text: prompt.trim() });
    }

    if (userContent.length > 0) {
      messages.push({ role: 'user', content: userContent });
    }

    console.log(`[GROK][${traceId}] XAI: sending messages`, { count: messages.length });

    // ── RETRY BLOCK ──────────────────────────────────────────────────────────
    const XAI_RETRIES = Number(process.env.XAI_RETRIES ?? '1');
    const RETRY_BACKOFF_MS = Number(process.env.RETRY_BACKOFF_MS ?? '2000');
    const XAI_TIMEOUT_MS = Number(process.env.XAI_TIMEOUT_MS ?? '240000');
    const XAI_BUDGET_MS = Number(process.env.XAI_BUDGET_MS ?? '300000');

    // Model selection per mode (no regression for others)
    const model = isCdrs ? MODEL_CDRS : isImage ? MODEL_IMAGE : MODEL_CHAT;
    const max_tokens = isCdrs ? MAX_TOKENS_CDRS : MAX_TOKENS_IMAGE;

    const payload = {
      model,
      messages,
      temperature: 0.3,
      max_tokens,
      stream: !!shouldStream, // ← только для CDRs под флагом
    };
    const bodyString = JSON.stringify(payload);
    const payloadBytes = Buffer.byteLength(bodyString, 'utf8');

    let grokResponse: Response | null = null;
    let lastError: any = null;
    let budgetExhausted = false;

    const safetyMs = 150;

    for (let attempt = 0; attempt <= XAI_RETRIES; attempt++) {
      const elapsed = Date.now() - startedAt;
      let remaining = XAI_BUDGET_MS - elapsed;
      if (remaining <= 0) {
        console.warn(`[GROK][${traceId}] budget_exhausted_before_attempt`, { attempt, elapsed });
        budgetExhausted = true;
        break;
      }

      if (attempt > 0) {
        const backoff = Math.min(jitter(RETRY_BACKOFF_MS), Math.max(0, remaining - safetyMs));
        if (backoff > 0) {
          await sleep(backoff);
          remaining -= backoff;
        }
      }

      const attemptTimeout = Math.min(XAI_TIMEOUT_MS, Math.max(0, remaining - safetyMs));
      if (attemptTimeout <= 0) {
        console.warn(`[GROK][${traceId}] no_time_for_attempt`, { attempt, remaining });
        budgetExhausted = true;
        break;
      }

      const controller = new AbortController();
      const t0 = Date.now();
      const timer = setTimeout(() => controller.abort(), attemptTimeout);

      console.log(`[GROK][${traceId}] attempt_start`, {
        attempt,
        payload_bytes: payloadBytes,
        attemptTimeout,
        model,
        max_tokens,
      });

      try {
        const resp = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.XAI_API_KEY}`,
          },
          body: bodyString,
          signal: controller.signal,
        });

        clearTimeout(timer);

        const dt = Date.now() - t0;
        if (resp.ok) {
          console.log(`[GROK][${traceId}] attempt_success`, {
            attempt,
            status: resp.status,
            ms: dt,
          });
          grokResponse = resp;
          break;
        }

        const retriable = isRetriableStatus(resp.status);
        console[retriable ? 'warn' : 'error'](
          `[GROK][${traceId}] attempt_${retriable ? 'retriable_status' : 'non_retriable_status'}`,
          { attempt, status: resp.status, ms: dt }
        );

        if (retriable && attempt < XAI_RETRIES) {
          continue;
        } else {
          grokResponse = resp;
          break;
        }
      } catch (err: any) {
        clearTimeout(timer);
        const dt = Date.now() - t0;
        lastError = err;

        if (err?.name === 'AbortError') {
          console.warn(`[GROK][${traceId}] attempt_abort_timeout`, { attempt, ms: dt });
          if (attempt < XAI_RETRIES) {
            continue;
          } else {
            break;
          }
        }

        console.error(`[GROK][${traceId}] attempt_failed_exception`, {
          attempt,
          err: String(err?.message || err),
          ms: dt,
        });
        break;
      }
    } // end for

    if (!grokResponse) {
      if (lastError?.name === 'AbortError' || budgetExhausted) {
        console.error(
          `[GROK][${traceId}] Upstream timeout (final)`,
          budgetExhausted ? { reason: 'budget_exhausted' } : {}
        );
        return withTraceJson(
          traceId,
          { error: 'Upstream timeout', code: 'UPSTREAM_TIMEOUT' },
          { status: 504 }
        );
      }
      throw lastError || new Error('No response from upstream');
    }

    console.log(`[GROK][${traceId}] XAI: status ${grokResponse.status}`, {
      contentType: grokResponse.headers.get('content-type') || '',
    });

    const contentType = grokResponse.headers.get('content-type') || '';
    let data;

    // 🔸 Ветка SSE — только если CDRs и включён флаг стриминга
    if (shouldStream && contentType.includes('text/event-stream')) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullRawSse = '';

      // heartbeat, чтобы соединение не засыпало на прокси
      let hbTimer: NodeJS.Timeout | null = null;
      const startHeartbeat = (controller: ReadableStreamDefaultController) => {
        hbTimer = setInterval(() => controller.enqueue(encoder.encode(':\n\n')), 15000);
      };
      const stopHeartbeat = () => {
        if (hbTimer) clearInterval(hbTimer);
        hbTimer = null;
      };

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          // первые байты — немедленно
          controller.enqueue(encoder.encode(`event: start\ndata: {"model":"${model}"}\n\n`));
          startHeartbeat(controller);

          (async () => {
            try {
              const reader = grokResponse!.body!.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunkStr = decoder.decode(value);
                fullRawSse += chunkStr;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkStr)}\n\n`));
              }
              controller.enqueue(encoder.encode(`event: end\ndata: {"ok":true}\n\n`));
              stopHeartbeat();
              controller.close();

              // пост-сохранение результата (как раньше), markdown не трогаем
              try {
                const final = extractFinalFromXaiSse(fullRawSse);
                const cleanText = String(final || '').trim();

                const { error: insertError } = await supabase.from('chat_messages').insert([
                  {
                    id: randomUUID(),
                    user_id: user?.id ?? null,
                    profile_id: profileId,
                    role: 'assistant',
                    type: 'text',
                    content: JSON.stringify({ text: cleanText }),
                    timestamp: Date.now(),
                  },
                ]);
                if (insertError) {
                  console.error(`[GROK][${traceId}] Error saving AI message (SSE)`, insertError);
                }

                if (isCdrs && user?.id) {
                  const now = Date.now();
                  const title = `CDRs ${new Date(now).toLocaleDateString('en-GB')}`;
                  const { error } = await supabase.from('saved_chats').insert([
                    {
                      id: randomUUID(),
                      user_id: user.id,
                      profile_name: title,
                      saved_at: now,
                      folder: 'CDRs',
                      chat_json: {
                        ai_response: cleanText,
                        source: 'CDRs',
                        savedMessageIds: Array.isArray(savedMessageIds) ? savedMessageIds : [],
                        hasPhoto: Array.isArray((body as any)?.images)
                          ? (body as any).images.length > 0
                          : Boolean(imageBase64),
                        model,
                      },
                    } as any,
                  ]);
                  if (error) console.warn(`[GROK][${traceId}] CDR autosave failed (SSE)`, error);
                }

                // лог инкремента — без ожидания
                try {
                  const proto =
                    req.headers.get('x-forwarded-proto') ||
                    reqHeaders.get('x-forwarded-proto') ||
                    'https';
                  const host =
                    req.headers.get('x-forwarded-host') ||
                    reqHeaders.get('x-forwarded-host') ||
                    req.headers.get('host') ||
                    reqHeaders.get('host') ||
                    (req as any)?.nextUrl?.host ||
                    '';
                  const base = host ? `${proto}://${host}` : (req as any)?.nextUrl?.origin || '';
                  const usageUrl = `${base}/api/user/log-generation`;
                  void fetch(usageUrl, {
                    method: 'POST',
                    headers: {
                      ...(authzHeader ? { Authorization: authzHeader } : {}),
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      action: 'profile_generation_incremented',
                      correlation_id: correlationId,
                    }),
                    keepalive: true,
                  }).catch((e) =>
                    console.warn(`[GROK][${traceId}] log-generation threw (SSE)`, String(e))
                  );
                } catch {}
              } catch (e) {
                console.warn(`[GROK][${traceId}] post-save (SSE) failed`, String(e));
              }
            } catch (e) {
              stopHeartbeat();
              controller.enqueue(
                encoder.encode(`event: error\ndata: ${JSON.stringify(String(e))}\n\n`)
              );
              controller.close();
            }
          })();
        },
        cancel() {
          stopHeartbeat();
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'x-trace-id': traceId,
        },
      });
    }

    if (contentType.includes('application/json')) {
      data = await grokResponse.json();

      if (!grokResponse.ok) {
        console.error(`[GROK][${traceId}] Grok error`, {
          status: grokResponse.status,
          body:
            typeof data === 'object'
              ? JSON.stringify(data).slice(0, 500)
              : String(data).slice(0, 500),
        });
        return withTraceJson(
          traceId,
          {
            error: (data && (data.error || data.message)) || 'Grok API error',
            code: 'UPSTREAM_ERROR',
          },
          { status: 500 }
        );
      }
    } else {
      const text = await grokResponse.text();
      console.error(`[GROK][${traceId}] Grok returned non-JSON`, {
        status: grokResponse.status,
        snippet: text.slice(0, 300),
      });
      return withTraceJson(
        traceId,
        {
          error: `Grok returned unexpected response: ${text.slice(0, 300)}`,
          code: 'UPSTREAM_BAD_RESPONSE',
        },
        { status: 500 }
      );
    }

    const aiText = data?.choices?.[0]?.message?.content || 'No response from Grok.';
    // CDRs: не ломаем markdown; остальные режимы — как было
    const cleanText = isCdrs ? String(aiText || '').trim() : sanitizeText(aiText);

    // Save assistant message to chat (existing behaviour) — reuse same supabase and user
    const { error: insertError } = await supabase.from('chat_messages').insert([
      {
        id: randomUUID(),
        user_id: user?.id ?? null,
        profile_id: profileId,
        role: 'assistant',
        type: 'text',
        content: JSON.stringify({ text: cleanText }),
        timestamp: Date.now(),
      },
    ]);

    if (insertError) {
      console.error(`[GROK][${traceId}] Error saving AI message`, insertError);
      return withTraceJson(
        traceId,
        { error: 'Failed to save AI message to Supabase.', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }

    // ── NEW: Auto-save CDRs result into saved_chats (folder="CDRs") ─────────
    if (isCdrs && user?.id) {
      const now = Date.now();
      const title = `CDRs ${new Date(now).toLocaleDateString('en-GB')}`;
      // fire-and-forget через async IIFE (без .catch на PromiseLike)
      void (async () => {
        const { error } = await supabase.from('saved_chats').insert([
          {
            id: randomUUID(),
            user_id: user.id,
            profile_name: title,
            saved_at: now,
            folder: 'CDRs',
            chat_json: {
              ai_response: cleanText,
              source: 'CDRs',
              savedMessageIds: Array.isArray(savedMessageIds) ? savedMessageIds : [],
              hasPhoto: Array.isArray((body as any)?.images)
                ? (body as any).images.length > 0
                : Boolean(imageBase64),
              model,
            },
          } as any,
        ]);
        if (error) {
          console.warn(`[GROK][${traceId}] CDR autosave failed`, error);
        }
      })();
    }

    // fire-and-forget лог инкремента, корректный base URL (без new URL('/..', req.nextUrl))
    try {
      const proto =
        req.headers.get('x-forwarded-proto') || reqHeaders.get('x-forwarded-proto') || 'https';
      const host =
        req.headers.get('x-forwarded-host') ||
        reqHeaders.get('x-forwarded-host') ||
        req.headers.get('host') ||
        reqHeaders.get('host') ||
        (req as any)?.nextUrl?.host ||
        '';
      const base = host ? `${proto}://${host}` : (req as any)?.nextUrl?.origin || '';
      const usageUrl = `${base}/api/user/log-generation`;

      void fetch(usageUrl, {
        method: 'POST',
        headers: {
          ...(authzHeader ? { Authorization: authzHeader } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'profile_generation_incremented',
          correlation_id: correlationId,
        }),
        keepalive: true,
      })
        .then(async (r) => {
          if (!r.ok) {
            const b = await r.text().catch(() => '');
            console.warn(`[GROK][${traceId}] log-generation failed`, {
              status: r.status,
              body: b.slice(0, 200),
            });
          }
        })
        .catch((e: unknown) => {
          console.warn(`[GROK][${traceId}] log-generation threw`, String(e));
        });
    } catch (e: unknown) {
      console.warn(`[GROK][${traceId}] log-generation scheduling failed`, String(e));
    }

    const totalMs = Date.now() - startedAt;
    console.log(`[GROK][${traceId}] OK in ${totalMs}ms`, {
      bytes: Buffer.byteLength(cleanText, 'utf8'),
      model,
      max_tokens,
    });

    return withTraceJson(traceId, { result: cleanText, model });
  } catch (err: any) {
    console.error(`[GROK][${traceId}] UNEXPECTED`, { error: String(err?.message || err) });
    return withTraceJson(
      traceId,
      { error: err?.message || 'Unexpected server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// ── helper: извлекаем финальный текст из SSE Grok (только для CDRs потоков) ──
function extractFinalFromXaiSse(raw: string): string {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).trim());

  let acc = '';
  for (const line of lines) {
    if (line === '[DONE]') break;
    try {
      const obj = JSON.parse(line);
      const part =
        obj?.choices?.[0]?.delta?.content ??
        obj?.choices?.[0]?.message?.content ??
        obj?.content ??
        '';
      if (typeof part === 'string') {
        acc += part;
        continue;
      }
    } catch {
      // не JSON — добавим «как есть»
    }
    acc += line;
  }
  return acc;
}
