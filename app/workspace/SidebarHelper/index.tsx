'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getSidebarBoxes } from './sidebar-helper.data';
import { BoxData } from './types';
import SidebarBox from './SidebarBox';
import { useSidebar } from '@/app/context/SidebarContext';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
  const narrow = window.matchMedia?.('(max-width: 767px)')?.matches;
  return !!(coarse || narrow);
}

export default function SidebarHelper({
  isCdrMode = false,
  onSelectForCdr,
  preselectedIds,
}: {
  isCdrMode?: boolean;
  onSelectForCdr?: (p: any) => void;
  preselectedIds?: string[];
}) {
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const { openSidebar, closeSidebar } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { plan } = useUserPlan();
  const injectPrompt = useInjectPrompt();

  // ---- мобильные настройки высоты (десктоп не трогаем)
  const [isMobile, setIsMobile] = useState(false);
  const [mobileHeights, setMobileHeights] = useState({ header: 56, composer: 140 });

  useEffect(() => {
    const mobile = isMobileViewport();
    setIsMobile(mobile);
    if (!mobile) return;

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
    if (headerEl) roHeader?.observe(headerEl);
    if (composerEl) roComposer?.observe(composerEl);

    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      roHeader?.disconnect();
      roComposer?.disconnect();
    };
  }, []);

  // ⚠️ injectPrompt не кладём в deps — предотвращаем лишние ремоунты
  const sidebarBoxes = useMemo<BoxData[]>(
    () =>
      getSidebarBoxes({
        plan,
        injectPrompt, // контракт сохраняем
        isCdrMode,
        onSelectForCdr,
      }),
    [plan, isCdrMode, onSelectForCdr]
  );

  // Стабильный контент для Saved
  const savedMessagesContent = useMemo(
    () => (
      <SavedProfileList
        key={`saved-${isCdrMode ? 'cdr' : 'normal'}`}
        selectionMode={isCdrMode}
        onSelectForCdr={isCdrMode ? onSelectForCdr : undefined}
        showCreateBlockButton
        preselectedIds={preselectedIds}
      />
    ),
    [isCdrMode, onSelectForCdr, preselectedIds]
  );

  useEffect(() => {
    const handler = () => setActiveBox('saved-messages');
    window.addEventListener('sidebarHelper:openSaved', handler);
    return () => window.removeEventListener('sidebarHelper:openSaved', handler);
  }, []);

  useEffect(() => {
    if (isCdrMode) setActiveBox('saved-messages');
  }, [isCdrMode]);

  useEffect(() => {
    const onStart = (e: Event) => {
      if ((e as any).defaultPrevented) return;

      const pe = e as PointerEvent;
      if ('button' in pe && pe.button !== 0) return;
      if (window.getSelection?.()?.toString()) return;
      if (!openSidebar.left) return;

      const hasOpenModal = !!document.querySelector(
        '[role="dialog"][aria-modal="true"], [data-modal="open"]'
      );
      if (hasOpenModal) return;

      const targetEl = e.target as Element | null;
      if (!targetEl) return;

      if (
        targetEl.closest('[data-sidebar-root="left"]') ||
        targetEl.closest('[data-sidebar="left"]')
      ) {
        return;
      }

      if (targetEl.closest('[data-ignore-sidebar-close="true"]')) return;

      closeSidebar('left');
    };

    window.addEventListener('pointerdown', onStart, true);
    return () => {
      window.removeEventListener('pointerdown', onStart, true);
    };
  }, [openSidebar.left, closeSidebar]);

  // высота только для мобилы — десктоп управляется классом
  const mobileHeight = isMobile
    ? `calc(100vh - ${mobileHeights.header + mobileHeights.composer}px - env(safe-area-inset-bottom, 0px))`
    : undefined;

  return (
    <aside
      ref={sidebarRef}
      data-sidebar="left"
      data-sidebar-root="left"
      className={`
        fixed top-12 left-0
        w-full max-w-sm md:w-80
        text-[var(--text-primary)] z-[60]
        p-4
        transition-transform duration-500 ease-in-out
        ${openSidebar.left ? 'translate-x-0' : '-translate-x-full'}
        h-[calc(100vh-190px)]   /* ⬅️ десктоп-высота как у правого сайдбара */
        overflow-hidden
      `}
      style={{
        backgroundColor: 'var(--background)',
        boxShadow: 'none',
        border: 'none',
        isolation: 'isolate',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)', // сглаживаем субпиксельные рывки
        // На мобиле перекрываем высоту, на десктопе — undefined, значит действует класс
        height: mobileHeight,
      }}
    >
      <div
        className="h-full overflow-y-auto overflow-x-hidden no-scrollbar relative pb-8"
        data-ignore-sidebar-close="true"
        onPointerDown={(e) => e.stopPropagation()}
        // ⬇️ возвращаем нижний fade/тень 1-в-1 как справа
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
        }}
      >
        {sidebarBoxes.map((box: BoxData) => (
          <SidebarBox
            key={box.id}
            box={{
              ...box,
              renderContent: box.id === 'saved-messages' ? savedMessagesContent : box.renderContent,
            }}
            isActive={activeBox === box.id}
            onToggle={() => setActiveBox((prev) => (prev === box.id ? null : box.id))}
          />
        ))}
      </div>
    </aside>
  );
}
