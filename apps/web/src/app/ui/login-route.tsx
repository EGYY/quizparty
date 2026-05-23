import { lazy, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { refreshAdminSession } from '@shared/api/auth';
import { useAppStore } from '@shared/model/app-store';
import { PageStatus } from '@shared/ui';

const LoginPage = lazy(() => import('@pages/login'));

export function LoginRoute() {
  const accessToken = useAppStore((state) => state.accessToken);
  const isAuthReady = useAppStore((state) => state.isAuthReady);
  const setAuthReady = useAppStore((state) => state.setAuthReady);
  const clearAuth = useAppStore((state) => state.clearAuth);

  useEffect(() => {
    if (accessToken || isAuthReady) return;

    let isMounted = true;
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
  }, [accessToken, clearAuth, isAuthReady, setAuthReady]);

  if (!accessToken && !isAuthReady) return <PageStatus text="Проверяем сессию" />;
  if (accessToken) return <Navigate replace to="/admin" />;
  return <LoginPage />;
}
