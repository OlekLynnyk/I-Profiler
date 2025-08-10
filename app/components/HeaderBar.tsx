'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { KeyboardEvent } from 'react';
import { Upload } from 'lucide-react';
import { useSidebar } from '@/app/context/SidebarContext';

interface HeaderBarProps {
  onLogout: () => void;
  onSaveProfiling: () => void;
  disableSaveProfiling?: boolean;
}

export default function HeaderBar({
  onLogout,
  onSaveProfiling,
  disableSaveProfiling,
}: HeaderBarProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const { plan: packageType, used: demoAttempts } = useUserPlan(0);
  const { toggleSidebar, openSidebar } = useSidebar();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') onLogout();
  };

  useEffect(() => {
    console.log('SidebarContext changed →', openSidebar);
  }, [openSidebar]);

  if (isLoading || !session) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 h-14 sm:h-12 px-2 sm:px-4 flex items-center justify-between gap-2 bg-[var(--background)]/80 backdrop-blur overflow-x-auto whitespace-nowrap"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Left buttons */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => toggleSidebar('left')}
          className="text-[var(--text-primary)] text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)]"
        >
          Resources Hub
        </button>

        <button className="flex items-center gap-1 text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)] opacity-50 pointer-events-none">
          <span className="text-[var(--text-primary)]">More</span>
        </button>
      </div>

      {/* Center brand */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Go to home"
        onKeyDown={handleKeyDown}
        className="text-sm sm:text-sm font-inter font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none focus-visible:ring focus-visible:ring-[var(--accent)]"
        onClick={onLogout}
      >
        H1NTED
      </div>

      {/* Right controls */}
      <div className="flex gap-2 items-center">
        <button
          onClick={onSaveProfiling}
          disabled={disableSaveProfiling}
          className={`flex items-center gap-1 text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)] ${
            disableSaveProfiling ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <Upload size={14} className="text-[var(--text-primary)]" />
          <span className="text-[var(--text-primary)]">Save</span>
        </button>

        <button
          onClick={() => toggleSidebar('right')}
          className="text-[var(--text-primary)] text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)]"
        >
          Account Panel
        </button>
      </div>
    </div>
  );
}
