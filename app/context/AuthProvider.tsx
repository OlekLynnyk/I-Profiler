'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { logWarn } from '@/lib/logger';

const supabase = createPagesBrowserClient({
  cookieOptions:
    process.env.NODE_ENV === 'production'
      ? {
          name: 'sb',
          domain: 'main.d3a9q3v3j43fq8.amplifyapp.com',
          path: '/',
          sameSite: 'lax',
          secure: true,
        }
      : {
          name: 'sb',
          domain: 'localhost',
          path: '/',
          sameSite: 'lax',
          secure: false,
        },
});

// ✅ Глобальный флаг инициализации (вне компонента)
let __hasInitialized = false;

const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  signOut: () => Promise<void>;
  supabase: typeof supabase;
}>({
  session: null,
  user: null,
  isLoading: true,
  initialized: false,
  signOut: async () => {},
  supabase,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.access_token && !__hasInitialized) {
        __hasInitialized = true;
        try {
          const res = await fetch('/api/user/init', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          });

          if (res.ok) {
            const json = await res.json();
            setInitialized(json.initialized ?? false);
          }
        } catch (e) {
          logWarn('User init failed in AuthProvider', e);
        }
      }

      if (typeof window !== 'undefined' && window.location.search.includes('checkout=success')) {
        console.info('[AuthProvider] Reinitializing after Stripe return');

        await new Promise((resolve) => {
          const interval = 100;
          let waited = 0;

          const check = () => {
            if (document.cookie.includes('sb-access-token') || waited >= 5000) {
              resolve(null);
            } else {
              waited += interval;
              setTimeout(check, interval);
            }
          };

          check();
        });

        const { data: refreshed } = await supabase.auth.getSession();
        setSession(refreshed.session);
        setUser(refreshed.session?.user ?? null);
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
    await supabase.auth.signOut({ scope: 'global' });
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        initialized,
        signOut,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
