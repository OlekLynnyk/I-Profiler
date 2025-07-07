'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type SidebarState = {
  left: boolean;
  right: boolean;
};

type SidebarContextType = {
  openSidebar: SidebarState;
  toggleSidebar: (side: 'left' | 'right') => void;
  closeSidebar: (side: 'left' | 'right') => void;
  closeAllSidebars: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [openSidebar, setOpenSidebar] = useState<SidebarState>({
    left: false,
    right: false,
  });

  const toggleSidebar = (side: 'left' | 'right') => {
    setOpenSidebar((prev) => ({
      ...prev,
      [side]: !prev[side],
    }));
  };

  const closeSidebar = (side: 'left' | 'right') => {
    setOpenSidebar((prev) => ({
      ...prev,
      [side]: false,
    }));
  };

  const closeAllSidebars = () => {
    setOpenSidebar({ left: false, right: false });
  };

  // Добавляем закрытие всех сайдбаров по Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllSidebars();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        openSidebar,
        toggleSidebar,
        closeSidebar,
        closeAllSidebars,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
