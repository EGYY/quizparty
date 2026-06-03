/**
 * QuestionView — экран вопроса.
 *
 * Reaction mode:
 *   reading   — вопрос + медиа, без таймера, без вариантов; простой отсчёт внизу
 *   countdown — медиа продолжает играть, AnswerCountdownOverlay поверх (3-2-1)
 *   answering — вопрос БЕЗ медиа + варианты, таймер
 *
 * Classic mode:
 *   варианты + медиа сразу, таймер
 */
import type { TvGameState } from '@entities/game';
import {
  QuestionOptionsGrid,
  QuestionTextPanel,
  QuestionVideoHero,
} from '@entities/question';
import { RoundBadge } from '@entities/round';
import {
  GameMode,
  MediaType,
  // MediaType,
  REACTION_COUNTDOWN_MS,
} from '@quizparty/shared';
import { soundQuestionReview } from '@shared/assets/sounds';
import { s, sf, sv } from '@shared/config/scale';
import { colors } from '@shared/config/theme';
import { useMusicTrack } from '@shared/ui/music-provider';
import { AnswerProgress } from '@widgets/answer-progress';
import { RoundTimer } from '@widgets/round-timer';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AnswerCountdownOverlay } from './answer-countdown-overlay';

// ── Простой отсчёт секунд в круге ──────────────────────────────────────────

const CIRCLE = s(180);
const REACTION_COUNTDOWN_SECONDS = Math.ceil(REACTION_COUNTDOWN_MS / 1000);

function ReadingCountdown({ seconds }: { seconds: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevSeconds = useRef(seconds);

  useEffect(() => {
    if (prevSeconds.current === seconds) return;
    prevSeconds.current = seconds;
    scaleAnim.setValue(0.65);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [seconds, scaleAnim]);

  return (
    <View style={rdStyles.wrap}>
      <View style={rdStyles.circle}>
        <Animated.Text
          style={[rdStyles.number, { transform: [{ scale: scaleAnim }] }]}
        >
          {seconds}
        </Animated.Text>
      </View>
    </View>
  );
}

const rdStyles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sv(8),
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 49, 0.88)',
    borderWidth: s(3),
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: s(24),
    shadowOffset: { width: 0, height: 0 },
  },
  number: {
    color: colors.text,
    fontSize: sf(90),
    lineHeight: sv(100),
    fontWeight: '900',
  },
});

// ── QuestionView ────────────────────────────────────────────────────────────

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
  const mediaLoadPending = Boolean(state.mediaLoadPending);
  const { media } = question;
  const hasMedia = media != null;
  const options = question.options;
  const hasOptions = Array.isArray(options);
  const mediaH = Math.round(
    Math.min(Math.max(height * 0.48, sv(460)), height * 0.56),
  );

  const isReactionMode = round.mode === GameMode.REACTION;
  const hasAnswerWindow = Boolean(state.answerWindow);

  // Фазы
  const isCountdownPhase =
    isReactionMode &&
    !hasAnswerWindow &&
    timer.stage === 'reading' &&
    timer.remainingSeconds > 0 &&
    timer.remainingSeconds <= REACTION_COUNTDOWN_SECONDS;
  const isReadingPhase = isReactionMode && !hasAnswerWindow;
  const isAnsweringPhase = !isReactionMode || hasAnswerWindow;

  // В reaction media видно до открытия окна ответов, включая 3-2-1 countdown.
  const showMediaBlock = hasMedia && (!isReactionMode || !hasAnswerWindow);

  // Таймер скрыт в reading/countdown фазах
  const showTimer = !isReadingPhase && !isCountdownPhase && !mediaLoadPending;

  const isAvMedia =
    media?.type === MediaType.AUDIO || media?.type === MediaType.VIDEO;
  useMusicTrack(
    !isAvMedia || (isReactionMode && isAnsweringPhase)
      ? soundQuestionReview
      : null,
  );

  const chrome = (
    <View style={styles.topChrome}>
      <RoundBadge
        roundNumber={round.roundNumber}
        totalRounds={round.totalRounds}
      />
      {showTimer && <RoundTimer timer={timer} />}
    </View>
  );

  const progress = hasOptions ? (
    <AnswerProgress answeredCount={answeredCount} playerCount={playerCount} />
  ) : null;
  const countdownOverlay = isCountdownPhase ? (
    <AnswerCountdownOverlay
      count={Math.min(timer.remainingSeconds, REACTION_COUNTDOWN_SECONDS)}
      screenHeight={height}
      screenWidth={width}
    />
  ) : null;

  // ── Layout A: медиа видна (классика всегда; реакция только в reading) ────
  if (showMediaBlock && media) {
    return (
      <View style={styles.layout}>
        {chrome}
        <QuestionVideoHero
          forcePaused={isPaused}
          media={media}
          mediaH={mediaH}
          questionId={question.id}
          questionText={question.questionText}
          screenWidth={width}
        />
        {isAnsweringPhase && hasOptions ? (
          <QuestionOptionsGrid
            options={options}
            questionId={question.id}
            videoMode
          />
        ) : isReadingPhase ? (
          <ReadingCountdown seconds={timer.remainingSeconds} />
        ) : null}
        {progress}
        {countdownOverlay}
      </View>
    );
  }

  // ── Layout B: без медиа (текстовые / countdown / reaction answering) ────
  return (
    <View style={styles.layout}>
      {chrome}
      <QuestionTextPanel
        forcePaused={isPaused}
        media={undefined}
        questionId={question.id}
        questionText={question.questionText}
      />
      {isAnsweringPhase && hasOptions ? (
        <QuestionOptionsGrid options={options} questionId={question.id} />
      ) : isReadingPhase ? (
        <ReadingCountdown seconds={timer.remainingSeconds} />
      ) : null}
      {progress}
      {countdownOverlay}
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
