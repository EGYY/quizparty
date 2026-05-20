import { QuizCategory } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { request } from '@shared/api/tv';

const QUIZ_CACHE_TTL_MS = 60_000;

type QuizCacheEntry = {
  data: QuizDetail[];
  expiresAt: number;
};

const quizCache = new Map<string, QuizCacheEntry>();
const pendingQuizRequests = new Map<string, Promise<QuizDetail[]>>();

export function invalidateApprovedQuizzes(category?: QuizCategory): void {
  if (category == null) {
    quizCache.clear();
    pendingQuizRequests.clear();
    return;
  }
  const key = `approved:${category}`;
  quizCache.delete(key);
  pendingQuizRequests.delete(key);
}

export async function listApprovedQuizzes(
  category: QuizCategory,
): Promise<QuizDetail[]> {
  const key = `approved:${category}`;
  const cached = quizCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const pending = pendingQuizRequests.get(key);
  if (pending) return pending;

  const params =
    category === QuizCategory.ALL
      ? ''
      : `?category=${encodeURIComponent(category)}`;
  const promise = request<QuizDetail[]>(`/quizzes/approved${params}`)
    .then(data => {
      quizCache.set(key, {
        data,
        expiresAt: Date.now() + QUIZ_CACHE_TTL_MS,
      });
      return data;
    })
    .finally(() => pendingQuizRequests.delete(key));

  pendingQuizRequests.set(key, promise);
  return promise;
}
