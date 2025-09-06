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
  // ReadonlyHeaders/Headers имеют .entries()
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
// ─────────────────────────────────────────────────────────────

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

// ── PATCH: helpers for safe image normalization (точечный фикс) ───────────────
const URL_RE = /^https?:\/\/\S+$/i;
const DATA_URL_IMG_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i;

/**
 * Нормализует вход из Excel:
 * - http(s) → оставить как есть
 * - data:image/*;base64,... → оставить как есть
 * - «голый» base64 → обернуть в data:image/png;base64,...
 * - иначе → null (пропустить)
 */
function normalizeExcelImage(input: string): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (URL_RE.test(s)) return s;
  if (DATA_URL_IMG_RE.test(s)) return s;

  const b64 = s.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(b64)) {
    // Выбрали PNG — совпадает с текущей логикой user-вложений
    return `data:image/png;base64,${b64}`;
  }
  return null;
}

/**
 * Строит корректный data URL для пользовательской картинки из чата.
 * Принимает как «голый» base64, так и готовый data:...;base64, ...
 */
function buildUserImageDataUrl(raw: string): string {
  const s = String(raw || '')
    .trim()
    .replace(/\s+/g, '');
  if (s.startsWith('data:')) return s; // уже готовый data URL
  return `data:image/png;base64,${s}`; // строго сохраняем png, как было (без поведенческих изменений)
}
// ─────────────────────────────────────────────────────────────

// ── RETRY HELPERS (без изменения внешнего поведения) ────────
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const jitter = (base: number) => Math.max(0, Math.floor(base * (0.5 + Math.random()))); // 0.5x..1.5x
const isRetriableStatus = (s: number) => s === 408 || s === 429 || (s >= 500 && s <= 599);

