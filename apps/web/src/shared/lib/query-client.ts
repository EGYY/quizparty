import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { useToastStore } from '../ui/toast';

const notifyError = (message: string) => {
  useToastStore.getState().notify({
    tone: 'error',
    title: 'Ошибка запроса',
    message,
  });
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => notifyError('Проверьте backend или повторите действие.'),
  }),
  mutationCache: new MutationCache({
    onError: () => notifyError('Изменение не применилось. Попробуйте еще раз.'),
  }),
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount) => failureCount < 2,
      retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 4_000),
      staleTime: 30 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});
