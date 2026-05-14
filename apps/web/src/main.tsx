import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from '@app/App';
import { queryClient } from '@shared/lib/query-client';
import { ErrorBoundary } from '@shared/ui/error-boundary';
import { ToastViewport } from '@shared/ui/toast';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
        <ToastViewport />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