// Диагностические флаги для исключения кэширования/edge-побочек
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  noStore(); // диагностика: исключаем кэш-слои

  const traceId = randomUUID();
  const reqHeaders = await headers(); // ← FIX: headers() в твоей версии async
  const startedAt = Date.now();

  console.log(`[GROK][${traceId}] START`, {
    xai_api_key: env.XAI_API_KEY ? '✅ PRESENT' : '❌ MISSING',
    method: 'POST',
    headers: redactHeaders(reqHeaders),
  });

  try {
    const {
      profileId,
      prompt,
      imageBase64,
      profiling,
      userLanguage: userLangFromRequest,
    } = await req.json();

    if (!profileId) {
      console.warn(`[GROK][${traceId}] MISSING profileId`);
      return withTraceJson(traceId, { error: 'Missing profileId' }, { status: 400 });
    }

    const supabase = await createServerClientForApi();

    let messages: any[] = [];

    if (profiling) {
      // ✅ НЕ загружаем историю чата в профайлинге
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

      // ✅ Выбор языка: приоритет userLangFromRequest → formulaLanguage → en
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

      // ── PATCH: безопасная нормализация картинок из Excel/S3 ───────────────
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
              image_url: {
                url,
                detail: 'high',
              },
            },
          ],
        });
      }
      // ───────────────────────────────────────────────────────────────────────

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
      // ✅ Обычный режим — грузим историю чата
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
          // оставляем как есть
        }

        messages.push({
          role: row.role,
          content: parsedContent,
        });
      }

      // ✅ Детектим язык
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

    const userContent: any[] = [];

    // ── PATCH: безопасная очистка base64 из чата + поддержка готового data: ──
    if (imageBase64) {
      const url = buildUserImageDataUrl(imageBase64);
      userContent.push({
        type: 'image_url',
        image_url: {
          url,
          detail: 'high',
        },
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    if (prompt?.trim()) {
      userContent.push({
        type: 'text',
        text: prompt.trim(),
      });
    }

    if (userContent.length > 0) {
      messages.push({
        role: 'user',
        content: userContent,
      });
    }

    console.log(`[GROK][${traceId}] XAI: sending messages`, {
      count: messages.length,
    });

    // ── RETRY BLOCK: один и тот же payload на все попытки ───────────────────
    const XAI_RETRIES = Number(process.env.XAI_RETRIES ?? '1'); // доп. попыток (итого до 2)
    const RETRY_BACKOFF_MS = Number(process.env.RETRY_BACKOFF_MS ?? '600');
    const XAI_TIMEOUT_MS = Number(process.env.XAI_TIMEOUT_MS ?? '55000');
    const XAI_BUDGET_MS = Number(process.env.XAI_BUDGET_MS ?? '57000');

    const payload = {
      model: 'grok-2-vision-1212',
      messages, // ← тот же объект, без мутаций после этого места
      temperature: 0.3,
      max_tokens: 2000,
      stream: false,
    };
    const bodyString = JSON.stringify(payload); // ← один и тот же JSON на все попытки
    const payloadBytes = Buffer.byteLength(bodyString, 'utf8');

    let grokResponse: Response | null = null;
    let lastError: any = null;
    let budgetExhausted = false;

    const safetyMs = 150; // запас, чтобы не упереться в лимит платформы

    for (let attempt = 0; attempt <= XAI_RETRIES; attempt++) {
      // Проверяем оставшийся бюджет времени всего хендлера
      const elapsed = Date.now() - startedAt;
      let remaining = XAI_BUDGET_MS - elapsed;
      if (remaining <= 0) {
        console.warn(`[GROK][${traceId}] budget_exhausted_before_attempt`, { attempt, elapsed });
        budgetExhausted = true;
        break;
      }

      if (attempt > 0) {
        // небольшой backoff с джиттером, но не выходим за бюджет
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
      });

      try {
        const resp = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.XAI_API_KEY}`,
          },
          body: bodyString, // ← фиксированный payload
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

        // Не-OK: решаем, ретраить ли
        const retriable = isRetriableStatus(resp.status);
        console[retriable ? 'warn' : 'error'](
          `[GROK][${traceId}] attempt_${retriable ? 'retriable_status' : 'non_retriable_status'}`,
          { attempt, status: resp.status, ms: dt }
        );

        if (retriable && attempt < XAI_RETRIES) {
          // следующий цикл
          continue;
        } else {
          grokResponse = resp; // финальный ответ (не ок)
          break;
        }
      } catch (err: any) {
        clearTimeout(timer);
        const dt = Date.now() - t0;
        lastError = err;

        if (err?.name === 'AbortError') {
          console.warn(`[GROK][${traceId}] attempt_abort_timeout`, { attempt, ms: dt });
          if (attempt < XAI_RETRIES) {
            continue; // ретраим таймаут
          } else {
            // больше попыток нет — выходим, grokResponse останется null
            break;
          }
        }

        // Любая другая ошибка — не ретраим (строго по ТЗ)
        console.error(`[GROK][${traceId}] attempt_failed_exception`, {
          attempt,
          err: String(err?.message || err),
          ms: dt,
        });
        break;
      }
    } // end for

    // Если совсем не получили ответа (null) — решаем по причине
    if (!grokResponse) {
      if (lastError?.name === 'AbortError' || budgetExhausted) {
        console.error(
          `[GROK][${traceId}] Upstream timeout (final)`,
          budgetExhausted ? { reason: 'budget_exhausted' } : {}
        );
        return withTraceJson(traceId, { error: 'Upstream timeout' }, { status: 504 });
      }
      // Поведение как раньше: сваливаемся в общий catch → 500
      throw lastError || new Error('No response from upstream');
    }

    console.log(`[GROK][${traceId}] XAI: status ${grokResponse.status}`, {
      contentType: grokResponse.headers.get('content-type') || '',
    });

    const contentType = grokResponse.headers.get('content-type') || '';
    let data;

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
          { error: (data && (data.error || data.message)) || 'Grok API error' },
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
        { error: `Grok returned unexpected response: ${text.slice(0, 300)}` },
        { status: 500 }
      );
    }

    const aiText = data?.choices?.[0]?.message?.content || 'No response from Grok.';
    const cleanText = sanitizeText(aiText);

    const { error: insertError } = await supabase.from('chat_messages').insert([
      {
        id: randomUUID(),
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
        { error: 'Failed to save AI message to Supabase.' },
        { status: 500 }
      );
    }

    const totalMs = Date.now() - startedAt;
    console.log(`[GROK][${traceId}] OK in ${totalMs}ms`, {
      bytes: Buffer.byteLength(cleanText, 'utf8'),
    });

    return withTraceJson(traceId, { result: cleanText });
  } catch (err: any) {
    console.error(`[GROK][${traceId}] UNEXPECTED`, { error: String(err?.message || err) });
    return withTraceJson(
      traceId,
      { error: err?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}
