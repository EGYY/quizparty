/**
 * RevealView — тонкий ассемблер экрана раскрытия правильного ответа.
 *
 * Слои FSD используемых компонентов:
 *   @entities/question  — RevealOptionCard
 *   @entities/round     — RoundBadge
 *   @widgets/answer-stats — AnswerStats
 *   @shared/*           — AnimatedReactionBubble, TvMediaPlayer, useMusicTrack, useCountdown
 *
 * Анимации этого файла:
 *   layoutSlide / layoutOpacity — весь экран въезжает снизу при смене раунда
 *   correctCardScale            — карточка правильного ответа выпрыгивает через 300 мс
 *                                 (Animated.delay + native driver — допустимо, т.к.
 *                                  финальная анимация тоже useNativeDriver:true)
 */
import { useEffect, useRef } from 'react';
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
import { useCountdown } from '@shared/lib/use-countdown';
import { AnimatedReactionBubble } from '@shared/ui/animated-reaction-bubble';
import { useMusicTrack } from '@shared/ui/music-provider';
import { TvMediaPlayer } from '@shared/ui/tv-media-player';
import { AnswerStats } from '@widgets/answer-stats';

const GAME_PADDING_H = 58;

export function RevealView({
  reactions,
  state,
}: {
  reactions: ReactionEvent[];
  state: Extract<TvGameState, { phase: 'reveal' }>;
}) {
  const { height, width } = useWindowDimensions();
  const compact = width < 1500 || height < 820;

  const question = state.round?.question;
  const options = question?.options ?? [
    'Ответ 1',
    'Ответ 2',
    'Ответ 3',
    'Ответ 4',
  ];
  const correctAnswer = options[state.roundEnd.correctIndex] ?? options[0];

  const countdown = state.nextRound?.remainingSeconds;
  const reactionCountdown = useCountdown(state.reactionWindow?.closesAt);
  const nextRoundCountdown =
    typeof countdown === 'number'
      ? countdown
      : typeof reactionCountdown === 'number'
        ? reactionCountdown
        : undefined;

  const hasRevealMedia = state.roundEnd.revealMedia != null;
  const playMusic =
    state.roundEnd.revealMedia?.type !== MediaType.VIDEO &&
    state.roundEnd.revealMedia?.type !== MediaType.AUDIO;
  useMusicTrack(playMusic ? soundReveal : null, false);

  const contentW = width - GAME_PADDING_H * 2;
  const mediaCardW = Math.round(contentW * 0.52);
  const mediaCardH = Math.round(height * 0.5);

  // ── Анимации ──────────────────────────────────────────────────────────────
  const layoutSlide = useRef(new Animated.Value(48)).current;
  const layoutOpacity = useRef(new Animated.Value(0)).current;
  const correctCardScale = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    layoutSlide.setValue(48);
    layoutOpacity.setValue(0);
    correctCardScale.setValue(0.72);

    Animated.parallel([
      Animated.spring(layoutSlide, {
        toValue: 0,
        friction: 9,
        tension: 100,
        useNativeDriver: true,
        isInteraction: false,
      }),
      Animated.timing(layoutOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]).start();

    // Animated.delay + useNativeDriver:true — корректная комбинация
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(correctCardScale, {
        toValue: 1,
        friction: 6,
        tension: 140,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]).start();
  }, [state.round?.roundNumber]);

  return (
    <Animated.View
      style={[
        styles.layout,
        compact && styles.layout_compact,
        {
          opacity: layoutOpacity,
          transform: [{ translateY: layoutSlide }],
        },
      ]}
    >
      {/* Round badge */}
      <RoundBadge
        compact={compact}
        roundNumber={state.round?.roundNumber ?? '?'}
        totalRounds={state.round?.totalRounds ?? '?'}
      />

      {/* Основной ряд: варианты + карточка ответа */}
      <View style={[styles.mainRow, compact && styles.mainRow_compact]}>
        {/* Левая панель: текст вопроса + варианты */}
        <View
          style={[
            styles.questionPanel,
            compact && styles.questionPanel_compact,
          ]}
        >
          <Text
            numberOfLines={compact ? 3 : 2}
            style={[
              styles.questionText,
              compact && styles.questionText_compact,
            ]}
          >
            {question?.questionText ?? 'Вопрос раунда'}
          </Text>

          <View
            style={[styles.optionsGrid, compact && styles.optionsGrid_compact]}
          >
            {options.slice(0, 4).map((option, index) => (
              <RevealOptionCard
                compact={compact}
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
          style={[
            styles.correctCard,
            compact && styles.correctCard_compact,
            { width: mediaCardW, minHeight: mediaCardH },
            { transform: [{ scale: correctCardScale }] },
          ]}
        >
          {hasRevealMedia ? (
            <>
              <TvMediaPlayer
                compact={compact}
                media={state.roundEnd.revealMedia}
                overrideWidth={mediaCardW - 60}
                overrideHeight={Math.round(mediaCardH * 0.68)}
                variant="reveal"
              />
              <Text
                style={[
                  styles.correctLabel,
                  compact && styles.correctLabel_compact,
                ]}
              >
                Правильный ответ:
              </Text>
              <Text
                numberOfLines={3}
                style={[
                  styles.correctAnswer,
                  compact && styles.correctAnswer_compact,
                ]}
              >
                {correctAnswer}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.correctStar,
                  compact && styles.correctStar_compact,
                ]}
              >
                ★
              </Text>
              <Text
                style={[
                  styles.correctLabel,
                  compact && styles.correctLabel_compact,
                ]}
              >
                Правильный ответ:
              </Text>
              <Text
                numberOfLines={3}
                style={[
                  styles.correctAnswer,
                  compact && styles.correctAnswer_compact,
                ]}
              >
                {correctAnswer}
              </Text>
              {state.roundEnd.explanation ? (
                <>
                  <View style={styles.correctDivider} />
                  <Text
                    numberOfLines={compact ? 3 : 4}
                    style={[
                      styles.correctExplanation,
                      compact && styles.correctExplanation_compact,
                    ]}
                  >
                    {state.roundEnd.explanation}
                  </Text>
                </>
              ) : null}
            </>
          )}
        </Animated.View>
      </View>

      {/* Нижний ряд */}
      <View style={[styles.bottomRow, compact && styles.bottomRow_compact]}>
        <AnswerStats
          answerStats={state.roundEnd.answerStats}
          compact={compact}
          correctIndex={state.roundEnd.correctIndex}
          roundNumber={state.round?.roundNumber}
        />

        {/* Панель реакций */}
        <View
          style={[
            styles.reactionsPanel,
            compact && styles.reactionsPanel_compact,
          ]}
        >
          <Text
            style={[
              styles.reactionsPanelTitle,
              compact && styles.reactionsPanelTitle_compact,
            ]}
          >
            Реакции открыты!
          </Text>
          <Text
            style={[
              styles.reactionsPanelText,
              compact && styles.reactionsPanelText_compact,
            ]}
          >
            Покажи, что ты думаешь об этом вопросе!
          </Text>
          <View style={styles.reactionPalette}>
            {['👍', '❤️', '😆', '😮', '🎉'].map(emoji => (
              <View key={emoji} style={styles.reactionPaletteItem}>
                <Text style={styles.reactionPaletteText}>{emoji}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Таймер следующего раунда */}
        <View
          style={[
            styles.nextRoundCard,
            compact && styles.nextRoundCard_compact,
          ]}
        >
          <Text
            style={[
              styles.nextRoundLabel,
              compact && styles.nextRoundLabel_compact,
            ]}
          >
            {typeof countdown === 'number'
              ? 'Следующий раунд через'
              : 'Окно реакций'}
          </Text>
          <Text
            style={[
              styles.nextRoundValue,
              compact && styles.nextRoundValue_compact,
            ]}
          >
            {typeof nextRoundCountdown === 'number'
              ? nextRoundCountdown
              : '...'}
          </Text>
        </View>
      </View>

      {/* Реакции (оверлей) */}
      <View pointerEvents="none" style={styles.reactionsLayer}>
        {reactions.slice(0, 5).map(reaction => (
          <AnimatedReactionBubble key={reaction.id} reaction={reaction} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  layout_compact: { paddingBottom: 18 },

  reactionsLayer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 2,
    width: 200,
    height: 400,
  },

  // ── Main row ──
  mainRow: {
    minHeight: 500,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
    marginTop: 10,
  },
  mainRow_compact: { minHeight: 358, gap: 16, marginTop: 4 },

  questionPanel: {
    flex: 1,
    minHeight: 500,
    borderColor: 'rgba(255, 201, 119, 0.52)',
    borderRadius: 28,
    borderWidth: 3,
    backgroundColor: 'rgba(18, 19, 36, 0.88)',
    paddingHorizontal: 34,
    paddingTop: 28,
    paddingBottom: 24,
  },
  questionPanel_compact: {
    minHeight: 358,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
  },
  questionText: {
    color: colors.text,
    fontSize: 50,
    lineHeight: 58,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
    marginBottom: 4,
  },
  questionText_compact: { fontSize: 36, lineHeight: 43 },

  optionsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginTop: 20,
  },
  optionsGrid_compact: { gap: 9, marginTop: 12 },

  // ── Correct answer card ──
  correctCard: {
    width: 420,
    minHeight: 350,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(245, 255, 91, 0.76)',
    borderRadius: 34,
    borderWidth: 3,
    backgroundColor: 'rgba(28, 73, 31, 0.78)',
    paddingHorizontal: 28,
    paddingVertical: 26,
    gap: 10,
    shadowColor: '#f7ff68',
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  correctCard_compact: {
    width: 306,
    minHeight: 268,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  correctStar: {
    color: colors.gold,
    fontSize: 72,
    lineHeight: 76,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 229, 85, 0.86)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  correctStar_compact: { fontSize: 52, lineHeight: 56 },
  correctLabel: {
    color: '#cdf47c',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  correctLabel_compact: { fontSize: 19 },
  correctAnswer: {
    color: '#befe5d',
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(190, 254, 93, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  correctAnswer_compact: { fontSize: 36, lineHeight: 43 },
  correctDivider: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 224, 168, 0.24)',
    marginVertical: 6,
  },
  correctExplanation: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  correctExplanation_compact: { fontSize: 16, lineHeight: 22 },

  // ── Bottom row ──
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
    marginTop: 16,
  },
  bottomRow_compact: { gap: 12, marginTop: 10 },

  // ── Reactions panel ──
  reactionsPanel: {
    flex: 1.08,
    minHeight: 194,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 224, 168, 0.3)',
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(23, 23, 44, 0.92)',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },
  reactionsPanel_compact: {
    minHeight: 148,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reactionsPanelTitle: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '900',
  },
  reactionsPanelTitle_compact: { fontSize: 19 },
  reactionsPanelText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  reactionsPanelText_compact: { fontSize: 13 },
  reactionPalette: { flexDirection: 'row', gap: 10, marginTop: 8 },
  reactionPaletteItem: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: 'rgba(155, 124, 255, 0.26)',
  },
  reactionPaletteText: { fontSize: 30 },

  // ── Next round countdown ──
  nextRoundCard: {
    width: 340,
    minHeight: 194,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 224, 168, 0.36)',
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(18, 22, 39, 0.92)',
    paddingHorizontal: 20,
    gap: 6,
  },
  nextRoundCard_compact: { width: 254, minHeight: 148, borderRadius: 18 },
  nextRoundLabel: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  nextRoundLabel_compact: { fontSize: 17 },
  nextRoundValue: {
    color: colors.gold,
    fontSize: 96,
    lineHeight: 104,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 209, 102, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  nextRoundValue_compact: { fontSize: 64, lineHeight: 72 },
});
