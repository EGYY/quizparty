import { useCallback, useRef, useState } from 'react';
import type { Difficulty, GameMode } from '@quizparty/shared';
import type { TvQuiz } from '@entities/quiz';
import type { TvRoom } from '@shared/types/tv';
import { createRoom } from './api/create-room';

type CreateRoomParams = {
  difficulty: Difficulty;
  mode: GameMode;
  quiz: TvQuiz;
};

export type CreateRoomSuccess = {
  quiz: TvQuiz;
  room: TvRoom;
};

type UseCreateRoomOptions = {
  onError?: (error: unknown) => void;
  onSuccess?: (result: CreateRoomSuccess) => void;
};

export function useCreateRoom({
  onError,
  onSuccess,
}: UseCreateRoomOptions = {}) {
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const create = useCallback(
    async ({ difficulty, mode, quiz }: CreateRoomParams) => {
      if (isCreatingRef.current) return undefined;
      isCreatingRef.current = true;
      setIsCreating(true);
      try {
        const room = await createRoom({ quizId: quiz.id, difficulty, mode });
        const result = { quiz, room };
        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error);
        return undefined;
      } finally {
        isCreatingRef.current = false;
        setIsCreating(false);
      }
    },
    [onError, onSuccess],
  );

  return { create, isCreating };
}
