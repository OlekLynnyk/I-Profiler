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

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openSidebar.left &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar('left');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openSidebar.left, closeSidebar]);

  return (
    <aside
      ref={sidebarRef}
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
