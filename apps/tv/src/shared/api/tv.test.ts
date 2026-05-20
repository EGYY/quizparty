import { HttpRequestError, request } from './tv';

jest.mock('@shared/config/env', () => ({
  API_BASE_URL: 'https://tv.test/api',
}));

const response = (status: number, body?: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(body == null ? '' : JSON.stringify(body)),
  }) as unknown as Response;

describe('tv request retry policy', () => {
  const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.useRealTimers();
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('does not retry 4xx responses even when retry is configured', async () => {
    fetchMock.mockResolvedValue(response(429));

    await expect(request('/limited', { retry: 2 })).rejects.toMatchObject({
      status: 429,
      url: 'https://tv.test/api/limited',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries 5xx responses and returns successful JSON', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response(200, { ok: true }));

    const result = request<{ ok: boolean }>('/status', { retry: 1 });
    await jest.advanceTimersByTimeAsync(450);

    await expect(result).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries network failures for idempotent requests', async () => {
    jest.useFakeTimers();
    fetchMock
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce(response(200, { ok: true }));

    const result = request<{ ok: boolean }>('/network', { retry: 1 });
    await jest.advanceTimersByTimeAsync(450);

    await expect(result).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry POST requests by default', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(request('/rooms', { method: 'POST' })).rejects.toThrow(
      'Network request failed',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the HTTP status on non-retriable failures', async () => {
    fetchMock.mockResolvedValue(response(400, { message: 'bad request' }));

    await expect(request('/bad', { retry: 2 })).rejects.toBeInstanceOf(
      HttpRequestError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
