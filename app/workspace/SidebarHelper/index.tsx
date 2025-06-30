// SidebarHelper/index.tsx
'use client';

import { useState } from 'react';
import { sidebarBoxes } from './sidebar-helper.data';
import { BoxData } from './types';
import SidebarBox from './SidebarBox';

export default function SidebarHelper({ onClose }: { onClose: () => void }) {
  const [activeBox, setActiveBox] = useState<string | null>(null);

  return (
    <aside className="fixed left-0 top-[48px] bottom-[160px] w-full max-w-sm md:w-80 bg-[var(--vanilla)] text-[var(--text-primary)] shadow-lg z-50 p-4 overflow-y-auto rounded-lg transition-colors duration-500 scroll-smooth">
      <button
        onClick={onClose}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg transition-colors duration-300 mb-4 focus:outline-none focus-visible:ring"
        aria-label="Close Sidebar"
      >
        ✕
      </button>

      {sidebarBoxes.map((box: BoxData) => (
        <SidebarBox
          key={box.id}
          box={box}
          isActive={activeBox === box.id}
          onToggle={() => setActiveBox(prev => (prev === box.id ? null : box.id))}
        />
      ))}
    </aside>
  );
}
