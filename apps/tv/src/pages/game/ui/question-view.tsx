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
import type { TvGameState } from '@entities/game';
import {
  QuestionOptionsGrid,
  QuestionTextPanel,
  QuestionVideoHero,
} from '@entities/question';
import { RoundBadge } from '@entities/round';
import { MediaType } from '@quizparty/shared';
import { soundQuestionReview } from '@shared/assets/sounds';
import { s, sv } from '@shared/config/scale';
import { useMusicTrack } from '@shared/ui/music-provider';
import { AnswerProgress } from '@widgets/answer-progress';
import { RoundTimer } from '@widgets/round-timer';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

export function QuestionView({
  state,
}: {
  state: Extract<TvGameState, { phase: 'question' }>;
}) {
  const { height, width } = useWindowDimensions();

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
        roundNumber={round.roundNumber}
        totalRounds={round.totalRounds}
      />
      <RoundTimer timer={timer} />
    </View>
  );

  const progress = (
    <AnswerProgress answeredCount={answeredCount} playerCount={playerCount} />
  );

  // ── Layout with media (video / audio / image) ────────────────────────────
  if (hasMedia && media) {
    return (
      <View style={[styles.layout]}>
        {chrome}
        <QuestionVideoHero
          media={media}
          mediaH={mediaH}
          questionId={question.id}
          questionText={question.questionText}
          screenWidth={width}
        />
        <QuestionOptionsGrid
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
    <View style={[styles.layout]}>
      {chrome}
      <QuestionTextPanel
        media={media}
        questionId={question.id}
        questionText={question.questionText}
      />
      <QuestionOptionsGrid
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
    paddingBottom: sv(30),
  },

  topChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(24),
  },
});
