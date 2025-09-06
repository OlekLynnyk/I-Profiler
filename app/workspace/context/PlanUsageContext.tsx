'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type PlanUsageContextType = {
  refreshUsage: () => void;
  updatedAt: number;
};

const PlanUsageContext = createContext<PlanUsageContextType | undefined>(undefined);

export const PlanUsageProvider = ({ children }: { children: React.ReactNode }) => {
  const [updatedAt, setUpdatedAt] = useState(Date.now());

  const refreshUsage = useCallback(() => {
    setUpdatedAt(Date.now());
  }, []);

  return (
    <PlanUsageContext.Provider value={{ refreshUsage, updatedAt }}>
      {children}
    </PlanUsageContext.Provider>
  );
};

export const usePlanUsage = (): PlanUsageContextType => {
  const context = useContext(PlanUsageContext);
  if (!context) {
    throw new Error('usePlanUsage must be used within a PlanUsageProvider');
  }
  return context;
};

// ✅ Добавь эту функцию
export function usageBump(delta: number = 1) {
  window.dispatchEvent(new CustomEvent('usage:inc', { detail: { delta } }));
}
