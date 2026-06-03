/**
 * RevealView — тонкий ассемблер экрана раскрытия правильного ответа.
 *
 * Слои FSD используемых компонентов:
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
 *   - карточка правильного ответа владеет своей pop-in анимацией
 */
import { memo, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { TvGameState } from '@entities/game';
import { RoundBadge } from '@entities/round';
import { GameMode, MediaType, type ReactionEvent } from '@quizparty/shared';
import { soundReveal } from '@shared/assets/sounds';
import { getPhoneAvatarSource } from '@shared/config/phone-avatars';
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
const MEDIA_CARD_WIDTH_RATIO = 0.38;
const MEDIA_CARD_WITH_MEDIA_WIDTH_RATIO = 0.48;
const MEDIA_CARD_PADDING_H = s(24);
const CORRECT_CARD_BORDER_W = s(3);

function formatSeconds(ms: number) {
  return `${(ms / 1000).toFixed(2).replace('.', ',')} сек`;
}

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
  const isReactionMode = state.roundEnd.mode === GameMode.REACTION;
  const hasRevealMedia = Boolean(state.roundEnd.revealMedia);
  const reactionWinner = state.roundEnd.reactionWinner;
  const winnerAvatarSource = getPhoneAvatarSource(reactionWinner?.avatarId);

  const mediaCardW = useMemo(() => {
    const contentWidth = width - GAME_PADDING_H * 2;
    const mediaCardWidthRatio = hasRevealMedia
      ? MEDIA_CARD_WITH_MEDIA_WIDTH_RATIO
      : MEDIA_CARD_WIDTH_RATIO;
    const mediaCardOuterWidth =
      (contentWidth - MAIN_ROW_GAP) * mediaCardWidthRatio;
    const mediaCardInnerWidth =
      mediaCardOuterWidth -
      MEDIA_CARD_PADDING_H * 2 -
      CORRECT_CARD_BORDER_W * 2;

    return Math.max(s(300), Math.floor(mediaCardInnerWidth));
  }, [hasRevealMedia, width]);
  const mediaCardH = useMemo(
    () => Math.round(height * (hasRevealMedia ? 0.58 : 0.52)),
    [hasRevealMedia, height],
  );

  return (
    <View style={styles.layout}>
      {/* Round badge */}
      <RoundBadge
        roundNumber={state.round?.roundNumber ?? '?'}
        totalRounds={state.round?.totalRounds ?? '?'}
      />

      {/* Основной ряд: вопрос + крупный ответ + медиа/разбор */}
      <View style={[styles.mainRow]}>
        <RevealQuestionPanel
          correctAnswer={correctAnswer}
          hasMedia={hasRevealMedia}
          questionText={question?.questionText ?? 'Вопрос раунда'}
        />

        <RevealCorrectCard
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
        {isReactionMode ? (
          <View style={styles.reactionWinnerCard}>
            <Text style={styles.reactionWinnerEyebrow}>
              {reactionWinner
                ? 'Быстрее всех ответил'
                : 'Никто не успел ответить правильно'}
            </Text>
            {reactionWinner ? (
              <View style={styles.reactionWinnerRow}>
                {winnerAvatarSource ? (
                  <Image
                    source={winnerAvatarSource}
                    style={styles.reactionWinnerAvatar}
                  />
                ) : (
                  <View style={styles.reactionWinnerAvatarFallback}>
                    <Text style={styles.reactionWinnerAvatarText}>
                      {reactionWinner.nickname.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.reactionWinnerCopy}>
                  <Text style={styles.reactionWinnerName} numberOfLines={1}>
                    {reactionWinner.nickname}
                  </Text>
                  <Text style={styles.reactionWinnerTime}>
                    {formatSeconds(reactionWinner.responseMs)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <AnswerStats
            answerStats={state.roundEnd.answerStats}
            correctIndex={state.roundEnd.correctIndex}
            roundNumber={state.round?.roundNumber}
          />
        )}

        <RevealReactionsPanel />

        {/* Таймер следующего раунда */}
        <RevealNextRoundCard
          staticSeconds={state.nextRound?.remainingSeconds}
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
    alignItems: 'stretch',
    gap: s(26),
    minHeight: sv(575),
    marginTop: sv(8),
  },

  // ── Bottom row ──
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(18),
    minHeight: sv(170),
    marginTop: sv(18),
  },
  reactionWinnerCard: {
    flex: 1,
    minHeight: sv(160),
    justifyContent: 'center',
    borderColor: 'rgba(255, 209, 102, 0.58)',
    borderRadius: s(30),
    borderWidth: s(3),
    backgroundColor: 'rgba(12, 18, 34, 0.88)',
    paddingHorizontal: s(28),
    paddingVertical: sv(20),
    gap: sv(16),
  },
  reactionWinnerEyebrow: {
    color: '#f5d1a1',
    fontSize: s(26),
    fontWeight: '900',
    textAlign: 'center',
  },
  reactionWinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(22),
  },
  reactionWinnerAvatar: {
    width: s(92),
    height: s(92),
    borderColor: 'rgba(255, 209, 102, 0.82)',
    borderRadius: s(24),
    borderWidth: s(3),
  },
  reactionWinnerAvatarFallback: {
    width: s(92),
    height: s(92),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 209, 102, 0.82)',
    borderRadius: s(24),
    borderWidth: s(3),
    backgroundColor: 'rgba(255, 209, 102, 0.18)',
  },
  reactionWinnerAvatarText: {
    color: '#fff6dd',
    fontSize: s(42),
    fontWeight: '900',
  },
  reactionWinnerCopy: {
    minWidth: 0,
    flexShrink: 1,
  },
  reactionWinnerName: {
    color: '#fff',
    fontSize: s(40),
    fontWeight: '900',
  },
  reactionWinnerTime: {
    color: '#b9ff72',
    fontSize: s(34),
    fontWeight: '900',
  },
});
