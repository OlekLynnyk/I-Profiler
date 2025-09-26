'use client';

import { useState, useEffect, useRef } from 'react';
import { getSidebarBoxes } from './sidebar-helper.data';
import { BoxData } from './types';
import SidebarBox from './SidebarBox';
import { useSidebar } from '@/app/context/SidebarContext';

export default function SidebarHelper() {
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const { openSidebar, closeSidebar } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarBoxes = getSidebarBoxes();

  useEffect(() => {
    const isInside = (e: Event) => {
      const root = sidebarRef.current;
      if (!root) return false;
      const path = (e as any).composedPath?.() as EventTarget[] | undefined;
      if (path) return path.includes(root);
      return root.contains(e.target as Node);
    };

    const onStart = (e: Event) => {
      if (!openSidebar.left) return;

      // ⛔️ Если открыт модальный диалог — не закрываем сайдбар этим кликом.
      const hasOpenModal = !!document.querySelector(
        '[role="dialog"][aria-modal="true"], [data-modal="open"]'
      );
      if (hasOpenModal) return;

      // ⬇️ Клик пришёл из модалки? Не трогаем левый сайдбар.
      const path = (e as any).composedPath?.() as EventTarget[] | undefined;
      if (path) {
        for (const n of path) {
          const el = n as Element;
          if (
            el instanceof Element &&
            el.closest?.('[role="dialog"][aria-modal="true"], [data-modal="open"]')
          ) {
            return;
          }
        }
      }

      if (isInside(e)) return;

      // подстраховка на случай вложенных/портальных элементов, помеченных атрибутом
      const el = e.target as Element | null;
      if (el && el.closest?.('[data-sidebar="left"]')) return;

      // всё остальное — снаружи
      closeSidebar('left');
    };

    // capture=true, чтобы сработать раньше stopPropagation; обрабатываем мышь и тач
    window.addEventListener('pointerdown', onStart, true);
    window.addEventListener('touchstart', onStart, true);
    return () => {
      window.removeEventListener('pointerdown', onStart, true);
      window.removeEventListener('touchstart', onStart, true);
    };
  }, [openSidebar.left, closeSidebar]);

  return (
    <aside
      ref={sidebarRef}
      data-sidebar="left"
      className={`
        fixed top-12
        w-full max-w-sm md:w-80
        text-[var(--text-primary)] z-50
        p-4
        transition-all duration-500 ease-in-out
        ${openSidebar.left ? 'left-0' : '-left-full'}
        max-h-[calc(100vh-85px)]
        overflow-y-auto
        no-scrollbar
      `}
      style={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
      }}
    >
      {sidebarBoxes.map((box: BoxData) => (
        <SidebarBox
          key={box.id}
          box={box}
          isActive={activeBox === box.id}
          onToggle={() => setActiveBox((prev) => (prev === box.id ? null : box.id))}
        />
      ))}
    </aside>
  );
}
