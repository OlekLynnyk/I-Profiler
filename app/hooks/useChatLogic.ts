'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/app/context/AuthProvider';

export type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
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
  historyLoaded: boolean; // ✅ новый флаг
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
  const [historyLoaded, setHistoryLoaded] = useState(false); // ✅ новый флаг

  const { hasReachedLimit, refetch } = useUserPlan(refreshToken);

  const getStorageKey = () => {
    return userId ? `chat_messages_${userId}` : null;
  };

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

  // ✅ Загрузка истории из Supabase
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const since = Date.now() - 12 * 60 * 60 * 1000;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .gt('timestamp', since)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error(error);
        setHistoryLoaded(true); // ✅ считаем историю загруженной даже при ошибке
        return;
      }

      if (data) {
        const restored = data.map((row) => ({
          id: row.id,
          role: row.role,
          content: row.content,
          timestamp: row.timestamp,
        })) as ChatMessage[];

        applyFilteredMessages(restored);

        const key = getStorageKey();
        if (key) {
          localStorage.setItem(key, JSON.stringify(restored));
        }
      }

      setHistoryLoaded(true); // ✅ выставляем флаг после окончания загрузки
    })();
  }, [userId, refreshToken]);

  // ✅ Сохраняем историю в localStorage
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return;

    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, userId]);

  const handleGenerate = async (
    inputValue: string,
    attachments?: { name: string; base64: string }[]
  ) => {
    if (!inputValue.trim() && !attachments?.length) return;

    if (hasReachedLimit) {
      setRefreshToken((prev) => prev + 1);
      return;
    }

    if (isGenerating) return;

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
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp,
        },
      ]);

      setMessageStatuses((prev) => ({
        ...prev,
        [userMessage.id]: 'pending',
      }));

      const newMessages = [...messages, userMessage];
      applyFilteredMessages(newMessages);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setErrorMessage('No access token found. Please log in again.');
        setMessageStatuses((prev) => ({
          ...prev,
          [userMessage.id]: 'error',
        }));
        setIsGenerating(false);
        return;
      }

      const res = await fetch('/api/user/log-generation', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || 'Error logging generation');
        setGenerationError({ index: newMessages.length - 1 });
        setMessageStatuses((prev) => ({
          ...prev,
          [userMessage.id]: 'error',
        }));
        setIsGenerating(false);
        return;
      }

      setTimeout(async () => {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          role: 'ai',
          content: 'Here is your generated result.',
          timestamp: Date.now(),
        };

        await supabase.from('chat_messages').insert([
          {
            id: aiMessage.id,
            user_id: userId,
            role: aiMessage.role,
            content: aiMessage.content,
            timestamp: aiMessage.timestamp,
          },
        ]);

        setMessageStatuses((prev) => ({
          ...prev,
          [aiMessage.id]: 'done',
        }));

        const updatedMessages = [...messages, userMessage, aiMessage];
        applyFilteredMessages(updatedMessages);
        setIsGenerating(false);
        setRefreshToken((prev) => prev + 1);

        await refetch();
      }, 1000);
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage('Something went wrong while generating a response.');
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
      console.error('Failed to send rating', err);
    }
  };

  const clearMessages: () => void = async () => {
    setMessages([]);
    const key = getStorageKey();
    if (key) {
      localStorage.removeItem(key);
    }

    if (userId) {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);
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
    historyLoaded, // ✅ возвращаем новый флаг
  };
}
