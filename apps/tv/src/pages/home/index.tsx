import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Difficulty, GameMode } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { useTvNavigation } from '@app/navigation';
import { useToast } from '@app/toast-provider';
import { useCreateRoom, type CreateRoomSuccess } from '@features/create-room';
import { CategoryRail } from '@widgets/category-rail';
import { HostCharacter } from '@widgets/host-character';
import { RemoteHints } from '@widgets/remote-hints';
import { StageBackground } from '@widgets/stage-background';
import { soundMainTheme } from '@shared/assets/sounds';
import { s, sv } from '@shared/config/scale';
import { useMusicTrack } from '@shared/ui/music-provider';
import { Screen } from '@shared/ui/screen';
import { useDetailPanel } from './model/use-detail-panel';
import { useHomeQuizzes } from './model/use-home-quizzes';
import { DetailOverlay } from './ui/detail-overlay';
import { HomeHeader } from './ui/home-header';
import { QuizzesSection } from './ui/quizzes-section';

export function HomePage() {
  useMusicTrack(soundMainTheme);

  const navigation = useTvNavigation();
  const toast = useToast();
  const handleCreateSuccess = useCallback(
    ({ quiz, room }: CreateRoomSuccess) => {
      toast.notify(`Комната ${room.roomCode} создана`, 'success');
      navigation.navigate({ name: 'lobby', quiz, room });
    },
    [navigation, toast],
  );
  const handleCreateError = useCallback(() => {
    toast.notify('Не удалось создать комнату. Проверьте backend.', 'error');
  }, [toast]);

  const { create: createDetailRoom, isCreating } = useCreateRoom({
    onError: handleCreateError,
    onSuccess: handleCreateSuccess,
  });
  const { category, setCategory, quizzes, visibleQuizzes } = useHomeQuizzes();
  const {
    detailQuiz,
    detailMode,
    setDetailMode,
    openQuiz,
    closeDetail,
    dimOpacity,
    panelX,
  } = useDetailPanel();

  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetail | undefined>();
  const selected = selectedQuiz ?? visibleQuizzes[0];

  const handleCreateRoom = useCallback(
    (quiz: QuizDetail, mode: GameMode) => {
      void createDetailRoom({
        difficulty: quiz.difficulty ?? Difficulty.MEDIUM,
        mode,
        quiz,
      });
    },
    [createDetailRoom],
  );

  return (
    <Screen>
      <StageBackground>
        {!detailQuiz ? (
          <HostCharacter
            mood="welcome"
            placement="topRight"
            speech="Для начала выберите квиз!"
          />
        ) : null}

        <View style={styles.content}>
          <HomeHeader />

          <CategoryRail selected={category} onSelect={setCategory} />

          <QuizzesSection
            quizzes={quizzes}
            visibleQuizzes={visibleQuizzes}
            selectedQuizId={selected?.id}
            onFocusQuiz={setSelectedQuiz}
            onOpenQuiz={openQuiz}
          />
        </View>

        {detailQuiz ? (
          <DetailOverlay
            dimOpacity={dimOpacity}
            isCreating={isCreating}
            mode={detailMode}
            panelX={panelX}
            quiz={detailQuiz}
            onBack={closeDetail}
            onCreateRoom={handleCreateRoom}
            onModeChange={setDetailMode}
          />
        ) : null}

        <RemoteHints />
      </StageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: s(58),
    paddingTop: sv(44),
  },
});
