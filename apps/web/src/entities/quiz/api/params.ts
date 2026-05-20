import { QuizCategory } from '@quizparty/shared';

export const cleanQuizListParams = <
  T extends { category?: QuizCategory | undefined; tags?: string[] | undefined },
>(
  filters: T,
) => ({
  ...filters,
  category: filters.category === QuizCategory.ALL ? undefined : filters.category,
  tags: filters.tags?.length ? filters.tags : undefined,
});
