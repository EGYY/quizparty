import { useMemo, useState } from 'react';
import { QuizCategory } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { fallbackQuizzes, listApprovedQuizzes } from '@entities/quiz';
import { useAsyncResource } from '@shared/lib/use-async-resource';

export function useHomeQuizzes() {
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.ALL);

  const quizzes = useAsyncResource(
    () => listApprovedQuizzes(category),
    [category],
  );

  // Memoized: prevents a new [] reference on every render while isLoading
  // flips, which would invalidate visibleQuizzes and cascade to QuizCarousel.
  const data = useMemo<QuizDetail[]>(
    () =>
      quizzes.data?.length
        ? quizzes.data
        : quizzes.error
          ? (fallbackQuizzes as QuizDetail[])
          : [],
    [quizzes.data, quizzes.error],
  );

  const visibleQuizzes = useMemo(
    () =>
      category === QuizCategory.ALL
        ? data
        : data.filter(q => q.category === category),
    [category, data],
  );

  return { category, setCategory, quizzes, visibleQuizzes };
}
