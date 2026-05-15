import { Difficulty, GameMode, QuizCategory } from '@quizparty/shared';
import type { CreateRoomResponse, QuizDetail } from '@quizparty/shared';
import { API_BASE_URL } from '@shared/config/env';

type FetchOptions = RequestInit & {
  retry?: number;
};

async function request<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const retry = options.retry ?? 2;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retry; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status} (${API_BASE_URL}${path})`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt === retry) break;
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 450 * (attempt + 1));
      });
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Network request failed (${API_BASE_URL}${path})`);
}

const quizCache = new Map<string, QuizDetail[]>();

export async function listApprovedQuizzes(
  category: QuizCategory,
): Promise<QuizDetail[]> {
  const key = `approved:${category}`;
  const cached = quizCache.get(key);
  if (cached) return cached;

  const params = category === QuizCategory.ALL ? '' : `?category=${category}`;
  const data = await request<QuizDetail[]>(`/quizzes/approved${params}`);
  console.log('data quizes,', data);
  quizCache.set(key, data);
  return data;
}

export async function createRoom(input: {
  quizId: string;
  difficulty: Difficulty;
  mode: GameMode;
}): Promise<CreateRoomResponse> {
  return request<CreateRoomResponse>('/rooms', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
