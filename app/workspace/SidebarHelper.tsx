'use client';

import { useState } from 'react';

// Встроенная утилита cn
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

type BoxData = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

const boxes: BoxData[] = [
  {
    id: 'hidden-command',
    title: 'For Leaders & CEO',
    description:
      'A hidden command is a subtle, subconscious prompt embedded in communication that encourages action without overt instruction, guiding users to engage naturally.',
  },
  {
    id: 'deal-keywords',
    title: 'Human Resource Professionals (HR)',
  },
  {
    id: 'profiling-library',
    title: 'Library',
  },
  {
    id: 'general-use',
    title: 'General Use',
  },
];

export default function SidebarHelper({ onClose }: { onClose: () => void }) {
  const [activeBox, setActiveBox] = useState<string | null>(null);

  return (
    <aside className="fixed left-0 top-0 h-screen w-80 bg-[#FDFCF9] text-black shadow-lg z-50 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Assistant Hub</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black text-lg"
        >
          ✕
        </button>
      </div>

      {boxes.map((box) => {
        const isActive = activeBox === box.id;

        return (
          <div
            key={box.id}
            onClick={() =>
              setActiveBox((prev) => (prev === box.id ? null : box.id))
            }
            className={cn(
              'transition-all duration-300 ease-in-out cursor-pointer mb-4 rounded-xl overflow-hidden border',
              isActive ? 'border-[#C084FC] h-72' : 'border-gray-300 h-28',
              'hover:shadow-md'
            )}
          >
            <div className="flex h-full">
              <div className="w-full p-3 flex items-center text-sm text-gray-800 font-medium">
                {box.title}
              </div>
            </div>

            {isActive && (
              <div className="p-3 text-xs text-gray-700 bg-gray-50 border-t border-gray-200">
                <p className="mb-2 font-medium">📌 {box.title}</p>
                <p>{box.description || 'Content coming soon...'}</p>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}