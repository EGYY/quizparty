import { QuizCategory } from '@quizparty/shared';
import type { ApprovedQuizList } from '@quizparty/shared';
import { request } from '@shared/api/tv';

const QUIZ_CACHE_TTL_MS = 60_000;
export const APPROVED_QUIZZES_PAGE_SIZE = 24;

type QuizCacheEntry = {
  data: ApprovedQuizList;
  expiresAt: number;
};

const quizCache = new Map<string, QuizCacheEntry>();
const pendingQuizRequests = new Map<string, Promise<ApprovedQuizList>>();

export function invalidateApprovedQuizzes(category?: QuizCategory): void {
  if (category == null) {
    quizCache.clear();
    pendingQuizRequests.clear();
    return;
  }
  const keyPrefix = `approved:${category}:`;
  for (const key of quizCache.keys()) {
    if (key.startsWith(keyPrefix)) quizCache.delete(key);
  }
  for (const key of pendingQuizRequests.keys()) {
    if (key.startsWith(keyPrefix)) pendingQuizRequests.delete(key);
  }
}

export async function listApprovedQuizzes(
  category: QuizCategory,
  page = 1,
  pageSize = APPROVED_QUIZZES_PAGE_SIZE,
): Promise<ApprovedQuizList> {
  const key = `approved:${category}:${page}:${pageSize}`;
  const cached = quizCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const pending = pendingQuizRequests.get(key);
  if (pending) return pending;

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (category !== QuizCategory.ALL) {
    params.set('category', category);
  }

  const promise = request<ApprovedQuizList>(
    `/quizzes/approved?${params.toString()}`,
  )
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
