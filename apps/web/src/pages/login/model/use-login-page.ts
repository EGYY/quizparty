import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

export type AuthMode = 'login' | 'register';

export function useLoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const location = useLocation();

  const successTarget = useMemo(() => {
    if (
      typeof location.state === 'object' &&
      location.state &&
      'from' in location.state &&
      typeof location.state.from === 'string'
    ) {
      return location.state.from;
    }
    return '/admin';
  }, [location.state]);

  return {
    isRegisterMode: mode === 'register',
    mode,
    setMode,
    successTarget,
  };
}
