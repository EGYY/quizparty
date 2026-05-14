import { useEffect, useState } from 'react';

export function useCountdown(targetMs: number | undefined): number | undefined {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetMs) return undefined;

    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [targetMs]);

  if (!targetMs) return undefined;
  return Math.max(0, Math.ceil((targetMs - now) / 1000));
}
