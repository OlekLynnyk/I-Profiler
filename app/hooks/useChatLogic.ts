'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/app/context/AuthProvider';
import { detectUserLanguage } from '@/scripts/detectUserLanguage';
import { logUserAction } from '@/lib/logger';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type Status = 'pending' | 'done' | 'error';
type Rating = 'up' | 'down' | null;

export interface UseChatLogicResult {
  messages: ChatMessage[];
  isGenerating: boolean;
  errorMessage: string;
  handleGenerate: (
    inputValue: string,
    attachments?: { name: string; base64: string }[],
    options?: {
      mode?: 'cdrs' | 'image' | 'chat';
      savedMessageIds?: string[];
      cdrDisplay?: { id: string; profile_name: string }[]; // только для UI
    }
  ) => Promise<void>;
  handleRate: (messageId: string, rating: Rating) => Promise<void>;
  clearMessages: () => void;
  generationError: { index: number } | null;
  retryGeneration: () => void;
  messageStatuses: Record<string, Status>;
  messageRatings: Record<string, Rating>;
  historyLoaded: boolean;
  currentProfileId: string | null;
  currentProfileName: string | null;
  setCurrentProfileId: (id: string | null) => void;
  setCurrentProfileName: (name: string | null) => void;
  createNewProfileId: () => Promise<string>;
  profilingMode: boolean;
  setProfilingMode: (value: boolean) => void;
  bypassHistoryCheckOnce: () => void;
}

