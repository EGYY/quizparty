import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Role } from '@quizparty/shared';
import { queryKeys } from '@shared/api';
import { useAppStore } from '@shared/model/app-store';
import { getDashboard } from '../api/dashboard';

export type DashboardStatTone = 'violet' | 'orange' | 'blue' | 'green' | 'red';

export type DashboardStat = {
  label: string;
  tone: DashboardStatTone;
  value: number;
};

export function useAdminDashboard() {
  const currentUser = useAppStore((state) => state.currentUser);
  const dashboard = useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: ({ signal }) => getDashboard(signal),
  });

  const isAdmin = currentUser?.role === Role.ADMIN;
  const stats = useMemo<DashboardStat[]>(() => {
    if (!dashboard.data) return [];

    return [
      { label: 'Всего', tone: 'violet', value: dashboard.data.stats.totalQuizzes },
      { label: 'На ревью', tone: 'orange', value: dashboard.data.stats.pendingReview },
      { label: 'Черновики', tone: 'blue', value: dashboard.data.stats.drafts },
      { label: 'Одобрено', tone: 'green', value: dashboard.data.stats.approved },
      { label: 'Отклонено', tone: 'red', value: dashboard.data.stats.rejected },
    ];
  }, [dashboard.data]);

  return {
    dashboard,
    isAdmin,
    stats,
  };
}
