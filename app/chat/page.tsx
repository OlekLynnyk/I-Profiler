'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function ChatPage() {
  const { session, userName } = useAuth();
  const router = useRouter();
  const [demoAttemptsLeft, setDemoAttemptsLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localUsername, setLocalUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const userId = session.user.id;

    const fetchDemoAttempts = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('demo_attempts')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Failed to fetch demo attempts:', error);
        return;
      }

      if (!data) {
        const { error: insertError } = await supabase.from('projects').insert({
          user_id: userId,
          demo_attempts: 3,
        });

        if (insertError) {
          console.warn('Failed to create new project record:', insertError);
          return;
        }

        setDemoAttemptsLeft(3);
        setIsLoading(false);
        return;
      }

      setDemoAttemptsLeft(data.demo_attempts);
      setIsLoading(false);

      if (data.demo_attempts <= 0) {
        router.push('/subscribe');
      }
    };

    fetchDemoAttempts();
  }, [session, router]);

  useEffect(() => {
    if (session?.user && !userName) {
      setShowUsernameModal(true);
    }
  }, [session, userName]);

  const handleUsernameSubmit = async () => {
    if (!localUsername.trim() || !session?.user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: localUsername.trim() })
      .eq('id', session.user.id);

    if (!error) {
      setShowUsernameModal(false);
      window.location.reload();
    } else {
      alert('Ошибка при сохранении имени');
    }
  };

  if (!session) {
    return <div className="p-8 text-white">Loading session...</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-white">Loading workspace...</div>;
  }

  return (
    <div className="relative p-8 max-w-3xl mx-auto text-white">
      {userName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl mb-6"
        >
          Hello, {userName}!
        </motion.div>
      )}

      <h1 className="text-2xl font-bold mb-4">Chat with AI</h1>
      <p className="mb-2">You have {demoAttemptsLeft} free attempts left.</p>

      <div className="mt-4 border border-gray-300 p-4 rounded bg-gray-800">
        <p>This is where the AI chat will be.</p>
      </div>

      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Enter your username</h2>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-4"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Your name"
            />
            <button
              onClick={handleUsernameSubmit}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
