'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

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

    return (data || []).map((item) => ({
      ...item,
      chat_json: typeof item.chat_json === 'string' ? JSON.parse(item.chat_json) : item.chat_json,
    })) as SavedProfile[];
  };

  const saveProfile = async (profile: SavedProfileInput) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.from('saved_chats').insert([profile]);

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
