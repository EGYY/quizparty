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
import { s, sf, sv } from '@shared/config/scale';
import { useMusicTrack } from '@shared/ui/music-provider';
import { AnswerProgress } from '@widgets/answer-progress';
import { RoundTimer } from '@widgets/round-timer';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

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
  const isPaused = Boolean(state.isPaused);
  const { media } = question;
  const hasMedia = media != null;
  const options = question.options;
  const hasOptions = Array.isArray(options);
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

  const progress = hasOptions ? (
    <AnswerProgress answeredCount={answeredCount} playerCount={playerCount} />
  ) : null;

  const answerWindowPlaceholder = (
    <View style={styles.answerWindowPlaceholder}>
      <Text style={styles.answerWindowEyebrow}>Готовьтесь</Text>
      <Text style={styles.answerWindowTitle}>
        Варианты появятся через {timer.remainingSeconds} с
      </Text>
      <Text style={styles.answerWindowText}>
        Сначала читаем вопрос, потом отвечаем на скорость.
      </Text>
    </View>
  );

  // ── Layout with media (video / audio / image) ────────────────────────────
  if (hasMedia && media) {
    return (
      <View style={[styles.layout]}>
        {chrome}
        <QuestionVideoHero
          forcePaused={isPaused}
          media={media}
          mediaH={mediaH}
          questionId={question.id}
          questionText={question.questionText}
          screenWidth={width}
        />
        {hasOptions ? (
          <QuestionOptionsGrid
            options={options}
            questionId={question.id}
            videoMode
          />
        ) : (
          answerWindowPlaceholder
        )}
        {progress}
      </View>
    );
  }

  // ── Standard layout ──────────────────────────────────────────────────────
  return (
    <View style={[styles.layout]}>
      {chrome}
      <QuestionTextPanel
        forcePaused={isPaused}
        media={media}
        questionId={question.id}
        questionText={question.questionText}
      />
      {hasOptions ? (
        <QuestionOptionsGrid options={options} questionId={question.id} />
      ) : (
        answerWindowPlaceholder
      )}
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
  answerWindowPlaceholder: {
    alignSelf: 'center',
    width: '82%',
    minHeight: sv(150),
    alignItems: 'center',
    justifyContent: 'center',
    gap: sv(8),
    borderRadius: s(28),
    borderWidth: s(2),
    borderColor: 'rgba(94, 215, 255, 0.34)',
    backgroundColor: 'rgba(8, 19, 38, 0.72)',
    paddingHorizontal: s(34),
  },
  answerWindowEyebrow: {
    color: '#5ed7ff',
    fontSize: sf(18),
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  answerWindowTitle: {
    color: '#ffffff',
    fontSize: sf(42),
    fontWeight: '900',
    textAlign: 'center',
  },
  answerWindowText: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: sf(22),
    fontWeight: '700',
    textAlign: 'center',
  },
});
