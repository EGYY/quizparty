import { useId, useState } from 'react';
import { AdminSort, QuizCategory, QuizStatus, type ReviewQueueFilters } from '@quizparty/shared';

const DEFAULT_FILTERS: ReviewQueueFilters = {
  status: QuizStatus.PENDING_REVIEW,
  category: QuizCategory.ALL,
  tags: [],
  sort: AdminSort.NEWEST,
};

export function useReviewFilterState() {
  const [filters, setFilters] = useState<ReviewQueueFilters>(DEFAULT_FILTERS);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const filtersId = useId();
  const activeFilterCount = [
    filters.search?.trim(),
    filters.status && filters.status !== QuizStatus.PENDING_REVIEW,
    filters.category && filters.category !== QuizCategory.ALL,
  ].filter(Boolean).length;

  return {
    activeFilterCount,
    areFiltersOpen,
    filters,
    filtersId,
    setFilters,
    toggleFilters: () => setAreFiltersOpen((current) => !current),
    updateFilters: (patch: Partial<ReviewQueueFilters>) =>
      setFilters((current) => ({ ...current, ...patch })),
  };
}
