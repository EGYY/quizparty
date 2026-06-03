import { useEffect, useState } from 'react';

type ClockSync = {
  localStartedAt: number;
  serverStartedAt: number | undefined;
};

export function countdownSeconds(
  targetMs: number,
  localNow: number,
  sync: ClockSync,
): number {
  const syncedNow =
    typeof sync.serverStartedAt === 'number'
      ? sync.serverStartedAt + (localNow - sync.localStartedAt)
      : localNow;

  return Math.max(0, Math.ceil((targetMs - syncedNow) / 1000));
}

export function useCountdown(
  targetMs: number | undefined,
  serverTimeMs?: number,
): number | undefined {
  const [localNow, setLocalNow] = useState(Date.now());
  const [sync, setSync] = useState<ClockSync>(() => ({
    localStartedAt: Date.now(),
    serverStartedAt: serverTimeMs,
  }));

  useEffect(() => {
    if (!targetMs) return undefined;

    const startedAt = Date.now();
    setLocalNow(startedAt);
    setSync({
      localStartedAt: startedAt,
      serverStartedAt: serverTimeMs,
    });

    const timer = setInterval(() => setLocalNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [targetMs, serverTimeMs]);

  if (!targetMs) return undefined;
  return countdownSeconds(targetMs, localNow, sync);
}
