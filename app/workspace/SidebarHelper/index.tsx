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
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMobile(isMobileViewport());

    const headerEl = document.querySelector<HTMLElement>('[data-header-root]') || null;
    const composerEl = document.querySelector<HTMLElement>('[data-composer-root]') || null;

    const measure = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const headerBottom = Math.round(headerEl?.getBoundingClientRect().bottom ?? 56);
        const composerTop = composerEl
          ? Math.round(composerEl.getBoundingClientRect().top)
          : (() => {
              const vv = (window as any).visualViewport?.height;
              return Math.round(
                typeof vv === 'number'
                  ? vv
                  : document.documentElement?.clientHeight || window.innerHeight || 0
              );
            })();

        const available = Math.max(0, composerTop - headerBottom);
        setMaxHeight(`${available}px`);
      });
    };

    // первый замер
    measure();

    const roHeader = headerEl ? new ResizeObserver(measure) : null;
    const roComposer = composerEl ? new ResizeObserver(measure) : null;
    if (headerEl) roHeader?.observe(headerEl);
    if (composerEl) roComposer?.observe(composerEl);

    // реагируем на адресную строку/клавиатуру/ориентацию/скролл
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('orientationchange', measure, { passive: true });
    (window as any).visualViewport?.addEventListener('resize', measure, { passive: true });
    (window as any).visualViewport?.addEventListener('scroll', measure, { passive: true });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      (window as any).visualViewport?.removeEventListener('resize', measure);
      (window as any).visualViewport?.removeEventListener('scroll', measure);
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

  // УСТОЙЧИВОЕ «КЛИК-ВНЕ» ДЛЯ iOS: закрываем ПОСЛЕ клика по целевому элементу
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!openSidebar.left) return;

      // активная модалка — не закрываем глобально
      const hasOpenModal = !!document.querySelector(
        '[role="dialog"][aria-modal="true"], [data-modal="open"]'
      );
      if (hasOpenModal) return;

      const t = e.target as Element | null;

      // клики внутри левого сайдбара/служебных зон — игнорим
      if (
        t?.closest?.('[data-sidebar-root="left"]') ||
        t?.closest?.('[data-sidebar="left"]') ||
        t?.closest?.('[data-header-root]') ||
        t?.closest?.('[data-composer-root]') ||
        t?.closest?.('[data-ignore-sidebar-close="true"]')
      ) {
        return;
      }

      // Важно: закрываем ПОСЛЕ того, как таргет получил свой click (iOS)
      requestAnimationFrame(() => closeSidebar('left'));
    };

    // capture=true — чтобы гарантированно сработать после таргета, но до bubbling-обработчиков документа
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [openSidebar.left, closeSidebar]);

  return (
    <>
      {openSidebar.left && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-[55] bg-transparent"
          onPointerDown={(e) => {
            // важен 'pointerdown': гасим жест ДО клика, исключая ретаргетинг iOS
            e.preventDefault();
            e.stopPropagation();
            closeSidebar('left');
          }}
          // safety: дублируем на случай отсутствия pointer событий
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar('left');
          }}
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none' as any,
            WebkitUserSelect: 'none' as any,
          }}
        />
      )}

      <aside
        ref={sidebarRef}
        data-sidebar="left"
        data-sidebar-root="left"
        className={`
        fixed top-12 left-0
        w-[82.000vw] md:w-80
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
          height: 'auto',
          maxHeight: maxHeight, // <- точный «зазор» между header и composer
        }}
      >
        <div
          className="overflow-y-auto overflow-x-hidden no-scrollbar relative pb-8 scroll-stable"
          data-ignore-sidebar-close="true"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={
            isMobile
              ? { scrollbarGutter: 'stable both-edges', maxHeight: 'inherit' }
              : {
                  scrollbarGutter: 'stable both-edges',
                  maxHeight: 'inherit',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, #000 0%, #000 86%, rgba(0,0,0,0) 100%)',
                  maskImage: 'linear-gradient(to bottom, #000 0%, #000 86%, rgba(0,0,0,0) 100%)',
                }
          }
        >
          {sidebarBoxes.map((box: BoxData) => (
            <SidebarBox
              key={box.id}
              box={{
                ...box,
                renderContent:
                  box.id === 'saved-messages' ? savedMessagesContent : box.renderContent,
              }}
              isActive={activeBox === box.id}
              onToggle={() => setActiveBox((prev) => (prev === box.id ? null : box.id))}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
