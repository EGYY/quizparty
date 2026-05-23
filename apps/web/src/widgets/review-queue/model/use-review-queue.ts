import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ReviewQueueFilters } from '@quizparty/shared';
import { getReviewQueue } from '@entities/quiz';
import { queryKeys } from '@shared/api';

export function useReviewQueue(filters: ReviewQueueFilters) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const review = useQuery({
    queryKey: queryKeys.review(filters),
    queryFn: ({ signal }) => getReviewQueue(filters, signal),
  });

  const selected = useMemo(
    () =>
      review.data?.items.find((item) => item.id === selectedId) ??
      review.data?.selectedQuiz ??
      review.data?.items[0],
    [review.data, selectedId],
  );

  return {
    review,
    selected,
    selectItem: setSelectedId,
  };
}
