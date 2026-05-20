import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshAdminSession } from './auth';
import { http } from './http';

vi.mock('./auth', () => ({ refreshAdminSession: vi.fn() }));

const mockedRefresh = vi.mocked(refreshAdminSession);

// Адаптер: исходный запрос → 401, повторный (после refresh, с _retry) → 200.
function installAdapter() {
  http.defaults.adapter = (config: InternalAxiosRequestConfig) => {
    const retried = (config as { _retry?: boolean })._retry === true;
    if (!retried) {
      return Promise.reject(
        new axios.AxiosError('unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config,
        }),
      );
    }
    return Promise.resolve({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as unknown as AxiosResponse);
  };
}

describe('http refresh interceptor', () => {
  beforeEach(() => {
    mockedRefresh.mockReset();
    mockedRefresh.mockResolvedValue({
      accessToken: 'newtoken',
    } as unknown as Awaited<ReturnType<typeof refreshAdminSession>>);
    installAdapter();
  });

  it('refreshes the session on 401 and retries the original request', async () => {
    const response = await http.get('/protected');

    expect(response.data).toEqual({ ok: true });
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent 401s into a single refresh (single-flight)', async () => {
    const [a, b] = await Promise.all([http.get('/a'), http.get('/b')]);

    expect(a.data).toEqual({ ok: true });
    expect(b.data).toEqual({ ok: true });
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
  });
});
