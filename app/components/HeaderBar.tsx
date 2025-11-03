'use client';

import { useEffect, KeyboardEvent } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { Upload } from 'lucide-react';
import { useSidebar } from '@/app/context/SidebarContext';

interface HeaderBarProps {
  onLogout: () => void;
  onSaveProfiling: () => void;
  disableSaveProfiling?: boolean;
}

export default function HeaderBar({
  onLogout,
  onSaveProfiling,
  disableSaveProfiling,
}: HeaderBarProps) {
  const { session, isLoading } = useAuth();
  const { toggleSidebar, openSidebar, closeSidebar } = useSidebar();

  const handleHomeClick = () => {
    closeSidebar('left');
    closeSidebar('right');
    requestAnimationFrame(() => onLogout());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') handleHomeClick();
  };

  // ЛЕВАЯ панель
  const handleLeftPanelClick = () => {
    // гарантируем монтирование левой панели
    window.dispatchEvent(new Event('sidebarHelper:ensureMount'));

    const isMobile =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(max-width: 767px)').matches);

    // ✅ На мобильных: корректное открытие/закрытие
    if (isMobile) {
      // если уже открыт — просто закрываем
      if (openSidebar.left) {
        closeSidebar('left');
        return;
      }

      // если правый открыт — закрываем и чуть позже открываем левый
      if (openSidebar.right) {
        closeSidebar('right');
        setTimeout(() => toggleSidebar('left'), 50);
        return;
      }

      // если оба закрыты — просто открыть левый
      toggleSidebar('left');
      return;
    }

    // ✅ Десктоп — оставляем как было
    if (openSidebar.left) {
      closeSidebar('left');
      return;
    }

    if (openSidebar.right) {
      closeSidebar('right');
      requestAnimationFrame(() => toggleSidebar('left'));
    } else {
      toggleSidebar('left');
    }
  };

  // ПРАВАЯ панель
  const handleAccountPanelClick = () => {
    if (openSidebar.right) {
      // уже открыт — просто закрываем
      closeSidebar('right');
      return;
    }

    // надо открыть правый
    if (openSidebar.left) {
      // сначала закрываем левый, затем в следующий кадр открываем правый
      closeSidebar('left');
      requestAnimationFrame(() => toggleSidebar('right'));
    } else {
      toggleSidebar('right');
    }
  };

  useEffect(() => {
    console.log('SidebarContext changed →', openSidebar);
  }, [openSidebar]);

  if (isLoading || !session) return null;

  return (
    <div
      data-header-root
      className="fixed top-0 left-0 right-0 z-30 h-14 sm:h-12 px-2 sm:px-4 flex items-center justify-between gap-2 bg-[var(--background)]/80 backdrop-blur overflow-x-hidden whitespace-nowrap pointer-events-none"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundImage:
          'linear-gradient(90deg, transparent, var(--hairline, rgba(128,128,128,0.18)) 35%, var(--hairline, rgba(128,128,128,0.18)) 65%, transparent)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 1px',
        backgroundPosition: 'left bottom',
      }}
    >
      {/* Left buttons */}
      <div className="flex gap-2 items-center pointer-events-auto">
        <button
          data-sidebar="left"
          onClick={handleLeftPanelClick}
          className="tap-ok text-[var(--text-primary)] text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)]"
          type="button"
        >
          Resources Hub
        </button>

        <button
          className="hidden sm:flex items-center gap-1 text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)] opacity-50 pointer-events-none"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className="text-[var(--text-primary)]">More</span>
        </button>
      </div>

      {/* Center brand */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Go to home"
        onKeyDown={handleKeyDown}
        className="tap-ok text-sm sm:text-sm font-inter font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none focus-visible:ring focus-visible:ring-[var(--accent)] pointer-events-auto"
        onClick={handleHomeClick}
      >
        Home
      </div>

      {/* Right controls */}
      <div className="flex gap-2 items-center pointer-events-auto">
        <button
          id="ws-save-btn"
          onClick={onSaveProfiling}
          disabled={disableSaveProfiling}
          className={`tap-ok flex items-center gap-1 text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)] ${
            disableSaveProfiling ? 'opacity-50 pointer-events-none' : ''
          }`}
          type="button"
        >
          <Upload size={14} className="text-[var(--text-primary)]" />
          <span className="text-[var(--text-primary)]">Save</span>
        </button>

        <button
          data-sidebar="right"
          onClick={handleAccountPanelClick}
          className="tap-ok text-[var(--text-primary)] text-xs sm:text-sm font-inter px-3 py-1 rounded-md transition hover:bg-[var(--surface)]"
          type="button"
        >
          Account Panel
        </button>
      </div>
    </div>
  );
}
