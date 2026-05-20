import type { AdminQuizList, AdminQuizListFilters } from '@quizparty/shared';
import { http } from '@shared/api/http';
import { cleanQuizListParams } from './params';

export async function listAdminQuizzes(
  filters: AdminQuizListFilters,
  signal?: AbortSignal,
): Promise<AdminQuizList> {
  const { data } = await http.get<AdminQuizList>('/admin/quizzes', {
    params: cleanQuizListParams(filters),
    ...(signal ? { signal } : {}),
  });
  return data;
}
