'use client';

import { BoxData } from './types';

interface SidebarBoxProps {
  box: BoxData;
  isActive: boolean;
  onToggle: () => void;
}

export default function SidebarBox({ box, isActive, onToggle }: SidebarBoxProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      onToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      aria-label={`Toggle ${box.title}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`transition-all duration-300 cursor-pointer mb-4 rounded-xl border 
        ${isActive ? 'border-[var(--accent)]' : 'border-[var(--card-border)]'} 
        bg-transparent hover:bg-[var(--surface)] focus:outline-none focus-visible:ring focus-visible:ring-[var(--accent)]`}
    >
      {/* header */}
      <div className="px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {box.title}
        </span>
        <span className="text-[var(--text-secondary)] text-xs">
          {isActive ? '▲' : '▼'}
        </span>
      </div>

      {/* content */}
      {isActive && (
        <div className="px-4 pb-4 text-sm text-[var(--text-primary)]">
          {/* убираем лишние подписи */}
          {box.renderContent && (
            <div className="mt-2">
              {box.renderContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
