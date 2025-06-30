'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { KeyboardEvent } from 'react';

interface HeaderBarProps {
  onOpenSidebar: () => void;
  onOpenHelper: () => void;
  onLogout: () => void;
}

export default function HeaderBar({ onOpenSidebar, onOpenHelper, onLogout }: HeaderBarProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  const { plan: packageType, used: demoAttempts } = useUserPlan(0);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') onLogout();
  };

  if (isLoading || !session) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 min-h-12 py-2 px-2 sm:px-4 flex items-center justify-between flex-wrap gap-2 bg-[var(--background)]/80 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <button
        onClick={onOpenHelper}
        className="text-[var(--text-primary)] text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)]"
      >
        Resources Hub
      </button>

      <div
        role="button"
        tabIndex={0}
        aria-label="Go to home"
        onKeyDown={handleKeyDown}
        className="text-xs sm:text-base font-montserrat font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none focus-visible:ring focus-visible:ring-[var(--accent)]"
        onClick={onLogout}
      >
        I,Profiler
      </div>

      <button
        onClick={onOpenSidebar}
        className="text-[var(--text-primary)] text-xs sm:text-sm px-3 py-1 rounded-md transition hover:bg-[var(--surface)]"
      >
        Account Panel
      </button>
    </div>
  );
}
