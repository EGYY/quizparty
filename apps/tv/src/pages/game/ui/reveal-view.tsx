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
 *   - REACTION_EMOJIS — модульная константа, не пересоздаётся
 *   - correctCardTransform — memoized, не создаёт новый массив каждый рендер
 */
import { memo, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { TvGameState } from '@entities/game';
import { RevealOptionCard } from '@entities/question';
import { RoundBadge } from '@entities/round';
import { MediaType, type ReactionEvent } from '@quizparty/shared';
import { soundReveal } from '@shared/assets/sounds';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { useMusicTrack } from '@shared/ui/music-provider';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';
import { AnswerStats } from '@widgets/answer-stats';
import { RevealNextRoundCard } from './reveal-next-round-card';

const GAME_PADDING_H = s(58);

const REACTION_EMOJIS = ['👍', '❤️', '😆', '😮', '🎉'] as const;

const FALLBACK_OPTIONS = ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'];

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

  const hasRevealMedia = state.roundEnd.revealMedia != null;
  const playMusic =
    state.roundEnd.revealMedia?.type !== MediaType.VIDEO &&
    state.roundEnd.revealMedia?.type !== MediaType.AUDIO;
  useMusicTrack(playMusic ? soundReveal : null, false);

  const mediaCardW = useMemo(
    () => Math.round((width - GAME_PADDING_H * 2) * 0.52),
    [width],
  );
  const mediaCardH = useMemo(() => Math.round(height * 0.5), [height]);

  // ── Анимации ──────────────────────────────────────────────────────────────
  // GameSurface already handles the phase-enter slide/fade, so RevealView
  // only needs the correct-answer card pop-in animation.
  const correctCardScale = useRef(new Animated.Value(0.72)).current;

  const correctCardTransform = useMemo(
    () => [{ scale: correctCardScale }],
    [correctCardScale],
  );

  useEffect(() => {
    correctCardScale.setValue(0.72);
    const cardAnim = Animated.sequence([
      Animated.delay(300),
      Animated.spring(correctCardScale, {
        toValue: 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]);
    cardAnim.start();
    return () => cardAnim.stop();
  }, [state.round?.roundNumber, correctCardScale]);

  return (
    <View style={styles.layout}>
      {/* Round badge */}
      <RoundBadge
        roundNumber={state.round?.roundNumber ?? '?'}
        totalRounds={state.round?.totalRounds ?? '?'}
      />

      {/* Основной ряд: варианты + карточка ответа */}
      <View style={[styles.mainRow]}>
        {/* Левая панель: текст вопроса + варианты */}
        <View style={[styles.questionPanel]}>
          <Text numberOfLines={3} style={[styles.questionText]}>
            {question?.questionText ?? 'Вопрос раунда'}
          </Text>

          <View style={[styles.optionsGrid]}>
            {options.slice(0, 4).map((option, index) => (
              <RevealOptionCard
                correctIndex={state.roundEnd.correctIndex}
                index={index}
                key={`${option}-${index}`}
                option={option}
              />
            ))}
          </View>
        </View>

        {/* Правая карточка: правильный ответ */}
        <Animated.View
          style={[styles.correctCard, { transform: correctCardTransform }]}
        >
          {hasRevealMedia ? (
            <>
              <TvMediaPlayer
                media={state.roundEnd.revealMedia}
                overrideWidth={mediaCardW - 60}
                overrideHeight={Math.round(mediaCardH * 0.68)}
                variant="reveal"
              />
              <Text style={[styles.correctLabel]}>Правильный ответ:</Text>
              <Text numberOfLines={3} style={[styles.correctAnswer]}>
                {correctAnswer}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.correctStar]}>★</Text>
              <Text style={[styles.correctLabel]}>Правильный ответ:</Text>
              <Text numberOfLines={3} style={[styles.correctAnswer]}>
                {correctAnswer}
              </Text>
              {state.roundEnd.explanation ? (
                <>
                  <View style={styles.correctDivider} />
                  <Text numberOfLines={3} style={[styles.correctExplanation]}>
                    {state.roundEnd.explanation}
                  </Text>
                </>
              ) : null}
            </>
          )}
        </Animated.View>
      </View>

      {/* Нижний ряд */}
      <View style={[styles.bottomRow]}>
        <AnswerStats
          answerStats={state.roundEnd.answerStats}
          correctIndex={state.roundEnd.correctIndex}
          roundNumber={state.round?.roundNumber}
        />

        {/* Панель реакций */}
        <View style={[styles.reactionsPanel]}>
          <Text style={[styles.reactionsPanelTitle]}>Реакции открыты!</Text>
          <Text style={[styles.reactionsPanelText]}>
            Покажи, что ты думаешь об этом вопросе!
          </Text>
          <View style={styles.reactionPalette}>
            {REACTION_EMOJIS.map(emoji => (
              <View key={emoji} style={styles.reactionPaletteItem}>
                <Text style={styles.reactionPaletteText}>{emoji}</Text>
              </View>
            ))}
          </View>
        </View>

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

  questionPanel: {
    width: '50%',
    alignSelf: 'flex-start',
    flex: 1,
    borderColor: 'rgba(255, 201, 119, 0.52)',
    borderRadius: s(28),
    borderWidth: s(3),
    backgroundColor: 'rgba(18, 19, 36, 0.88)',
    paddingHorizontal: s(34),
    paddingTop: sv(28),
    paddingBottom: sv(24),
  },

  questionText: {
    color: colors.text,
    fontSize: sf(50),
    lineHeight: sv(58),
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: sv(4) },
    textShadowRadius: s(5),
    marginBottom: sv(4),
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(14),
    justifyContent: 'center',
    marginTop: sv(30),
  },

  // ── Correct answer card ──
  correctCard: {
    alignSelf: 'stretch',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(245, 255, 91, 0.76)',
    borderRadius: s(34),
    borderWidth: s(3),
    backgroundColor: 'rgba(28, 73, 31, 0.78)',
    paddingHorizontal: s(28),
    paddingVertical: sv(26),
    gap: s(10),
    shadowColor: '#f7ff68',
    shadowOpacity: 0.5,
    shadowRadius: s(28),
    shadowOffset: { width: 0, height: 0 },
  },

  correctStar: {
    color: colors.gold,
    fontSize: sf(72),
    lineHeight: sv(76),
    fontWeight: '900',
    textShadowColor: 'rgba(255, 229, 85, 0.86)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(24),
  },
  correctLabel: {
    color: '#cdf47c',
    fontSize: sf(26),
    fontWeight: '900',
    textAlign: 'center',
  },
  correctAnswer: {
    color: '#befe5d',
    fontSize: sf(52),
    lineHeight: sv(60),
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(190, 254, 93, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },
  correctDivider: {
    width: '100%',
    height: sv(2),
    backgroundColor: 'rgba(255, 224, 168, 0.24)',
    marginVertical: sv(6),
  },
  correctExplanation: {
    color: colors.text,
    fontSize: sf(27),
    lineHeight: sv(30),
    fontWeight: '800',
    textAlign: 'center',
  },

  // ── Bottom row ──
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(18),
    marginTop: sv(16),
  },

  // ── Reactions panel ──
  reactionsPanel: {
    flex: 1.08,
    minHeight: sv(194),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 224, 168, 0.3)',
    borderRadius: s(24),
    borderWidth: s(2),
    backgroundColor: 'rgba(23, 23, 44, 0.92)',
    paddingHorizontal: s(20),
    paddingVertical: sv(18),
    gap: s(8),
  },

  reactionsPanelTitle: {
    color: colors.gold,
    fontSize: sf(36),
    fontWeight: '900',
  },
  reactionsPanelText: {
    color: colors.text,
    fontSize: sf(17),
    fontWeight: '800',
    textAlign: 'center',
  },
  reactionPalette: { flexDirection: 'row', gap: s(10), marginTop: sv(8) },
  reactionPaletteItem: {
    width: s(54),
    height: s(54),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(27),
    backgroundColor: 'rgba(155, 124, 255, 0.26)',
  },
  reactionPaletteText: { fontSize: sf(30) },
});
