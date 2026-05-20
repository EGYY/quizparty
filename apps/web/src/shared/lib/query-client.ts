import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { describeRequestError } from '../api/request-error';
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
    onError: (error) => {
      const message = describeRequestError(error, 'Проверьте backend или повторите действие.');
      if (message) notifyError(message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const message = describeRequestError(error, 'Изменение не применилось. Попробуйте еще раз.');
      if (message) notifyError(message);
    },
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
