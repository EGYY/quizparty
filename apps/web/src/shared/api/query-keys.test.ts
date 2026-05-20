import { AdminSort, QuizCategory } from '@quizparty/shared';
import type { AdminQuizListFilters, ReviewQueueFilters } from '@quizparty/shared';
import { describe, expect, it } from 'vitest';
import { queryKeys } from './query-keys';

const adminFilters: AdminQuizListFilters = {
  category: QuizCategory.ALL,
  sort: AdminSort.NEWEST,
  tags: [],
};

const reviewFilters: ReviewQueueFilters = {
  category: QuizCategory.ALL,
  sort: AdminSort.NEWEST,
  tags: [],
};

describe('queryKeys', () => {
  it('dashboard key is stable', () => {
    expect(queryKeys.dashboard()).toEqual(['dashboard']);
  });

  it('adminQuizzes returns a full key with filters and a prefix without', () => {
    expect(queryKeys.adminQuizzes(adminFilters)).toEqual(['admin-quizzes', adminFilters]);
    expect(queryKeys.adminQuizzes()).toEqual(['admin-quizzes']);
  });

  it('review returns a full key with filters and a prefix without', () => {
    expect(queryKeys.review(reviewFilters)).toEqual(['review', reviewFilters]);
    expect(queryKeys.review()).toEqual(['review']);
  });

  it('the prefix key is a prefix of the filtered key (invalidation contract)', () => {
    const prefix = queryKeys.adminQuizzes();
    const full = queryKeys.adminQuizzes(adminFilters);
    expect(full.slice(0, prefix.length)).toEqual(prefix);
  });

  it('draft key carries the quiz id', () => {
    expect(queryKeys.draft('quiz-1')).toEqual(['draft', 'quiz-1']);
    expect(queryKeys.draft()).toEqual(['draft', undefined]);
  });
});
