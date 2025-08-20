'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthProvider';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
