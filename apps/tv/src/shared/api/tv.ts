import { API_BASE_URL } from '@shared/config/env';

type FetchOptions = RequestInit & {
  retry?: number;
  timeoutMs?: number;
};

export class HttpRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

export class HttpTimeoutError extends Error {
  constructor(
    readonly timeoutMs: number,
    readonly url: string,
  ) {
    super(`Request timed out after ${timeoutMs}ms (${url})`);
    this.name = 'HttpTimeoutError';
  }
}

export class HttpAbortError extends Error {
  constructor(readonly url: string) {
    super(`Request aborted (${url})`);
    this.name = 'HttpAbortError';
  }
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof HttpAbortError) return false;
  if (error instanceof SyntaxError) return false;
  if (!(error instanceof HttpRequestError)) return true;
  return error.status >= 500;
}

function getRetryCount(options: FetchOptions): number {
  if (typeof options.retry === 'number') return options.retry;
  const method = (options.method ?? 'GET').toUpperCase();
  return method === 'GET' || method === 'HEAD' ? 2 : 0;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

export async function request<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const retry = getRetryCount(options);
  const timeoutMs = options.timeoutMs ?? 8000;
  const { retry: _retry, timeoutMs: _timeoutMs, ...requestOptions } = options;
  let lastError: unknown;
  const url = `${API_BASE_URL}${path}`;
  const externalSignal = requestOptions.signal;

  for (let attempt = 0; attempt <= retry; attempt += 1) {
    const controller = new AbortController();
    let didTimeout = false;
    let didExternalAbort = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);
    const handleExternalAbort = () => {
      didExternalAbort = true;
      controller.abort();
    };

    if (externalSignal?.aborted) throw new HttpAbortError(url);
    externalSignal?.addEventListener('abort', handleExternalAbort, {
      once: true,
    });

    try {
      const headers = new Headers(requestOptions.headers);
      if (requestOptions.body != null && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...requestOptions,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new HttpRequestError(
          `Request failed: ${response.status} (${url})`,
          response.status,
          url,
        );
      }

      const body = await response.text();
      return (body ? JSON.parse(body) : undefined) as T;
    } catch (error) {
      const requestError = didExternalAbort
        ? new HttpAbortError(url)
        : didTimeout
          ? new HttpTimeoutError(timeoutMs, url)
          : error;
      lastError = requestError;
      if (attempt === retry || !shouldRetry(requestError)) break;
      await delay(450 * (attempt + 1));
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', handleExternalAbort);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Network request failed (${url})`);
}
