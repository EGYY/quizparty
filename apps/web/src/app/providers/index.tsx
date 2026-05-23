import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@shared/lib/query-client';
import { ErrorBoundary } from '@shared/ui/error-boundary';
import { ToastViewport } from '@shared/ui';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {children}
        <ToastViewport />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
