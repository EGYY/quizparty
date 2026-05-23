import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Role } from '@quizparty/shared';
import { useAppStore } from '@shared/model/app-store';

export function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const currentUser = useAppStore((state) => state.currentUser);
  if (currentUser?.role !== Role.ADMIN) return <Navigate replace to="/admin" />;
  return children;
}
