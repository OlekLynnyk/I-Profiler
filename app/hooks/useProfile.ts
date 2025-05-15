import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// 1. Тип профиля — укажи все поля, которые у тебя есть в таблице Supabase
export type Profile = {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  agreed_to_terms: boolean;
  avatar_url: string | null;
  updated_at: string;
  role: string;
  email_verified: boolean;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  return { profile, loading };
}
