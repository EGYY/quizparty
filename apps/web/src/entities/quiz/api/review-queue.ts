import type { ReviewQueue, ReviewQueueFilters } from '@quizparty/shared';
import { http } from '@shared/api/http';
import { cleanQuizListParams } from './params';

export async function getReviewQueue(
  filters: ReviewQueueFilters,
  signal?: AbortSignal,
): Promise<ReviewQueue> {
  const { data } = await http.get<ReviewQueue>('/admin/review', {
    params: cleanQuizListParams(filters),
    ...(signal ? { signal } : {}),
  });
  return data;
}
