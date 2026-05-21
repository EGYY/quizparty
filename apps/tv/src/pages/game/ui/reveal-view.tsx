/**
 * RevealView — тонкий ассемблер экрана раскрытия правильного ответа.
 *
 * Слои FSD используемых компонентов:
 *   @entities/question  — RevealOptionCard
 *   @entities/round     — RoundBadge
 *   @widgets/answer-stats — AnswerStats
 *   @shared/*           — AnimatedReactionBubble, TvMediaPlayer, useMusicTrack
 *
 * Анимации этого файла:
 *   correctCardScale — карточка правильного ответа выпрыгивает через 300 мс
 *   (phase-enter slide/fade delegated to GameSurface)
 *
 * PERFORMANCE:
 *   - Сам компонент memo'd — не перерисовывается, пока state/reactions не изменятся
 *   - useCountdown вынесен в RevealNextRoundCard → его 500 мс тики изолированы
 *   - карточка правильного ответа владеет своей pop-in анимацией
 */
import { memo, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { TvGameState } from '@entities/game';
import { RoundBadge } from '@entities/round';
import { MediaType, type ReactionEvent } from '@quizparty/shared';
import { soundReveal } from '@shared/assets/sounds';
import { s, sv } from '@shared/config/scale';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { useMusicTrack } from '@shared/ui/music-provider';
import { AnswerStats } from '@widgets/answer-stats';
import { FALLBACK_OPTIONS } from '../model/reveal';
import { RevealCorrectCard } from './reveal-correct-card';
import { RevealNextRoundCard } from './reveal-next-round-card';
import { RevealQuestionPanel } from './reveal-question-panel';
import { RevealReactionsPanel } from './reveal-reactions-panel';

const GAME_PADDING_H = s(58);
const MAIN_ROW_GAP = s(26);
const CORRECT_CARD_WIDTH_RATIO = 0.4;
const CORRECT_CARD_PADDING_H = s(28);
const CORRECT_CARD_BORDER_W = s(3);

export const RevealView = memo(function RevealView({
  reactions,
  state,
}: {
  reactions: ReactionEvent[];
  state: Extract<TvGameState, { phase: 'reveal' }>;
}) {
  const { height, width } = useWindowDimensions();

  const question = state.round?.question;

  const options = useMemo(
    () => question?.options ?? FALLBACK_OPTIONS,
    [question?.options],
  );

  const correctAnswer = useMemo(
    () => options[state.roundEnd.correctIndex] ?? options[0],
    [options, state.roundEnd.correctIndex],
  );

  const playMusic =
    state.roundEnd.revealMedia?.type !== MediaType.VIDEO &&
    state.roundEnd.revealMedia?.type !== MediaType.AUDIO;
  useMusicTrack(playMusic ? soundReveal : null, false);

  const mediaCardW = useMemo(() => {
    const contentWidth = width - GAME_PADDING_H * 2;
    const correctCardOuterWidth =
      (contentWidth - MAIN_ROW_GAP) * CORRECT_CARD_WIDTH_RATIO;
    const correctCardInnerWidth =
      correctCardOuterWidth -
      CORRECT_CARD_PADDING_H * 2 -
      CORRECT_CARD_BORDER_W * 2;

    return Math.max(s(300), Math.floor(correctCardInnerWidth));
  }, [width]);
  const mediaCardH = useMemo(() => Math.round(height * 0.5), [height]);

  return (
    <View style={styles.layout}>
      {/* Round badge */}
      <RoundBadge
        roundNumber={state.round?.roundNumber ?? '?'}
        totalRounds={state.round?.totalRounds ?? '?'}
      />

      {/* Основной ряд: варианты + карточка ответа */}
      <View style={[styles.mainRow]}>
        <RevealQuestionPanel
          correctIndex={state.roundEnd.correctIndex}
          options={options}
          questionText={question?.questionText ?? 'Вопрос раунда'}
        />

        <RevealCorrectCard
          correctAnswer={correctAnswer}
          explanation={state.roundEnd.explanation}
          forcePaused={state.isPaused}
          mediaCardH={mediaCardH}
          mediaCardW={mediaCardW}
          revealMedia={state.roundEnd.revealMedia}
          roundNumber={state.round?.roundNumber}
        />
      </View>

      {/* Нижний ряд */}
      <View style={[styles.bottomRow]}>
        <AnswerStats
          answerStats={state.roundEnd.answerStats}
          correctIndex={state.roundEnd.correctIndex}
          roundNumber={state.round?.roundNumber}
        />

        <RevealReactionsPanel />

        {/* Таймер следующего раунда (изолирован — владеет useCountdown) */}
        <RevealNextRoundCard
          staticSeconds={state.nextRound?.remainingSeconds}
          reactionWindowClosesAt={state.reactionWindow?.closesAt}
        />
      </View>

      {/* Реакции (оверлей) */}
      <View pointerEvents="none" style={styles.reactionsLayer}>
        {reactions.slice(0, 5).map(reaction => (
          <AnimatedReactionBubble key={reaction.id} reaction={reaction} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: sv(30),
  },

  reactionsLayer: {
    position: 'absolute',
    right: s(20),
    bottom: sv(20),
    zIndex: 2,
    width: s(200),
    height: sv(400),
  },

  // ── Main row ──
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: s(26),
    marginTop: sv(10),
  },

  // ── Bottom row ──
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(18),
    marginTop: sv(16),
  },
});
