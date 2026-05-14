import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { refreshAdminSession } from '@shared/api/auth';
import { useAppStore } from '@shared/model/app-store';
import { PageStatus } from '@shared/ui/page-status';

export function AdminAuthGate() {
  const location = useLocation();
  const accessToken = useAppStore((state) => state.accessToken);
  const isAuthReady = useAppStore((state) => state.isAuthReady);
  const setAuthReady = useAppStore((state) => state.setAuthReady);
  const clearAuth = useAppStore((state) => state.clearAuth);

  useEffect(() => {
    if (accessToken) {
      setAuthReady(true);
      return;
    }

    let isMounted = true;
    setAuthReady(false);
    refreshAdminSession()
      .catch(() => {
        if (isMounted) clearAuth();
      })
      .finally(() => {
        if (isMounted) setAuthReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearAuth, setAuthReady]);

  if (!isAuthReady) return <PageStatus text="Проверяем сессию" />;

  if (!accessToken) {
    return <Navigate replace state={{ from: location.pathname }} to="/admin/login" />;
  }

  return <Outlet />;
}
