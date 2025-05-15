'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { useDemoAttempts } from '@/app/hooks/useDemoAttempts';
import { useInitDemoProject } from '@/app/hooks/useInitDemoProject';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import SidebarHelper from './SidebarHelper';

export default function WorkspacePage() {
  const { session, user, isLoading } = useAuth();
  const router = useRouter();

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const { demoAttempts, packageType } = useDemoAttempts();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  useInitDemoProject(session, supabase);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/');
    }
  }, [session, isLoading]);

  const handleLogoutConfirm = () => {
    const confirmed = window.confirm('Are you sure you want to return to the home page?');
    if (confirmed) router.push('/');
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

      {/* Верхний левый угол: I,Profiler + AI Help Centre */}
      <div className="absolute top-6 left-6 z-30 flex flex-col items-start space-y-2">
        <div
          className="text-lg font-montserrat font-semibold text-[#F5F5F5] cursor-pointer"
          onClick={handleLogoutConfirm}
        >
          I,Profiler — your assistant for good
        </div>

        <button
          onClick={() => setIsHelperOpen(true)}
          className="bg-[#C084FC] text-[#212529] text-sm font-inter rounded-2xl px-4 py-2 hover:bg-[#D8B4FE] transition-all shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
        >
          AI Help Centre
        </button>
      </div>

      {/* Settings */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-6 right-6 z-20 text-gray-700 px-4 py-2 rounded-xl transition hover:bg-gray-100"
      >
        ⚙️ Settings
      </button>

      <div className="flex-1 flex flex-col p-8 items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6 text-center">
          {/* Надпись над окном */}
          <p className="text-gray-500 text-base">Your next discovery is only a click away!</p>

          {/* Окно AI */}
          <div
            className="w-full min-h-[300px] bg-white border border-[#D6D3CD] rounded-xl p-6 focus-within:border-[#9B8AFB] transition-all"
          >
            <p className="text-gray-900 text-lg font-medium mb-2">🧠 AI Chat UI Placeholder</p>
            <p className="text-gray-500 text-sm">
              Chat window will appear here (50% of screen). Waiting for API integration...
            </p>
          </div>

          {/* Welcome текст под окном */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-gray-600">
              Subscription plan: <strong>{packageType}</strong> | Attempts left:{' '}
              <strong>{packageType === 'Freemium' ? 5 - demoAttempts : '∞'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
