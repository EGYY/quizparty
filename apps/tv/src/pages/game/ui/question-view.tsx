/**
 * QuestionView — тонкий ассемблер экрана вопроса.
 *
 * Сам ре-рендерится каждую секунду (получает state.timer), но:
 *   - RoundTimer         — тоже ре-рендерится (отображает таймер, изолирован)
 *   - RoundBadge         — memo, НЕ ре-рендерится на тиках таймера
 *   - QuestionTextPanel  — memo по questionId, НЕ ре-рендерится на тиках
 *   - QuestionVideoHero  — memo по questionId, НЕ ре-рендерится на тиках
 *   - QuestionOptionsGrid — memo по questionId, НЕ ре-рендерится на тиках
 *   - AnswerProgress     — memo по answeredCount/playerCount
 *
 * Таким образом каждую секунду обновляется только RoundTimer
 * (18 сегментов + текст таймера + анимации) — всё остальное заморожено.
 */
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { TvGameState } from '@entities/game';
import {
  QuestionOptionsGrid,
  QuestionTextPanel,
  QuestionVideoHero,
} from '@entities/question';
import { RoundBadge } from '@entities/round';
import { MediaType } from '@quizparty/shared';
import { soundQuestionReview } from '@shared/assets/sounds';
import { colors } from '@shared/config/theme';
import { useMusicTrack } from '@shared/ui/music-provider';
import { AnswerProgress } from '@widgets/answer-progress';
import { RoundTimer } from '@widgets/round-timer';

export function QuestionView({
  state,
}: {
  state: Extract<TvGameState, { phase: 'question' }>;
}) {
  const { height, width } = useWindowDimensions();
  const compact = width < 1500 || height < 820;

  const { round, timer } = state;
  const { question } = round;
  const answeredCount = state.progress?.answeredCount ?? 0;
  const playerCount = state.progress?.playerCount ?? 0;
  const { media } = question;
  const hasMedia = media != null;
  const mediaH = Math.round(height * 0.64);

  const playMusic =
    media?.type !== MediaType.VIDEO && media?.type !== MediaType.AUDIO;
  useMusicTrack(playMusic ? soundQuestionReview : null);

  const chrome = (
    <View style={styles.topChrome}>
      <RoundBadge
        compact={compact}
        roundNumber={round.roundNumber}
        totalRounds={round.totalRounds}
      />
      <RoundTimer compact={compact} timer={timer} />
      <View
        style={[
          styles.settingsButton,
          compact && styles.settingsButton_compact,
        ]}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </View>
    </View>
  );

  const progress = (
    <AnswerProgress
      answeredCount={answeredCount}
      compact={compact}
      playerCount={playerCount}
    />
  );

  // ── Layout with media (video / audio / image) ────────────────────────────
  if (hasMedia && media) {
    return (
      <View style={[styles.layout, compact && styles.layout_compact]}>
        {chrome}
        <QuestionVideoHero
          compact={compact}
          media={media}
          mediaH={mediaH}
          questionId={question.id}
          questionText={question.questionText}
          screenWidth={width}
        />
        <QuestionOptionsGrid
          compact={compact}
          options={question.options}
          questionId={question.id}
          videoMode
        />
        {progress}
      </View>
    );
  }

  // ── Standard layout ──────────────────────────────────────────────────────
  return (
    <View style={[styles.layout, compact && styles.layout_compact]}>
      {chrome}
      <QuestionTextPanel
        compact={compact}
        media={media}
        questionId={question.id}
        questionText={question.questionText}
      />
      <QuestionOptionsGrid
        compact={compact}
        options={question.options}
        questionId={question.id}
      />
      {progress}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  layout_compact: {
    paddingBottom: 18,
  },

  topChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },

  settingsButton: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 209, 102, 0.45)',
    borderRadius: 46,
    borderWidth: 3,
    backgroundColor: 'rgba(22, 24, 43, 0.9)',
  },
  settingsButton_compact: { width: 70, height: 70, borderRadius: 35 },
  settingsIcon: {
    color: colors.textSecondary,
    fontSize: 45,
    fontWeight: '900',
  },
});
