import { useMemo, useState } from 'react';
import { AdminSort, QuizCategory } from '@quizparty/shared';
import type { AdminQuizListFilters } from '@quizparty/shared';

export function useQuizFilters() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.ALL);
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<AdminSort>(AdminSort.NEWEST);
  const activeFilterCount = [
    search.trim(),
    category !== QuizCategory.ALL,
    Boolean(status),
    sort !== AdminSort.NEWEST,
  ].filter(Boolean).length;

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
    activeFilterCount,
    filters,
    resetFilters: () => {
      setSearch('');
      setCategory(QuizCategory.ALL);
      setStatus('');
      setSort(AdminSort.NEWEST);
    },
    search,
    setCategory,
    setSearch,
    setSort,
    setStatus,
    sort,
    status,
  };
}
