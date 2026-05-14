import { useCallback, useEffect, useRef, useState } from 'react';

type AsyncState<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export function useAsyncResource<T>(
  factory: () => Promise<T>,
  deps: unknown[],
): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);
  const refreshToken = useRef(0);
  const [reload, forceRefresh] = useState(0);

  const refetch = useCallback(() => {
    refreshToken.current += 1;
    forceRefresh(refreshToken.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(undefined);

    factory()
      .then(nextData => {
        if (!cancelled) setData(nextData);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught : new Error('Unknown error'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reload, ...deps]);

  return { data, error, isLoading, refetch };
}
