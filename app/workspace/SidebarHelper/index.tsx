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

  // ---- измерение и потолок высоты (мобайл + десктоп)
  const [isMobile, setIsMobile] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMobile(isMobileViewport());

    const headerEl = document.querySelector<HTMLElement>('[data-header-root]') || null;
    const composerEl = document.querySelector<HTMLElement>('[data-composer-root]') || null;

    const measure = () => {
      const hh = headerEl?.getBoundingClientRect().height ?? 56;
      const ch = composerEl?.getBoundingClientRect().height ?? 140;
      setMaxHeight(`calc(100vh - ${Math.round(hh + ch)}px - env(safe-area-inset-bottom, 0px))`);
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

  // УСТОЙЧИВОЕ «КЛИК-ВНЕ» (iOS Safari/Chrome): pointerdown + touchstart + mousedown (capture)
  useEffect(() => {
    const onStart = (e: Event) => {
      if ((e as any).defaultPrevented) return;

      const pe = e as PointerEvent;
      if ('button' in pe && pe.button !== 0) return; // только ЛКМ/тап
      if (window.getSelection?.()?.toString()) return; // при выделении не закрываем
      if (!openSidebar.left) return;

      const hasOpenModal = !!document.querySelector(
        '[role="dialog"][aria-modal="true"], [data-modal="open"]'
      );
      if (hasOpenModal) return;

      const targetEl = e.target as Element | null;
      if (!targetEl) return;

      // внутри левого сайдбара или его триггеров — не закрываем
      if (
        targetEl.closest('[data-sidebar-root="left"]') ||
        targetEl.closest('[data-sidebar="left"]')
      ) {
        return;
      }

      if (targetEl.closest('[data-header-root]') || targetEl.closest('[data-composer-root]')) {
        return;
      }

      if (targetEl.closest('[data-ignore-sidebar-close="true"]')) return;

      closeSidebar('left');
    };

    window.addEventListener('pointerdown', onStart, true);
    window.addEventListener('touchstart', onStart as EventListener, true);
    window.addEventListener('mousedown', onStart as EventListener, true);

    return () => {
      window.removeEventListener('pointerdown', onStart, true);
      window.removeEventListener('touchstart', onStart as EventListener, true);
      window.removeEventListener('mousedown', onStart as EventListener, true);
    };
  }, [openSidebar.left, closeSidebar]);

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
        overflow-hidden
      `}
      style={{
        backgroundColor: 'var(--background)',
        boxShadow: 'none',
        border: 'none',
        // ⚠️ убрали isolation: 'isolate' — на iOS иногда ломает hit-test
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)', // сглаживание
        // авто-рост + потолок, чтобы не перекрывать композер/инпуты
        height: 'auto',
        maxHeight: maxHeight,
      }}
    >
      <div
        className="overflow-y-auto overflow-x-hidden no-scrollbar relative pb-8 scroll-stable"
        data-ignore-sidebar-close="true"
        onPointerDown={(e) => e.stopPropagation()}
        style={
          isMobile
            ? { scrollbarGutter: 'stable both-edges', maxHeight: 'inherit' }
            : {
                scrollbarGutter: 'stable both-edges',
                WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
                maxHeight: 'inherit',
              }
        }
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
