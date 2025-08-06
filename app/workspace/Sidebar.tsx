'use client';

import React, { useEffect, useRef, useState, type ReactNode, KeyboardEvent } from 'react';
import { useTheme } from 'next-themes';
import { useProfile } from '../hooks/useProfile';
import { PlanProgress } from '@/components/PlanProgress';
import { PackageType } from '@/types/plan';
import { useUserPlan } from '../hooks/useUserPlan';
import { usePlanUsage, PlanUsageProvider } from '../workspace/context/PlanUsageContext';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { useSidebar } from '@/app/context/SidebarContext';

// Типы

type SidebarProps = {
  packageType: PackageType;
  refreshToken: number;
};

type SectionBox = {
  id: string;
  title: string;
  content: React.ReactNode;
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ packageType, refreshToken }: SidebarProps) {
  const { profile } = useProfile();
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { openSidebar, closeSidebar } = useSidebar();
  const { handleCheckout } = useStripeCheckout();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleKeyToggle = (e: KeyboardEvent<HTMLDivElement>, boxId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveBox(prev => (prev === boxId ? null : boxId));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openSidebar.right &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar('right');
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openSidebar.right, closeSidebar]);

  const boxes: SectionBox[] = [
    {
      id: 'plan-box',
      title: packageType,
      content: (
        <PlanUsageProvider>
          <div
            className="space-y-2 text-sm text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <MonthlyUsage refreshToken={refreshToken} />
            <button
              onClick={() => handleCheckout('price_1RQYE4AGnqjZyhfAY8kOMZwm')}
              className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-xl w-full"
            >
              Upgrade to Smarter
            </button>
            <button
              onClick={() => handleCheckout('price_1RQYEXAGnqjZyhfAryCzNkqV')}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-xl w-full"
            >
              Upgrade to Business
            </button>
          </div>
        </PlanUsageProvider>
      ),
    },
    {
      id: 'profile-settings',
      title: 'Profile Settings',
      content: (
        <div className="space-y-2 text-sm text-[var(--text-primary)]" onClick={(e) => e.stopPropagation()}>
          <a href="/settings/profile" target="_blank" rel="noopener noreferrer" className="block hover:text-[var(--accent)]">
            Edit Profile
          </a>
          <a href="/settings/subscription" target="_blank" rel="noopener noreferrer" className="block hover:text-[var(--accent)]">
            Manage Subscription
          </a>
        </div>
      ),
    },
    {
      id: 'theme-settings',
      title: 'Theme',
      content: (
        <div className="space-y-2 text-sm text-[var(--text-primary)]" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'w-full px-3 py-1 rounded-xl flex items-center justify-between transition-colors',
              theme === 'light'
                ? 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]'
                : 'hover:bg-[var(--surface-secondary)]'
            )}
          >
            Light 🌞
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'w-full px-3 py-1 rounded-xl flex items-center justify-between transition-colors',
              theme === 'dark'
                ? 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]'
                : 'hover:bg-[var(--surface-secondary)]'
            )}
          >
            Dark 🌙
          </button>
        </div>
      ),
    },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed right-0 top-12
        w-full max-w-sm md:w-80
        text-[var(--text-primary)]
        z-50
        p-4
        transition-transform duration-500 ease-in-out
        ${openSidebar.right ? 'translate-x-0' : 'translate-x-full'}
        max-h-[calc(100vh-160px)]
        overflow-y-auto
        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent
      `}
      style={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}
    >
      {boxes.map((box) => {
        const isActive = activeBox === box.id;

        return (
          <div
            key={box.id}
            onClick={() => setActiveBox(prev => (prev === box.id ? null : box.id))}
            onKeyDown={(e) => handleKeyToggle(e, box.id)}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            aria-controls={`${box.id}-content`}
            className={cn(
              'transition-all duration-300 cursor-pointer mb-4 rounded-xl border',
              isActive
                ? 'border-[var(--accent)]'
                : 'border-[var(--card-border)] bg-[var(--card-bg)]',
              'hover:shadow-sm'
            )}
            style={{ backgroundColor: isActive ? 'transparent' : undefined }}
          >
            <div className="px-3 sm:px-4 py-3 flex justify-between items-center">
              {box.id === 'plan-box' ? (
                <PlanUsageProvider>
                  <PlanProgressFetcher refreshToken={refreshToken} />
                </PlanUsageProvider>
              ) : (
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {box.title}
                </span>
              )}
              <span className="text-[var(--text-secondary)] text-xs">
                {isActive ? '▲' : '▼'}
              </span>
            </div>
            {isActive && (
              <div id={`${box.id}-content`} className="px-3 sm:px-4 pb-4">
                {box.content}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

function PlanProgressFetcher({ refreshToken }: { refreshToken: number }) {
  const { updatedAt } = usePlanUsage();
  const { plan, limits, used, hasReachedDailyLimit, limitResetAt } = useUserPlan(updatedAt + refreshToken);

  if (!plan)
    return (
      <div className="text-xs text-[var(--text-secondary)]">
        Loading plan data...
      </div>
    );

  return (
    <div>
      <PlanProgress planName={plan} used={used} total={limits.dailyGenerations} />
      {hasReachedDailyLimit && (
        <p className="text-xs text-[var(--danger)] mt-1">
          Daily Limit Reached. Resets at{' '}
          {limitResetAt?.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          }) ?? '00:00'}
        </p>
      )}
    </div>
  );
}

function MonthlyUsage({ refreshToken }: { refreshToken: number }) {
  const { updatedAt } = usePlanUsage();
  const { limits, usedMonthly } = useUserPlan(updatedAt + refreshToken);

  return (
    <div className="text-xs bg-[var(--card-bg)] border border-[var(--card-border)] text-center text-[var(--text-primary)] px-3 py-1 rounded-xl w-full">
      Monthly usage: {usedMonthly}/{limits.monthlyGenerations}
    </div>
  );
}
