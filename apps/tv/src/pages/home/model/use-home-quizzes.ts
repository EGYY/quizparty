import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QuizCategory } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { fallbackQuizzes, listApprovedQuizzes } from '@entities/quiz';

function getFallbackQuizzes(category: QuizCategory) {
  const quizzes = fallbackQuizzes;
  return category === QuizCategory.ALL
    ? quizzes
    : quizzes.filter(quiz => quiz.category === category);
}

export function useHomeQuizzes() {
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.ALL);
  const [items, setItems] = useState<QuizDetail[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append') => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      if (mode === 'replace') {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(undefined);

      try {
        const response = await listApprovedQuizzes(category, pageToLoad);
        if (requestIdRef.current !== requestId) return;
        setItems(current =>
          mode === 'replace' ? response.items : [...current, ...response.items],
        );
        setPage(response.page);
        setHasMore(response.hasMore);
      } catch (caught) {
        if (requestIdRef.current !== requestId) return;
        setError(caught instanceof Error ? caught : new Error('Unknown error'));
        if (mode === 'replace') {
          setItems([]);
          setPage(1);
          setHasMore(false);
        }
      } finally {
        if (requestIdRef.current !== requestId) return;
        if (mode === 'replace') {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [category],
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    void loadPage(1, 'replace');
  }, [loadPage]);

  const refetch = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    void loadPage(1, 'replace');
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore || error) return;
    void loadPage(page + 1, 'append');
  }, [error, hasMore, isLoading, isLoadingMore, loadPage, page]);

  const visibleQuizzes = useMemo(
    () => (items?.length ? items : error ? getFallbackQuizzes(category) : []),
    [category, error, items],
  );

  const quizzes = useMemo(
    () => ({
      error,
      hasMore,
      isLoading,
      isLoadingMore,
      loadMore,
      refetch,
    }),
    [error, hasMore, isLoading, isLoadingMore, loadMore, refetch],
  );

  return { category, setCategory, quizzes, visibleQuizzes };
}
