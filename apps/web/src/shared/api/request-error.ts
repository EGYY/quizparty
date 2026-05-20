import axios from 'axios';

/**
 * Приводит ошибку запроса к человекочитаемому сообщению по HTTP-статусу.
 * Возвращает undefined для отменённых запросов (signal) — тост не нужен.
 */
export function describeRequestError(error: unknown, fallback: string): string | undefined {
  if (axios.isCancel(error)) return undefined;

  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Нет связи с сервером. Проверьте подключение.';

    const status = error.response.status;
    if (status === 401) return 'Сессия истекла. Войдите снова.';
    if (status === 403) return 'Недостаточно прав для этого действия.';
    if (status === 404) return 'Запрашиваемые данные не найдены.';
    if (status >= 500) return 'Ошибка сервера. Попробуйте позже.';

    const data: unknown = error.response.data;
    const serverMessage =
      data && typeof data === 'object' && 'message' in data
        ? (data as { message?: unknown }).message
        : undefined;
    if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage;
  }

  return fallback;
}
