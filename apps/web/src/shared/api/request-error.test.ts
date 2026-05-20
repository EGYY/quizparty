import axios, { type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { describeRequestError } from './request-error';

const FALLBACK = 'fallback';

function axiosErrorWithStatus(status: number, data?: unknown) {
  return new axios.AxiosError('boom', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: {} },
  } as unknown as AxiosResponse);
}

describe('describeRequestError', () => {
  it('returns undefined for cancelled requests (no toast)', () => {
    expect(describeRequestError(new axios.CanceledError(), FALLBACK)).toBeUndefined();
  });

  it('reports a connectivity message when there is no response', () => {
    const networkError = new axios.AxiosError('Network Error', 'ERR_NETWORK');
    expect(describeRequestError(networkError, FALLBACK)).toBe(
      'Нет связи с сервером. Проверьте подключение.',
    );
  });

  it('maps known HTTP statuses to specific messages', () => {
    expect(describeRequestError(axiosErrorWithStatus(401), FALLBACK)).toBe(
      'Сессия истекла. Войдите снова.',
    );
    expect(describeRequestError(axiosErrorWithStatus(403), FALLBACK)).toBe(
      'Недостаточно прав для этого действия.',
    );
    expect(describeRequestError(axiosErrorWithStatus(404), FALLBACK)).toBe(
      'Запрашиваемые данные не найдены.',
    );
    expect(describeRequestError(axiosErrorWithStatus(503), FALLBACK)).toBe(
      'Ошибка сервера. Попробуйте позже.',
    );
  });

  it('uses the server-provided message for other 4xx responses', () => {
    const error = axiosErrorWithStatus(422, { message: 'Поле обязательно' });
    expect(describeRequestError(error, FALLBACK)).toBe('Поле обязательно');
  });

  it('falls back when a 4xx has no usable server message', () => {
    expect(describeRequestError(axiosErrorWithStatus(400, {}), FALLBACK)).toBe(FALLBACK);
  });

  it('falls back for non-axios errors', () => {
    expect(describeRequestError(new Error('plain'), FALLBACK)).toBe(FALLBACK);
  });
});
