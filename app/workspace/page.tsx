'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import Sidebar from './Sidebar';
import SidebarHelper from './SidebarHelper';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { supabase } from '@/lib/supabase/client';

export default function WorkspacePage() {
  const { session, user, isLoading } = useAuth();
  const router = useRouter();

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const { plan: packageType, used: demoAttempts, hasReachedLimit: limitReached } = useUserPlan();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/');
    }
  }, [session, isLoading]);

  const handleLogoutConfirm = () => {
    const confirmed = window.confirm('Are you sure you want to return to the home page?');
    if (confirmed) router.push('/');
  };

  const handleGenerate = async () => {
    if (limitReached) {
      alert('You have reached your daily limit. Upgrade your plan to continue.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      alert('No access token found. Please log in again.');
      return;
    }

    try {
      const res = await fetch('/api/user/log-generation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        alert(`Error logging generation: ${result.error}`);
        return;
      }

      alert('🎉 Generation successful!');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-600">🔄 Loading session...</div>;
  }

  if (!session) {
    return <div className="p-8 text-gray-600">❌ No access</div>;
  }

  return (
    <div className="flex h-screen bg-[#FDFCF9] text-black relative overflow-hidden">
      {isHelperOpen && <SidebarHelper onClose={() => setIsHelperOpen(false)} />}
      {isSidebarOpen && (
        <Sidebar onClose={() => setIsSidebarOpen(false)} packageType={packageType} />
      )}

      <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-6">
        <button
          onClick={() => setIsHelperOpen(true)}
          className="text-gray-700 text-sm font-inter px-4 py-2 rounded-xl transition hover:bg-gray-100"
        >
          Assistant Hub
        </button>

        <div
          className="text-lg font-montserrat font-semibold text-gray-700 cursor-pointer"
          onClick={handleLogoutConfirm}
        >
          I,Profiler
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-700 px-4 py-2 rounded-xl transition hover:bg-gray-100"
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="flex-1 flex flex-col p-8 items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <p className="text-gray-500 text-base">Your next discovery is only a click away!</p>

          <div className="w-full min-h-[50vh] bg-white border border-[#D6D3CD] rounded-xl p-6 focus-within:border-[#9B8AFB] transition-all">
            <p className="text-gray-900 text-lg font-medium mb-2">🧠 AI Chat UI Placeholder</p>
            <p className="text-gray-500 text-sm">
              Chat window will appear here (50% of screen). Waiting for API integration...
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={limitReached}
            className={`mt-4 px-6 py-3 rounded-md ${
              limitReached
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {limitReached ? 'Daily Limit Reached' : 'Start Generation'}
          </button>
        </div>
      </div>
    </div>
  );
}
