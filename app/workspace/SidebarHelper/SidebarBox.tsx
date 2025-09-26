'use client';

import { BoxData } from './types';

interface SidebarBoxProps {
  box: BoxData;
  isActive: boolean;
  onToggle: () => void;
}

export default function SidebarBox({ box, isActive, onToggle }: SidebarBoxProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === 'Escape') && !box.locked) {
      onToggle();
    }
  };

  const disabled = box.locked;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      aria-label={`Toggle ${box.title}`}
      onClick={() => !disabled && onToggle()}
      onKeyDown={handleKeyDown}
      title={disabled ? 'Upgrade required to access this feature' : ''}
      className={`
        transition-all duration-300 mb-4 rounded-xl border
        ${
          isActive
            ? 'border-[var(--accent)] dark:bg-[var(--card-bg)] dark:backdrop-blur-md'
            : 'border-[var(--card-border)] bg-[var(--card-bg)] dark:backdrop-blur-md'
        }
        focus:outline-none focus-visible:ring focus-visible:ring-[var(--accent)]
        ${disabled ? 'opacity-50' : 'cursor-default'}
        ${!disabled ? 'cursor-pointer' : ''}
      `}
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* header */}
      <div className="px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--text-primary)]">{box.title}</span>
        <span className="text-[var(--text-secondary)] text-xs">{isActive ? '▲' : '▼'}</span>
      </div>

      {/* content */}
      {isActive && (
        <div
          className="px-4 pb-4 text-sm text-[var(--text-primary)]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {box.renderContent && <div className="mt-2">{box.renderContent}</div>}
        </div>
      )}
    </div>
  );
}
