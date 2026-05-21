import { memo } from 'react';
import { ScrollView, StyleSheet, TVFocusGuideView, View } from 'react-native';
import { GameMode } from '@quizparty/shared';
import type { TvQuiz } from '@entities/quiz';
import { s, sv } from '@shared/config/scale';
import { CreateRoomButton } from './ui/create-room-button';
import { QuizDetailCloseButton } from './ui/quiz-detail-close-button';
import { QuizDetailCover } from './ui/quiz-detail-cover';
import { QuizDetailDescription } from './ui/quiz-detail-description';
import { QuizDetailHeader } from './ui/quiz-detail-header';
import { QuizDetailInfoRow } from './ui/quiz-detail-info-row';
import { QuizModeSelector } from './ui/quiz-mode-selector';

export const QuizDetailPanel = memo(function QuizDetailPanel({
  quiz,
  mode,
  isCreating,
  onBack,
  onCreateRoom,
  onModeChange,
}: {
  quiz: TvQuiz;
  mode: GameMode;
  isCreating: boolean;
  onBack: () => void;
  onCreateRoom: () => void;
  onModeChange: (mode: GameMode) => void;
}) {
  return (
    <TVFocusGuideView
      trapFocusUp
      trapFocusDown
      trapFocusLeft
      trapFocusRight
      style={styles.panelOuter}
    >
      <View style={styles.panel}>
        {/*  Scrollable body  */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <QuizDetailHeader quiz={quiz} />
          <QuizDetailCover quiz={quiz} />
          <QuizDetailDescription quiz={quiz} />
          <QuizDetailInfoRow quiz={quiz} />
          <QuizModeSelector mode={mode} onModeChange={onModeChange} />
          <CreateRoomButton isCreating={isCreating} onPress={onCreateRoom} />
        </ScrollView>
      </View>

      {/* Close button - sibling of overflow:hidden panel, outer View owns position:absolute */}
      <QuizDetailCloseButton onPress={onBack} />
    </TVFocusGuideView>
  );
});

const styles = StyleSheet.create({
  // Outer wrapper: same size as the panel but NO overflow:hidden,
  // so tvOS focus engine can always reach the close button that lives here.
  panelOuter: {
    width: s(720),
    height: '100%',
  },

  // Inner panel: overflow:hidden ONLY for borderRadius + scroll clipping.
  panel: {
    flex: 1,
    borderColor: 'rgba(255, 248, 238, 0.18)',
    borderRadius: s(34),
    borderWidth: s(2),
    backgroundColor: 'rgba(24, 24, 49, 0.97)',
    shadowColor: '#000',
    shadowOpacity: 0.52,
    shadowRadius: s(36),
    shadowOffset: { width: s(-14), height: 0 },
    overflow: 'hidden',
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: s(26),
    paddingTop: sv(18),
    paddingBottom: sv(20),
    gap: sv(10),
  },
});
