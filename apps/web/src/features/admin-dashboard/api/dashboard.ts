import type { AdminDashboard } from '@quizparty/shared';
import { http } from '@shared/api/http';

export async function getDashboard(signal?: AbortSignal): Promise<AdminDashboard> {
  const { data } = await http.get<AdminDashboard>(
    '/admin/dashboard',
    signal ? { signal } : undefined,
  );
  return data;
}
