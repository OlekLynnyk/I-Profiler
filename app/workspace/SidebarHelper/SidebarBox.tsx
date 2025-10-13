'use client';

import { BoxData } from './types';
import { FolderPlus, FilePlus } from 'lucide-react';
import React, { useId } from 'react';

interface SidebarBoxProps {
  box: BoxData;
  isActive: boolean;
  onToggle: () => void;
  /** Если переданы children — они имеют приоритет над box.renderContent */
  children?: React.ReactNode;
}

export default function SidebarBox({ box, isActive, onToggle, children }: SidebarBoxProps) {
  const panelId = useId(); // для aria-controls
  const disabled = box.locked;
  const hasContent = typeof children !== 'undefined' ? !!children : !!box.renderContent;

  const handleKeyDownHeader = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onToggle();
    }
    if (e.key === 'Escape' && !disabled) onToggle();
  };

  return (
    <div
      aria-expanded={isActive}
      aria-label={`Toggle ${box.title}`}
      title={disabled ? 'Upgrade required to access this feature' : ''}
      className={`
        transition-[opacity,transform] duration-300 mb-4 rounded-xl border
        ${isActive ? 'border-[var(--accent)] bg-[var(--card-bg)]' : 'border-[var(--card-border)] bg-[var(--card-bg)]'}
        focus:outline-none focus-visible:ring focus-visible:ring-[var(--accent)]
        ${disabled ? 'opacity-50' : 'cursor-default'}
      `}
    >
      {/* header — тумблер */}
      <div
        className="px-4 py-3 flex justify-between items-center cursor-pointer select-none"
        role="button"
        tabIndex={0}
        aria-controls={panelId}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && onToggle()}
        onKeyDown={handleKeyDownHeader}
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">{box.title}</span>

        {/* правый блок хедера */}
        <div className="flex items-center gap-px">
          {/* Saved messages: Create block */}
          {box.id === 'saved-messages' && isActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new Event('savedMessages:createBlock'));
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--button-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover-bg)] appearance-none border-0 hover:ring-1 hover:ring-[var(--card-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:bg-[var(--card-bg)] transition"
              aria-label="Create block"
              title="Create block"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          )}

          {/* Templates: файл → папка */}
          {box.id === 'templates' && isActive && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new Event('templates:createTemplate'));
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--button-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover-bg)] appearance-none border-0 hover:ring-1 hover:ring-[var(--card-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:bg-[var(--card-bg)] transition"
                aria-label="Create template"
                title="Create template"
              >
                <FilePlus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new Event('templates:createFolder'));
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--button-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover-bg)] appearance-none border-0 hover:ring-1 hover:ring-[var(--card-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:bg-[var(--card-bg)] transition"
                aria-label="Create block"
                title="Create block"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </>
          )}

          <span className="text-[var(--text-secondary)] text-xs">{isActive ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* content */}
      {isActive && hasContent && (
        <div
          id={panelId}
          role="region"
          aria-label={`${box.title} content`}
          data-ignore-sidebar-close="true"
          className="px-4 pb-4 text-sm text-[var(--text-primary)]"
          // гасим всю цепочку для pointer/touch, чтобы не улетало в глобальный capture
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="mt-2">
            {typeof children !== 'undefined' ? children : box.renderContent}
          </div>
        </div>
      )}
    </div>
  );
}
