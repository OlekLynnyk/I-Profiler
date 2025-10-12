'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logUserAction } from '@/lib/logger';

export interface SavedProfile {
  id: string;
  user_id: string;
  profile_name: string;
  saved_at: number;
  chat_json: {
    ai_response: string;
    user_comments: string;
    // ↓ если когда-либо понадобится хранить внутри JSON (fallback),
    //   не ломая схему БД:
    // meta?: { folder?: string | null }
  };
  // ↓ новое поле из БД (аддитивно, безопасно)
  folder?: string | null;
}

export interface SavedProfileInput {
  user_id: string;
  profile_name: string;
  saved_at: number;
  chat_json: {
    ai_response: string;
    user_comments: string;
    // meta?: { folder?: string | null }
  };
  // ↓ опционально можно задавать при сохранении
  folder?: string | null;
}

// Для работы с пользовательскими блоками
export type SavedBlockName = string; // ограничим валидатором
const RESERVED_CDRS_BLOCK = 'CDRs';
const MAX_BLOCKS = 15;
const NAME_LIMIT = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSavedProfiles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Существующие методы (НЕ менял сигнатуры и логику)

  const getSavedProfiles = async (userId: string): Promise<SavedProfile[]> => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('saved_chats')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    setIsLoading(false);

    if (error) {
      console.error(error);
      setError(error.message);
      return [];
    }

    await logUserAction({
      userId,
      action: 'profile:getAll',
      metadata: { count: data?.length || 0 },
    });

    return (data || []).map((item: any) => ({
      ...item,
      chat_json: typeof item.chat_json === 'string' ? JSON.parse(item.chat_json) : item.chat_json,
    })) as SavedProfile[];
  };

  const saveProfile = async (profile: SavedProfileInput) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.from('saved_chats').insert([profile]);

    await logUserAction({
      userId: profile.user_id,
      action: 'profile:save',
      metadata: {
        profileName: profile.profile_name,
        savedAt: profile.saved_at,
        folder: profile.folder ?? null,
      },
    });

    setIsLoading(false);

    if (error) {
      console.error(error);
      setError(error.message);
      throw error;
    }
  };

  const updateProfile = async (profileId: string, data: Partial<SavedProfileInput>) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.from('saved_chats').update(data).eq('id', profileId);

    if (data.user_id) {
      await logUserAction({
        userId: data.user_id,
        action: 'profile:update',
        metadata: { profileId, fields: Object.keys(data) },
      });
    }

    setIsLoading(false);

    if (error) {
      console.error(error);
      setError(error.message);
      throw error;
    }
  };

  const deleteProfile = async (profileId: string) => {
    setIsLoading(true);
    setError(null);

    // 1) узнаём текущего пользователя из клиентской сессии
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      setIsLoading(false);
      setError('Unauthorized');
      throw new Error('Unauthorized');
    }

    // 2) удаляем ТОЛЬКО свою запись; RLS дополнительно это проверит
    const { error } = await supabase
      .from('saved_chats')
      .delete()
      .match({ id: profileId, user_id: user.id });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      throw error;
    }
  };

  // Порядок блоков — в user_metadata с локальным fallback (не ломает архитектуру)
  const getBlocksOrder = async (userId: string): Promise<SavedBlockName[]> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        const local = localStorage.getItem(`savedBlocksOrder:${userId}`);
        return local ? (JSON.parse(local) as string[]) : [];
      }
      const order = (data.user.user_metadata?.saved_blocks_order as string[]) || [];
      if (!Array.isArray(order)) return [];
      return order;
    } catch {
      const local = localStorage.getItem(`savedBlocksOrder:${userId}`);
      return local ? (JSON.parse(local) as string[]) : [];
    }
  };

  const setBlocksOrder = async (userId: string, order: SavedBlockName[]): Promise<void> => {
    try {
      await supabase.auth.updateUser({ data: { saved_blocks_order: order } });
      // удачно записали на сервер — чистим локалку
      localStorage.removeItem(`savedBlocksOrder:${userId}`);
    } catch {
      localStorage.setItem(`savedBlocksOrder:${userId}`, JSON.stringify(order));
    }
  };

  // Валидатор имени блока
  const validateFolderName = (name: string, existing: string[]) => {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Block name cannot be empty.');
    if (trimmed.length > NAME_LIMIT) throw new Error(`Block name is too long (>${NAME_LIMIT}).`);
    if (trimmed === RESERVED_CDRS_BLOCK) throw new Error('This name is reserved.');
    if (existing.includes(trimmed)) throw new Error('Block with this name already exists.');
    return trimmed;
  };

  // Создать блок
  const createFolder = async (userId: string, name: string): Promise<void> => {
    const order = await getBlocksOrder(userId);
    if (order.length >= MAX_BLOCKS) throw new Error(`Limit reached (${MAX_BLOCKS}).`);
    const valid = validateFolderName(name, order);
    const next = [...order, valid];
    await setBlocksOrder(userId, next);
    await logUserAction({ userId, action: 'folder:create', metadata: { name: valid } });
  };

  // Переименовать блок
  const renameFolder = async (userId: string, oldName: string, nextName: string): Promise<void> => {
    const order = await getBlocksOrder(userId);
    if (!order.includes(oldName)) throw new Error('Block not found.');
    const valid = validateFolderName(
      nextName,
      order.filter((n) => n !== oldName)
    );

    // 1) обновляем порядок
    const nextOrder = order.map((n) => (n === oldName ? valid : n));
    await setBlocksOrder(userId, nextOrder);

    // 2) батч-обновление saved_chats.folder
    const { error } = await supabase
      .from('saved_chats')
      .update({ folder: valid })
      .eq('user_id', userId)
      .eq('folder', oldName);
    if (error) throw error;

    await logUserAction({
      userId,
      action: 'folder:rename',
      metadata: { from: oldName, to: valid, updatedOrder: nextOrder.length },
    });
  };

  // Удалить блок (по умолчанию — только если пустой)
  const deleteFolder = async (userId: string, name: string): Promise<void> => {
    if (name === RESERVED_CDRS_BLOCK) throw new Error('Cannot delete reserved block.');
    const order = await getBlocksOrder(userId);
    if (!order.includes(name)) throw new Error('Block not found.');

    // Проверяем, пустой ли блок
    const { data, error } = await supabase
      .from('saved_chats')
      .select('id')
      .eq('user_id', userId)
      .eq('folder', name)
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) throw new Error('Block is not empty.');

    const nextOrder = order.filter((n) => n !== name);
    await setBlocksOrder(userId, nextOrder);

    await logUserAction({ userId, action: 'folder:delete', metadata: { name } });
  };

  // Переупорядочить блоки
  const reorderFolders = async (userId: string, nextOrder: SavedBlockName[]): Promise<void> => {
    if (nextOrder.length > MAX_BLOCKS) throw new Error(`Limit reached (${MAX_BLOCKS}).`);
    if (nextOrder.includes(RESERVED_CDRS_BLOCK))
      throw new Error('Reserved block cannot be reordered here.');
    await setBlocksOrder(userId, nextOrder);
    await logUserAction({
      userId,
      action: 'folder:reorder',
      metadata: { count: nextOrder.length },
    });
  };

  // Переместить запись между блоками
  const moveProfileToFolder = async (profileId: string, folder: string | null): Promise<void> => {
    if (folder === RESERVED_CDRS_BLOCK) throw new Error("You can't move items into CDRs.");
    const { error } = await supabase.from('saved_chats').update({ folder }).eq('id', profileId);
    if (error) throw error;
  };

  // Список блоков для текущего пользователя
  const getFolders = async (userId: string): Promise<SavedBlockName[]> => {
    // Собираем уникальные имена из данных пользователя
    const { data, error } = await supabase
      .from('saved_chats')
      .select('folder')
      .eq('user_id', userId);
    if (error) return [RESERVED_CDRS_BLOCK];

    const unique = new Set<string>();
    (data || []).forEach((row: any) => {
      const f = row?.folder ?? null;
      if (f && typeof f === 'string' && f !== RESERVED_CDRS_BLOCK) unique.add(f);
    });

    const order = await getBlocksOrder(userId);
    // показываем порядок как есть (включая пустые папки)
    const ordered = order;

    const rest = Array.from(unique)
      .filter((n) => !ordered.includes(n))
      .sort((a, b) => a.localeCompare(b));

    return [RESERVED_CDRS_BLOCK, ...ordered, ...rest];
  };

  return {
    // существующие
    isLoading,
    error,
    getSavedProfiles,
    saveProfile,
    updateProfile,
    deleteProfile,

    // новые (аддитивно)
    getFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    reorderFolders,
    moveProfileToFolder,
    getBlocksOrder, // если понадобится снаружи
    setBlocksOrder, // если понадобится снаружи
  };
}
