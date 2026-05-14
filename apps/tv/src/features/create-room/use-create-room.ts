import { useCallback, useState } from 'react';
import type { Difficulty, GameMode } from '@quizparty/shared';
import { useTvNavigation } from '@app/navigation';
import { useToast } from '@app/toast-provider';
import type { TvQuiz } from '@entities/quiz';
import { createRoom } from '@shared/api/tv';

type CreateRoomParams = {
  difficulty: Difficulty;
  mode: GameMode;
  quiz: TvQuiz;
};

export function useCreateRoom() {
  const { navigate } = useTvNavigation();
  const toast = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const create = useCallback(
    async ({ difficulty, mode, quiz }: CreateRoomParams) => {
      if (isCreating) return;
      setIsCreating(true);
      try {
        const room = await createRoom({ quizId: quiz.id, difficulty, mode });
        toast.notify(`Комната ${room.roomCode} создана`, 'success');
        navigate({ name: 'lobby', quiz, room });
      } catch {
        toast.notify('Не удалось создать комнату. Проверьте backend.', 'error');
      } finally {
        setIsCreating(false);
      }
    },
    [isCreating, navigate, toast],
  );

  return { create, isCreating };
}
