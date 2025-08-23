'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logUserAction } from '@/lib/logger'; // ✅ добавлено

export interface SavedProfile {
  id: string;
  user_id: string;
  profile_name: string;
  saved_at: number;
  chat_json: {
    ai_response: string;
    user_comments: string;
  };
}

export interface SavedProfileInput {
  user_id: string;
  profile_name: string;
  saved_at: number;
  chat_json: {
    ai_response: string;
    user_comments: string;
  };
}

export function useSavedProfiles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // ✅ добавлено
      userId,
      action: 'profile:getAll',
      metadata: {
        count: data?.length || 0,
      },
    });

    return (data || []).map((item) => ({
      ...item,
      chat_json: typeof item.chat_json === 'string' ? JSON.parse(item.chat_json) : item.chat_json,
    })) as SavedProfile[];
  };

  const saveProfile = async (profile: SavedProfileInput) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.from('saved_chats').insert([profile]);

    await logUserAction({
      // ✅ добавлено
      userId: profile.user_id,
      action: 'profile:save',
      metadata: {
        profileName: profile.profile_name,
        savedAt: profile.saved_at,
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
        // ✅ добавлено
        userId: data.user_id,
        action: 'profile:update',
        metadata: {
          profileId,
          fields: Object.keys(data),
        },
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

    const { error } = await supabase.from('saved_chats').delete().eq('id', profileId);

    await logUserAction({
      // ✅ добавлено
      userId: '', // ❗ передай сюда user_id при вызове функции
      action: 'profile:delete',
      metadata: { profileId },
    });

    setIsLoading(false);

    if (error) {
      console.error(error);
      setError(error.message);
      throw error;
    }
  };

  return {
    isLoading,
    error,
    getSavedProfiles,
    saveProfile,
    updateProfile,
    deleteProfile,
  };
}
