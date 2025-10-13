'use client';

import React, { useEffect, useRef, useState, type ReactNode, KeyboardEvent } from 'react';
import { useTheme } from 'next-themes';
import { useProfile } from '../hooks/useProfile';
import { PlanProgress } from '@/components/PlanProgress';
import { PackageType } from '@/types/plan';
import { useUserPlan } from '../hooks/useUserPlan';
// import { usePlanUsage, PlanUsageProvider } from '../workspace/context/PlanUsageContext'; // УДАЛЕНО
import { useSidebar } from '@/app/context/SidebarContext';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

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

/** простая проверка мобайла — ИДЕНТИЧНО левой панели (без регрессий) */
function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  const narrow = window.matchMedia?.('(max-width: 767px)')?.matches;
  return !!(coarse || narrow);
}

export default function Sidebar({ packageType, refreshToken }: SidebarProps) {
  const { profile } = useProfile();
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { openSidebar, closeSidebar } = useSidebar();

  useEffect(() => {
    if (!openSidebar.right) {
      setActiveBox(null); // свернуть все секции при закрытии правого сайдбара
    }
  }, [openSidebar.right]);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // === ДОБАВЛЕНО: локальный бамп для мгновенного обновления ===
  const [usageBump, setUsageBump] = useState(0);
  useEffect(() => {
    const onInc = (e: Event) => {
      const delta = (e as CustomEvent)?.detail?.delta ?? 1;
      setUsageBump((n) => n + delta);
    };
    window.addEventListener('usage:inc', onInc as EventListener);
    return () => window.removeEventListener('usage:inc', onInc as EventListener);
  }, []);
  // === КОНЕЦ ДОБАВЛЕНИЯ ===

  const supabase = createPagesBrowserClient();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleOpenPortal = async () => {
    try {
      setPortalLoading(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('❌ Portal fetch failed:', await res.text());
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) {
      console.error('❌ Portal error:', e);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleKeyToggle = (e: KeyboardEvent<HTMLDivElement>, boxId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveBox((prev) => (prev === boxId ? null : boxId));
    }
  };

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!openSidebar.right) return;

      const root = sidebarRef.current;
      if (!root) return;

      // 1) Надёжная проверка по пути события (работает до ре-рендера)
      const path = (e as any).composedPath?.() as EventTarget[] | undefined;
      if (path && path.includes(root)) return; // клик ВНУТРИ — не закрываем

      // 2) Подстраховка для любых вложенных элементов / порталов
      const el = e.target as Element | null;
      if (el && el.closest?.('[data-sidebar="right"]')) return; // тоже считаем «внутри»

      // 3) Всё остальное — ВНЕ сайдбара
      closeSidebar('right');
    };

    // capture=true и pointerdown — сработаем раньше любых stopPropagation и до коммитов React
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [openSidebar.right, closeSidebar]);

  // ── NEW: высота сайдбара на мобиле, чтобы не перекрывать композер (как слева)
  const [isMobile, setIsMobile] = useState(false);
  const [mobileHeights, setMobileHeights] = useState({
    header: 56, // fallback top-14
    composer: 140, // безопасный запас
  });

  useEffect(() => {
    setIsMobile(isMobileViewport());

    if (!isMobileViewport()) return;

    const headerEl = document.querySelector<HTMLElement>('[data-header-root]') || null;
    const composerEl = document.querySelector<HTMLElement>('[data-composer-root]') || null;

    const measure = () => {
      const hh = headerEl?.getBoundingClientRect().height ?? 56;
      const ch = composerEl?.getBoundingClientRect().height ?? 140;
      setMobileHeights({ header: Math.round(hh), composer: Math.round(ch) });
    };

    measure();

    const roHeader = headerEl ? new ResizeObserver(measure) : null;
    const roComposer = composerEl ? new ResizeObserver(measure) : null;
    roHeader?.observe(headerEl as Element);
    roComposer?.observe(composerEl as Element);

    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      roHeader?.disconnect();
      roComposer?.disconnect();
    };
  }, []);

  // высота для мобилы (иначе не задаём — десктоп не трогаем)
  const mobileHeight = isMobile
    ? `calc(100vh - ${mobileHeights.header + mobileHeights.composer}px - env(safe-area-inset-bottom, 0px))`
    : undefined;

  const boxes: SectionBox[] = [
    {
      id: 'plan-box',
      title: packageType,
      content: (
        // УБРАНО: <PlanUsageProvider>
        <div
          className="space-y-2 text-sm text-[var(--text-primary)]"
          onClick={(e) => e.stopPropagation()}
        >
          <MonthlyUsage refreshToken={refreshToken} usageBump={usageBump} />
          <button
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="text-xs bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-[var(--text-primary)] ring-1 ring-[var(--card-border)] rounded-xl px-3 py-1 w-full transition"
          >
            {portalLoading ? 'Opening…' : 'Update your plan'}
          </button>
        </div>
        // УБРАНО: </PlanUsageProvider>
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
      data-sidebar="right"
      onClick={(e) => e.stopPropagation()}
      className={`
        fixed right-0 top-12
        w-full max-w-sm md:w-80
        text-[var(--text-primary)]
        z-50
        p-4
        transition-transform duration-500 ease-in-out
        ${openSidebar.right ? 'translate-x-0' : 'translate-x-full'}
        h-[calc(100vh-190px)]
        overflow-hidden
      `}
      style={{
        backgroundColor: 'var(--background)',
        boxShadow: 'none',
        border: 'none',
        isolation: 'isolate',
        contain: 'paint',
        willChange: 'transform',
        // NEW: на мобиле высота под хедер+композер, чтобы ничего не перекрывалось
        height: mobileHeight,
      }}
    >
      <div
        className="h-full overflow-y-auto no-scrollbar relative pb-8"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
        }}
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
                'transition-all duration-300 cursor-pointer mb-4 rounded-xl border hover:shadow-sm',
                !isActive
                  ? 'border-[var(--card-border)] bg-[var(--card-bg)]'
                  : 'border-[var(--accent)] bg-[var(--card-bg)]'
              )}
            >
              <div className="px-3 sm:px-4 py-3 flex justify-between items-center">
                {box.id === 'plan-box' ? (
                  // УБРАНО оборачивание в <PlanUsageProvider>
                  <PlanProgressFetcher refreshToken={refreshToken} usageBump={usageBump} />
                ) : (
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {box.title}
                  </span>
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
      </div>
    </aside>
  );
}

function PlanProgressFetcher({
  refreshToken,
  usageBump,
}: {
  refreshToken: number;
  usageBump: number;
}) {
  const { plan, limits, used, hasReachedDailyLimit, limitResetAt } = useUserPlan(
    refreshToken + usageBump
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

function MonthlyUsage({ refreshToken, usageBump }: { refreshToken: number; usageBump: number }) {
  const { limits, usedMonthly } = useUserPlan(refreshToken + usageBump);

  return (
    <div className="text-xs bg-[var(--card-bg)] border border-[var(--card-border)] text-center text-[var(--text-primary)] px-3 py-1 rounded-xl w-full">
      Monthly usage: {usedMonthly}/{limits.monthlyGenerations}
    </div>
  );
}
