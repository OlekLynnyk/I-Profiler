// lib/cdrsStream.ts
/**
 * Читает ответ CDRs как поток (SSE) или как обычный JSON — что пришло.
 * Ничего другого не трогает. Работает только для mode: "cdrs".
 */

export type CdrsRequestBody = {
  profileId: string;
  savedMessageIds: string[];
  prompt?: string;
  userLanguage?: string;
  images?: string[];
};

export type CdrsRunOptions = {
  /** Колбэк для частичных кусков текста (по мере прихода) */
  onChunk?: (text: string) => void;
  /** AbortSignal на случай отмены запроса */
  signal?: AbortSignal;
  /** Путь до API-роута; по умолчанию /api/ai/grok-3 */
  endpoint?: string;
};

/**
 * Запускает CDRs-запрос.
 * - Если сервер вернул `text/event-stream`, читает поток и возвращает весь текст.
 * - Если сервер вернул JSON, ведёт себя по-старому (result из JSON).
 */
export async function runCdrs(body: CdrsRequestBody, opts: CdrsRunOptions = {}): Promise<string> {
  const { onChunk, signal, endpoint = '/api/ai/grok-3' } = opts;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // ВАЖНО: mode ставим здесь — остальное тело как есть
    body: JSON.stringify({ ...body, mode: 'cdrs' }),
    signal,
  });

  const ct = res.headers.get('content-type') || '';

  // === Потоковый ответ (SSE) — новый путь только для CDRs ===
  if (ct.includes('text/event-stream') && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // SSE: строки вида "event: ..." / "data: ..." / "" (пустая строка-разделитель)
      for (const line of chunk.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('event:')) continue;
        if (t.startsWith('data:')) {
          const payload = t.slice(5).trim();
          // На бэке отправляется строка-кусок в JSON-обёртке (или сырой текст)
          try {
            const raw = JSON.parse(payload); // ожидаем строку
            if (typeof raw === 'string') {
              acc += raw;
              onChunk?.(raw);
            } else {
              // если это не строка — запасной путь
              const s = String(raw ?? '');
              acc += s;
              onChunk?.(s);
            }
          } catch {
            acc += payload;
            onChunk?.(payload);
          }
        }
      }
    }

    return acc;
  }

  // === Старый путь (JSON) — без изменений ===
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `CDRs failed with ${res.status}`);
  }

  // ожидаем форму { result: string, model?: string }
  const json = await res.json().catch(() => null as any);
  const result = json?.result;
  if (typeof result === 'string') return result;

  throw new Error('Empty result');
}

export default runCdrs;
