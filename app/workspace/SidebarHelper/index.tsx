'use client';

import { useState } from 'react';
import { sidebarBoxes } from './sidebar-helper.data';
import { BoxData } from './types';
import SidebarBox from './SidebarBox';
import { useSidebar } from '@/app/context/SidebarContext';

export default function SidebarHelper() {
  const [activeBox, setActiveBox] = useState<string | null>(null);
  const { openSidebar } = useSidebar();

  console.log('SidebarHelper render → openSidebar.left:', openSidebar.left);

  return (
    <aside
      className={`
        fixed top-12 bottom-0
        w-full max-w-sm md:w-80
        text-[var(--text-primary)] z-50
        p-4 overflow-y-auto transition-all duration-500 ease-in-out
        ${openSidebar.left ? 'left-0' : '-left-full'}
      `}
      style={{
        backgroundColor: 'var(--background)',
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
