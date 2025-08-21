'use client';

import React from 'react';
import { logError } from '@/lib/logger';

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

  static getDerivedStateFromError(_error: any) {
    // ❌ нельзя делать side effects тут!
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    logError('Unhandled UI error in ErrorBoundary', { error, errorInfo });
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
