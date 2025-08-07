'use client';

import React from 'react';
import { logError } from '@/lib/logger'; // ← логгер ошибок

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    logError('Unhandled UI error in ErrorBoundary', error); // ← логируем
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 text-center">
          Oops! Something went wrong in LimitModal.
        </div>
      );
    }

    return this.props.children;
  }
}
