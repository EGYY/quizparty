import type { Difficulty, GameMode } from '@quizparty/shared';
import { request } from '@shared/api/tv';
import type { TvRoom } from '@shared/types/tv';

export function createRoom(input: {
  quizId: string;
  difficulty: Difficulty;
  mode: GameMode;
}): Promise<TvRoom> {
  return request<TvRoom>('/rooms', {
    method: 'POST',
    body: JSON.stringify(input),
    retry: 0,
  });
}