export function useChatLogic(): UseChatLogicResult {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const [generationError, setGenerationError] = useState<{ index: number } | null>(null);
  const [lastInput, setLastInput] = useState('');
  const [messageStatuses, setMessageStatuses] = useState<Record<string, Status>>({});
  const [messageRatings, setMessageRatings] = useState<Record<string, Rating>>({});
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentProfileName, setCurrentProfileName] = useState<string | null>(null);
  const [profilingMode, setProfilingMode] = useState<boolean>(false);
  const bypassHistoryOnceRef = useRef(false);
  const bypassHistoryCheckOnce = () => {
    bypassHistoryOnceRef.current = true;
  };

  const { hasReachedLimit, refetch } = useUserPlan(refreshToken);

  useEffect(() => {
    if (!userId) return;

    const savedProfileId = localStorage.getItem(`profile_id_${userId}`);
    if (savedProfileId) {
      setCurrentProfileId(savedProfileId);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && currentProfileId) {
      localStorage.setItem(`profile_id_${userId}`, currentProfileId);
    }
  }, [currentProfileId, userId]);

  const getStorageKey = () =>
    userId && currentProfileId ? `chat_messages_${userId}_${currentProfileId}` : null;

  const applyFilteredMessages = (msgs: ChatMessage[]) => {
    const now = Date.now();
    const uniqueMap = new Map<string, ChatMessage>();
    for (const msg of msgs) {
      if (now - msg.timestamp < 43200000) {
        uniqueMap.set(msg.id, msg);
      }
    }
    const fresh = Array.from(uniqueMap.values()).slice(-100);
    setMessages(fresh);
  };

  useEffect(() => {
    if (!userId || !currentProfileId) return;

    (async () => {
      const since = Date.now() - 12 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('profile_id', currentProfileId)
        .gt('timestamp', since)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error(error);
        setHistoryLoaded(true);
        return;
      }

      if (data) {
        const restored = data.map((row) => ({
          id: row.id,
          role: row.role === 'ai' ? 'assistant' : row.role,
          content: row.content,
          timestamp: row.timestamp,
        })) as ChatMessage[];

        applyFilteredMessages(restored);
      }

      setHistoryLoaded(true);
    })();
  }, [userId, currentProfileId, refreshToken]);

  const createNewProfileId = async (): Promise<string> => {
    if (currentProfileId) {
      await clearMessages();
    }
    const newId = uuidv4();
    setCurrentProfileId(newId);
    setCurrentProfileName(null);
    setMessages([]);
    setProfilingMode(false);
    await new Promise((r) => setTimeout(r, 0));
    return newId;
  };

  const handleGenerate = async (
    inputValue: string,
    attachments?: { name: string; base64: string }[],
    options?: {
      mode?: 'cdrs' | 'image' | 'chat';
      savedMessageIds?: string[];
      cdrDisplay?: { id: string; profile_name: string }[]; // только для UI
    }
  ) => {
    const hasText = inputValue.trim() !== '';
    const hasAttachments = !!attachments?.length;
    const isCdr = options?.mode === 'cdrs';
    const hasEnoughCdrs = isCdr && (options?.savedMessageIds?.length ?? 0) >= 2;

    if (!hasText && !hasAttachments && !hasEnoughCdrs) return;

    if (hasReachedLimit) {
      setRefreshToken((prev) => prev + 1);
      return;
    }

    if (isGenerating) return;

    const bypass = bypassHistoryOnceRef.current;
    bypassHistoryOnceRef.current = false;

    const baseMessages: ChatMessage[] = bypass ? [] : messages;

    if (profilingMode && historyLoaded && messages.length > 0 && !bypass) {
      setErrorMessage('Clear history before starting a new AI DISCERNMENT session.');
      return;
    }

    const traceId = uuidv4();

    let activeProfileId = currentProfileId;

    if (profilingMode) {
      activeProfileId = await createNewProfileId();
    } else if (!activeProfileId) {
      activeProfileId = await createNewProfileId();
    }

    setIsGenerating(true);
    setErrorMessage('');
    setLastInput(inputValue);
    setGenerationError(null);

    const payload: any = { text: inputValue.trim(), attachments };
    if (options?.mode === 'cdrs' && options?.cdrDisplay?.length) {
      payload.cdrs = options.cdrDisplay; // [{ id, profile_name }]
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: JSON.stringify(payload),
      timestamp: Date.now(),
    };

    try {
      await supabase.from('chat_messages').insert([
        {
          id: userMessage.id,
          user_id: userId,
          profile_id: activeProfileId,
          profile_name: currentProfileName,
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp,
        },
      ]);

      if (userId) {
        await logUserAction({
          userId,
          action: 'chat:prompt_submitted',
          metadata: {
            messageId: userMessage.id,
            profileId: activeProfileId,
            profiling: profilingMode,
            hasAttachment: !!attachments?.length,
          },
        });
      }

      setMessageStatuses((prev) => ({
        ...prev,
        [userMessage.id]: 'pending',
      }));

      const newMessages = [...baseMessages, userMessage];
      applyFilteredMessages(newMessages);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setErrorMessage(`No access token found. Please log in again. (Trace ID: ${traceId})`);
        setMessageStatuses((prev) => ({
          ...prev,
          [userMessage.id]: 'error',
        }));
        setIsGenerating(false);
        return;
      }

      // ────────────── B.1: correlationId (один на попытку) ──────────────
      const correlationId = uuidv4();
      // ──────────────────────────────────────────────────────────────────

      // ✅ Детектим язык прямо на фронте
      const detectedLang = detectUserLanguage(inputValue || '');
      const userLanguage = detectedLang || 'en';

      const body: any = {
        profileId: activeProfileId,
        profiling: profilingMode,
        userLanguage,
      };

      if (inputValue.trim()) {
        body.prompt = inputValue.trim();
      }

      if (attachments && attachments.length > 0) {
        body.images = attachments.map((a) => a.base64);
      }

      if (options?.mode) body.mode = options.mode;
      if (options?.savedMessageIds?.length) body.savedMessageIds = options.savedMessageIds;

      const aiResponse = await fetch('/api/ai/grok-3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ────────────── B.1: передаём токен и корреляцию ──────────────
          Authorization: `Bearer ${token}`,
          'x-correlation-id': correlationId,
          // ─────────────────────────────────────────────────────────────
        },
        body: JSON.stringify(body),
      });

      // ── CDRs: поддержка SSE ответа сервера (text/event-stream) ─────────
      const ct = aiResponse.headers.get('content-type') || '';
      let aiText: string;

      if (options?.mode === 'cdrs' && ct.includes('text/event-stream')) {
        // сервер шлёт «обёрнутые» SSE: каждая внешняя data: содержит строку inner-SSE
        const rawOuter = await aiResponse.text(); // ждём закрытия стрима
        aiText = extractFinalFromWrappedSse(rawOuter).trim();
        if (!aiText) {
          throw new Error('AI generation failed (empty SSE payload)');
        }
      } else {
        const aiData = await aiResponse.json();
        if (!aiResponse.ok) {
          throw new Error(aiData?.error || 'AI generation failed');
        }
        aiText = aiData?.result || aiData?.text || 'No response from AI';
      }

      // 🔹 по запросу: убираем спецсимволы markdown ТОЛЬКО для CDRs
      if (options?.mode === 'cdrs') {
        aiText = aiText.replace(/[#*]/g, '');
      }

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiText,
        timestamp: Date.now(),
      };

      await supabase.from('chat_messages').insert([
        {
          id: aiMessage.id,
          user_id: userId,
          profile_id: activeProfileId,
          profile_name: currentProfileName,
          role: aiMessage.role,
          content: aiMessage.content,
          timestamp: aiMessage.timestamp,
        },
      ]);

      // ── AUTOSAVE: только для CDRs ─────────────────────────────────────
      if (options?.mode === 'cdrs' && userId) {
        try {
          await supabase.from('saved_chats').insert([
            {
              user_id: userId,
              profile_name: `CDRs ${new Date().toLocaleDateString('en-GB')}`,
              saved_at: Date.now(),
              chat_json: {
                ai_response: aiText,
                user_comments: '',
              },
              folder: 'CDRs',
            },
          ]);

          await logUserAction({
            userId,
            action: 'profile:auto_saved_cdr',
            metadata: {
              source: 'cdrs',
              profileId: activeProfileId,
            },
          });
        } catch (e) {
          console.error('CDRs autosave failed:', e);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('usage:inc', { detail: { delta: 1 } }));
      }

      if (userId) {
        await logUserAction({
          userId,
          action: 'chat:response_generated',
          metadata: {
            messageId: aiMessage.id,
            profileId: activeProfileId,
          },
        });
      }

      setMessageStatuses((prev) => ({
        ...prev,
        [aiMessage.id]: 'done',
      }));

      const updatedMessages = [...baseMessages, userMessage, aiMessage];
      applyFilteredMessages(updatedMessages);

      setIsGenerating(false);
      setRefreshToken((prev) => prev + 1);
      await refetch();
    } catch (error) {
      // безопасное логирование без JSON.stringify над объектами ошибки
      console.error({
        level: 'error',
        traceId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
        context: 'handleGenerate',
        timestamp: new Date().toISOString(),
      });

      setErrorMessage(`An unexpected error occurred. Please try again. (Trace ID: ${traceId})`);
      setGenerationError({ index: baseMessages.length });
      setMessageStatuses((prev) => ({
        ...prev,
        [userMessage.id]: 'error',
      }));
      setIsGenerating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // CDRs SSE helpers — совместимы с серверной «обёрткой»
  // Сервер шлёт внешние SSE:
  //   data: "<chunkStr из upstream SSE>"   ← JSON-строка
  // Внутри chunkStr содержатся строки inner-SSE от XAI: "data: {...}\n\n"
  // 1) Разворачиваем внешние data → собираем inner-SSE
  // 2) Из inner-SSE извлекаем delta/content, игнорируя служебные чанки
  // ─────────────────────────────────────────────────────────────────────
  function extractFinalFromWrappedSse(rawOuter: string): string {
    const payloads = rawOuter
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim());

    let inner = '';

    for (const payload of payloads) {
      if (!payload || payload === '[DONE]') continue;

      try {
        // server отправляет JSON.stringify(chunkStr) — ожидаем строку
        const maybeStr = JSON.parse(payload);
        if (typeof maybeStr !== 'string') continue; // служебные объекты пропускаем
        inner += maybeStr;
        if (!maybeStr.endsWith('\n')) inner += '\n';
      } catch {
        // нестроковые/невалидные payload — игнорируем (чтобы не было «мусора»)
        continue;
      }
    }

    return extractFinalFromXaiSse(inner);
  }

  function extractFinalFromXaiSse(rawInner: string): string {
    const lines = rawInner
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim());

    let acc = '';

    for (const line of lines) {
      if (!line || line === '[DONE]') break;

      try {
        const obj = JSON.parse(line);
        // Берём только полезный текст модели
        const part =
          obj?.choices?.[0]?.delta?.content ??
          obj?.choices?.[0]?.message?.content ??
          (typeof obj?.content === 'string' ? obj.content : '');

        if (typeof part === 'string' && part) {
          acc += part;
        }
      } catch {
        // служебные не-JSON строки игнорируем
        continue;
      }
    }

    return acc;
  }

  const retryGeneration = () => {
    if (lastInput) handleGenerate(lastInput);
  };

  const handleRate = async (messageId: string, rating: Rating) => {
    setMessageRatings((prev) => ({ ...prev, [messageId]: rating }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) return;

      await logUserAction({
        userId,
        action: 'chat:message_rated',
        metadata: {
          messageId,
          rating,
        },
      });

      await fetch('/api/messages/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          user_id: userId,
          rating,
          timestamp: Date.now(),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const clearMessages = async () => {
    setMessages([]);
    const key = getStorageKey();
    if (key) {
      localStorage.removeItem(key);
    }

    if (userId && currentProfileId) {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId)
        .eq('profile_id', currentProfileId);

      await logUserAction({
        userId,
        action: 'chat:history_cleared',
        metadata: {
          profileId: currentProfileId,
        },
      });
    }
  };

  return {
    messages,
    isGenerating,
    errorMessage,
    handleGenerate,
    handleRate,
    clearMessages,
    generationError,
    retryGeneration,
    messageStatuses,
    messageRatings,
    historyLoaded,
    currentProfileId,
    currentProfileName,
    setCurrentProfileId,
    setCurrentProfileName,
    createNewProfileId,
    profilingMode,
    setProfilingMode,
    bypassHistoryCheckOnce,
  };
}
