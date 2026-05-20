/**
 * Единая фабрика query-ключей. Вызов без аргументов даёт ключ-префикс для
 * invalidateQueries (матчит все варианты с фильтрами), с аргументом — точный
 * ключ для useQuery.
 */
export const queryKeys = {
  dashboard: () => ['dashboard'] as const,
  adminQuizzes: <TFilters extends object>(filters?: TFilters) =>
    filters ? (['admin-quizzes', filters] as const) : (['admin-quizzes'] as const),
  review: <TFilters extends object>(filters?: TFilters) =>
    filters ? (['review', filters] as const) : (['review'] as const),
  draft: (quizId?: string) => ['draft', quizId] as const,
};
