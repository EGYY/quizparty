import { useQuery } from '@tanstack/react-query';
import { listAdminQuizzes } from '@entities/quiz';
import { useQuizFilters } from '@features/filter-quizzes';
import { queryKeys } from '@shared/api';

export function useAdminQuizzes() {
  const quizFilters = useQuizFilters();
  const quizzes = useQuery({
    queryKey: queryKeys.adminQuizzes(quizFilters.filters),
    queryFn: ({ signal }) => listAdminQuizzes(quizFilters.filters, signal),
  });

  return {
    quizFilters,
    quizzes,
  };
}
