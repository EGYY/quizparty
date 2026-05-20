import { useMemo, useState } from 'react';
import { AdminSort, QuizCategory } from '@quizparty/shared';
import type { AdminQuizListFilters } from '@quizparty/shared';

export function useQuizFilters() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.ALL);
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<AdminSort>(AdminSort.NEWEST);

  const filters = useMemo<AdminQuizListFilters>(
    () => ({
      category,
      sort,
      tags: [],
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status ? { status: status as AdminQuizListFilters['status'] } : {}),
    }),
    [category, search, sort, status],
  );

  return {
    category,
    filters,
    search,
    setCategory,
    setSearch,
    setSort,
    setStatus,
    sort,
    status,
  };
}
