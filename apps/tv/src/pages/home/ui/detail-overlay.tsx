import { memo, useCallback } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { GameMode } from '@quizparty/shared';
import type { QuizDetail } from '@quizparty/shared';
import { QuizDetailPanel } from '@widgets/quiz-detail-panel';
import { HostCharacter } from '@widgets/host-character';
import { s, sv } from '@shared/config/scale';

type Props = {
  quiz: QuizDetail;
  mode: GameMode;
  isCreating: boolean;
  dimOpacity: Animated.Value;
  panelX: Animated.Value;
  onBack: () => void;
  onCreateRoom: (quiz: QuizDetail, mode: GameMode) => void;
  onModeChange: (mode: GameMode) => void;
};

export const DetailOverlay = memo(function DetailOverlay({
  quiz,
  mode,
  isCreating,
  dimOpacity,
  panelX,
  onBack,
  onCreateRoom,
  onModeChange,
}: Props) {
  // Stable callback: quiz and mode are the identity of this overlay instance.
  // Without useCallback, QuizDetailPanel (memo'd) would re-render every time
  // HomePage re-renders due to selectedQuiz changes during carousel navigation.
  const handleCreateRoom = useCallback(
    () => onCreateRoom(quiz, mode),
    [onCreateRoom, quiz, mode],
  );

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        pointerEvents="none"
        style={[styles.dim, { opacity: dimOpacity }]}
      />
      <HostCharacter
        mood="thinking"
        placement="left"
        speech="Отлично! Осталось выбрать режим игры"
      />
      <Animated.View
        style={[styles.panelWrap, { transform: [{ translateX: panelX }] }]}
      >
        <QuizDetailPanel
          isCreating={isCreating}
          mode={mode}
          quiz={quiz}
          onBack={onBack}
          onCreateRoom={handleCreateRoom}
          onModeChange={onModeChange}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(3, 5, 18, 0.68)',
  },
  panelWrap: {
    position: 'absolute',
    bottom: sv(24),
    right: s(24),
    top: sv(24),
    width: s(720),
    zIndex: 30,
  },
});
