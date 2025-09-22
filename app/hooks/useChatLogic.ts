'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/app/context/AuthProvider';
import { detectUserLanguage } from '@/scripts/detectUserLanguage';
import { logUserAction } from '@/lib/logger';
import { usageBump } from '@/app/workspace/context/PlanUsageContext';

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
    attachments?: { name: string; base64: string }[]
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
    return newId;
  };

  const handleGenerate = async (
    inputValue: string,
    attachments?: { name: string; base64: string }[]
  ) => {
    if (!inputValue.trim() && !(attachments && attachments.length > 0)) return;

    if (hasReachedLimit) {
      setRefreshToken((prev) => prev + 1);
      return;
    }

    if (isGenerating) return;

    if (profilingMode && historyLoaded && messages.length > 0) {
      setErrorMessage('Очистите историю перед началом нового профайлинга.');
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

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: JSON.stringify({ text: inputValue.trim(), attachments }),
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

      const newMessages = [...messages, userMessage];
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

      const resLog = await fetch('/api/user/log-generation', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      window.dispatchEvent(new CustomEvent('usage:inc', { detail: { delta: 1 } }));
      usageBump(1);

      const logResult = await resLog.json();

      if (!resLog.ok) {
        setErrorMessage(`${logResult.error || 'Error logging generation'} (Trace ID: ${traceId})`);
        setGenerationError({ index: newMessages.length - 1 });
        setMessageStatuses((prev) => ({
          ...prev,
          [userMessage.id]: 'error',
        }));
        setIsGenerating(false);
        return;
      }

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
        body.imageBase64 = attachments[0].base64;
      }

      const aiResponse = await fetch('/api/ai/grok-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(aiData.error || 'AI generation failed');
      }

      const aiText = aiData.result || 'No response from AI';

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

      const updatedMessages = [...messages, userMessage, aiMessage];
      applyFilteredMessages(updatedMessages);

      setIsGenerating(false);
      setRefreshToken((prev) => prev + 1);
      await refetch();
    } catch (error) {
      console.error(
        JSON.stringify({
          level: 'error',
          traceId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null,
          context: 'handleGenerate',
          timestamp: new Date().toISOString(),
        })
      );

      setErrorMessage(`An unexpected error occurred. Please try again. (Trace ID: ${traceId})`);
      setGenerationError({ index: messages.length - 1 });
      setMessageStatuses((prev) => ({
        ...prev,
        [userMessage.id]: 'error',
      }));
      setIsGenerating(false);
    }
  };

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
  };
}
