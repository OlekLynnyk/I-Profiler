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
import { PACKAGE_TO_PRICE } from '@/types/plan';

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
      setActiveBox((prev) => (prev === boxId ? null : boxId));
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
              onClick={() => handleCheckout(PACKAGE_TO_PRICE.Smarter!)}
              className="text-xs bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-[var(--text-primary)] ring-1 ring-[var(--card-border)] rounded-xl px-3 py-1 w-full transition"
            >
              Upgrade to Smarter
            </button>
            <button
              onClick={() => handleCheckout(PACKAGE_TO_PRICE.Select!)}
              className="text-xs bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-[var(--text-primary)] ring-1 ring-[var(--card-border)] rounded-xl px-3 py-1 w-full transition"
            >
              Upgrade to Select
            </button>
            <button
              onClick={() => handleCheckout(PACKAGE_TO_PRICE.Business!)}
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
        <div
          className="space-y-2 text-sm text-[var(--text-primary)]"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href="/settings/profile"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-[var(--accent)]"
          >
            Edit Profile
          </a>
          <a
            href="/settings/subscription"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-[var(--accent)]"
          >
            Manage Subscription
          </a>
        </div>
      ),
    },
    {
      id: 'theme-settings',
      title: 'Theme',
      content: (
        <div
          className="space-y-2 text-sm text-[var(--text-primary)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Light */}
          <button
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
            className={cn(
              'group relative w-full px-3 py-1 rounded-xl flex items-center justify-between transition-colors',
              'ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/20',
              theme === 'light'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] ring-[var(--card-border)]'
                : 'bg-transparent text-[var(--text-primary)] ring-[var(--card-border)] hover:bg-[var(--surface-secondary)]'
            )}
          >
            {/* === единственная правка: добавлен свотч цвета + текст === */}
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-[var(--card-border)] bg-white"
              />
              <span>Classic Light</span>
            </span>
            <span
              className={cn(
                'text-[11px] transition-opacity',
                theme === 'light' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
              )}
            >
              ✓
            </span>
          </button>

          {/* Dark */}
          <button
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={cn(
              'group relative w-full px-3 py-1 rounded-xl flex items-center justify-between transition-colors',
              'ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/20',
              theme === 'dark'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] ring-[var(--card-border)]'
                : 'bg-transparent text-[var(--text-primary)] ring-[var(--card-border)] hover:bg-[var(--surface-secondary)]'
            )}
          >
            {/* === единственная правка: добавлен свотч цвета + текст === */}
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-[var(--card-border)] bg-neutral-900"
              />
              <span>Midnight Dark</span>
            </span>
            <span
              className={cn(
                'text-[11px] transition-opacity',
                theme === 'dark' ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
              )}
            >
              ✓
            </span>
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
        max-h-[calc(100vh-85px)]
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
            onClick={() => setActiveBox((prev) => (prev === box.id ? null : box.id))}
            onKeyDown={(e) => handleKeyToggle(e, box.id)}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            aria-controls={`${box.id}-content`}
            className={cn(
              'transition-all duration-300 cursor-pointer mb-4 rounded-xl border',
              !isActive && 'border-[var(--card-border)] bg-[var(--card-bg)] dark:backdrop-blur-md',
              isActive && 'border-[var(--accent)] dark:bg-[var(--card-bg)] dark:backdrop-blur-md',
              'hover:shadow-sm'
            )}
            style={{ WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div className="px-3 sm:px-4 py-3 flex justify-between items-center">
              {box.id === 'plan-box' ? (
                <PlanUsageProvider>
                  <PlanProgressFetcher refreshToken={refreshToken} />
                </PlanUsageProvider>
              ) : (
                <span className="text-sm font-medium text-[var(--text-primary)]">{box.title}</span>
              )}
              <span className="text-[var(--text-secondary)] text-xs">{isActive ? '▲' : '▼'}</span>
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
  const { plan, limits, used, hasReachedDailyLimit, limitResetAt } = useUserPlan(
    updatedAt + refreshToken
  );

  if (!plan)
    return <div className="text-xs text-[var(--text-secondary)]">Loading plan data...</div>;

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
