'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  Session,
  User,
} from '@supabase/supabase-js';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  supabase: typeof supabase;
}>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  supabase,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);

      // ✅ Путь обновлён: /api/user/init
      if (data.session?.access_token) {
        try {
          await fetch('/api/user/init', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          });
        } catch (e) {
          console.warn('❌ Failed to init user:', e);
        }
      }

      setIsLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signOut,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
