'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getSidebarBoxes } from './sidebar-helper.data';
import { BoxData } from './types';
import SidebarBox from './SidebarBox';
import { useSidebar } from '@/app/context/SidebarContext';
import { useUserPlan } from '@/app/hooks/useUserPlan';
import { useInjectPrompt } from '@/app/hooks/useInjectPrompt';
import SavedProfileList from '@/app/components/SavedProfileList';

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

  const sidebarBoxes = useMemo<BoxData[]>(
    () =>
      getSidebarBoxes({
        plan,
        injectPrompt,
        isCdrMode,
        onSelectForCdr,
      }),
    [plan, injectPrompt, isCdrMode, onSelectForCdr]
  );

  const patchedBoxes = useMemo<BoxData[]>(
    () =>
      sidebarBoxes.map((b) =>
        b.id === 'saved-messages'
          ? {
              ...b,
              renderContent: (
                <SavedProfileList
                  key={`saved-${isCdrMode ? 'cdr' : 'normal'}`}
                  selectionMode={isCdrMode}
                  onSelectForCdr={isCdrMode ? onSelectForCdr : undefined}
                  showCreateBlockButton
                  preselectedIds={preselectedIds}
                />
              ),
            }
          : b
      ),
    [sidebarBoxes, isCdrMode, onSelectForCdr, preselectedIds]
  );

  // ⬇️ Событие открывает Saved только при активном CDRs
  useEffect(() => {
    const handler = () => {
      if (isCdrMode) setActiveBox('saved-messages');
    };
    window.addEventListener('sidebarHelper:openSaved', handler);
    return () => window.removeEventListener('sidebarHelper:openSaved', handler);
  }, [isCdrMode]);

  useEffect(() => {
    if (isCdrMode) setActiveBox('saved-messages');
  }, [isCdrMode]);

  // Закрытие по клику вне (зеркально правому, без регрессий с модалками)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!openSidebar.left) return;

      // если открыта модалка — не закрываем левый сайдбар этим кликом
      const hasOpenModal = !!document.querySelector(
        '[role="dialog"][aria-modal="true"], [data-modal="open"]'
      );
      if (hasOpenModal) return;

      const root = sidebarRef.current;
      if (!root) return;

      const path = (e as any).composedPath?.() as EventTarget[] | undefined;
      if (path && path.includes(root)) return;

      const el = e.target as Element | null;
      if (el?.closest?.('[data-sidebar="left"]')) return;
      if (el?.closest?.('[data-ignore-sidebar-close="true"]')) return;

      closeSidebar('left');
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [openSidebar.left, closeSidebar]);

  return (
    <aside
      ref={sidebarRef}
      data-sidebar="left"
      data-sidebar-root="left"
      className={`
        fixed top-14 sm:top-12 left-0
        w-full max-w-sm md:w-80
        text-[var(--text-primary)] z-[60]
        p-4
        transition-transform duration-500 ease-in-out
        ${openSidebar.left ? 'translate-x-0' : '-translate-x-full'}
        h-[calc(100vh-190px)]
        overflow-hidden
      `}
      style={{
        backgroundColor: 'var(--background)',
        boxShadow: 'none',
        border: 'none',
        isolation: 'isolate',
        contain: 'paint',
      }}
    >
      {/* Скролл-контейнер с mask-image — как в правом сайдбаре */}
      <div
        className="h-full overflow-y-auto no-scrollbar relative pb-8"
        data-ignore-sidebar-close="true"
        onPointerDownCapture={(e) => {
          e.stopPropagation();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 85%, transparent 100%)',
        }}
      >
        {patchedBoxes.map((box: BoxData) => (
          <SidebarBox
            key={box.id === 'saved-messages' ? `saved-${isCdrMode ? 'cdr' : 'normal'}` : box.id}
            box={box}
            isActive={activeBox === box.id}
            onToggle={() => setActiveBox((prev) => (prev === box.id ? null : box.id))}
          />
        ))}
      </div>
    </aside>
  );
}
