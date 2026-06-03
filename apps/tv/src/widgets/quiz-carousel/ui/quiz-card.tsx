import { memo, useCallback, useMemo } from 'react';
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Difficulty } from '@quizparty/shared';
import type { TvQuiz } from '@entities/quiz';
import {
  categoryIcons,
  categoryLabels,
  difficultyLabels,
} from '@shared/config/labels';
import { colors, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { getMediaUrl } from '@shared/lib/media';

// Stable constant outside component — no recreation per render
const ROTATE_Y = '0deg';
const ACTIVE_SCALE = 1;
const INACTIVE_SCALE = 0.9;

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: '#7ff2ad',
  [Difficulty.MEDIUM]: '#ffd166',
  [Difficulty.HARD]: '#ff7a7a',
};

type Props = {
  hasTVPreferredFocus?: boolean;
  quiz: TvQuiz;
  isActive: boolean;
  variant?: 'carousel' | 'grid';
  onFocus: (quiz: TvQuiz) => void;
  onPress: (quiz: TvQuiz) => void;
};

export const QuizCard = memo(function QuizCard({
  hasTVPreferredFocus,
  quiz,
  isActive,
  variant = 'carousel',
  onFocus,
  onPress,
}: Props) {
  // Stable per-card callbacks: quiz ref is stable (from parent data array),
  // onFocus/onPress are stable (useCallback in QuizCarousel parent).
  // Therefore these callbacks are created once and reused.
  const handleFocus = useCallback(() => onFocus(quiz), [onFocus, quiz]);
  const handlePress = useCallback(() => onPress(quiz), [onPress, quiz]);

  const canUseCover = Boolean(
    quiz.coverUrl &&
    !quiz.coverUrl.endsWith('.svg') &&
    !quiz.coverUrl.includes('assets.quizparty.local'),
  );

  const quizDifficulty = quiz.difficulty ?? Difficulty.MEDIUM;
  const isGrid = variant === 'grid';

  // Memoized: prevents new array + object allocation on every render.
  // Only recreates when isActive or themeColor change — i.e. max 2 cards per D-pad press.
  const cardInnerStyle = useMemo(
    () => [
      styles.card,
      isGrid ? styles.gridCard : isActive ? styles.activeCard : null,
      {
        backgroundColor: quiz.themeColor ?? colors.purple,
        transform: [
          { perspective: 950 },
          { rotateY: ROTATE_Y },
          { scale: isGrid || isActive ? ACTIVE_SCALE : INACTIVE_SCALE },
        ],
      },
    ],
    [isActive, isGrid, quiz.themeColor],
  );

  const frameStyle = useMemo(
    () => [
      styles.frame,
      isGrid
        ? styles.gridFrame
        : isActive
          ? styles.activeFrame
          : styles.inactiveFrame,
    ],
    [isActive, isGrid],
  );

  const categoryChipStyle = useMemo(
    () => [
      styles.categoryChip,
      !isGrid && isActive ? styles.categoryChipActive : null,
    ],
    [isActive, isGrid],
  );

  // difficultyColors values are stable string constants — safe dep.
  const difficultyBadgeStyle = useMemo(
    () => [
      styles.difficultyBadge,
      { backgroundColor: difficultyColors[quizDifficulty] },
    ],
    [quizDifficulty],
  );

  // Extracted as a variable to avoid duplication between ImageBackground and View branches.
  // Not a component — avoids reconciler overhead for this leaf content.
  const posterContent = (
    <>
      <View style={styles.posterDim} />
      {!canUseCover ? (
        <View style={styles.fallbackPoster}>
          <Text style={styles.coverIcon}>{categoryIcons[quiz.category]}</Text>
          <View style={styles.coverShine} />
        </View>
      ) : null}
      <View style={categoryChipStyle}>
        <Text style={styles.categoryChipText}>
          {categoryIcons[quiz.category]}{' '}
          {categoryLabels[quiz.category].toUpperCase()}
        </Text>
      </View>
      <LinearGradient
        colors={['rgba(4,6,19,0)', 'rgba(4,6,19,1)']}
        style={styles.bottomScrimDark}
      />
      <View style={styles.cardBody}>
        <Text numberOfLines={3} style={styles.title}>
          {quiz.title}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {quiz.description}
        </Text>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <View style={difficultyBadgeStyle}>
            <Text style={styles.difficultyText}>
              {difficultyLabels[quizDifficulty]}
            </Text>
          </View>
          <Text style={styles.meta}>◉ {quiz.questionCount} вопросов</Text>
        </View>
      </View>
    </>
  );

  return (
    <Focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={handleFocus}
      onPress={handlePress}
      style={frameStyle}
    >
      {/* renderToHardwareTextureAndroid merges ImageBackground + LinearGradient
          + all overlay Views into one GPU texture per card, keeping the total
          compositing layer count within Android's hardware budget.
          ImageBackground's TS types don't include this prop, so we place it on
          a wrapping View instead — the effect is identical since the entire
          subtree (image + overlays) is captured into the texture. */}
      {canUseCover && quiz.coverUrl ? (
        <View renderToHardwareTextureAndroid={!isGrid} style={cardInnerStyle}>
          <ImageBackground
            resizeMode="cover"
            source={{ uri: getMediaUrl(quiz.coverUrl) }}
            style={StyleSheet.absoluteFillObject}
          >
            {posterContent}
          </ImageBackground>
        </View>
      ) : (
        <View renderToHardwareTextureAndroid={!isGrid} style={cardInnerStyle}>
          {posterContent}
        </View>
      )}
    </Focusable>
  );
});

const styles = StyleSheet.create({
  frame: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    width: s(432),
    height: sv(590),
  },
  activeFrame: {
    zIndex: 2,
  },
  inactiveFrame: {
    opacity: 0.78,
  },
  card: {
    width: s(456),
    height: '100%',
    borderRadius: s(30),
    overflow: 'hidden',
    borderColor: 'rgba(255, 224, 168, 0.22)',
    borderWidth: s(2),
  },
  activeCard: {
    borderColor: '#fff0b2',
    ...Platform.select({
      android: { elevation: 12 },
      default: {
        shadowColor: '#ffe8a3',
        shadowOpacity: 0.62,
        shadowRadius: s(26),
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  gridFrame: {
    opacity: 1,
    zIndex: 1,
  },
  gridCard: {
    width: '100%',
  },
  posterDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 22, 0.1)',
  },
  fallbackPoster: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.74,
  },
  coverIcon: {
    color: 'rgba(255, 248, 238, 0.92)',
    fontSize: sf(136),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: sv(6) },
    textShadowRadius: s(10),
  },
  coverShine: {
    position: 'absolute',
    left: s(-120),
    top: sv(-40),
    width: s(180),
    height: sv(340),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    transform: [{ rotate: '22deg' }],
  },
  categoryChip: {
    position: 'absolute',
    left: s(16),
    top: sv(16),
    borderRadius: 999,
    backgroundColor: 'rgba(255, 209, 102, 0.92)',
    paddingHorizontal: s(18),
    paddingVertical: sv(9),
  },
  categoryChipActive: {
    backgroundColor: colors.gold,
  },
  categoryChipText: {
    color: colors.textDark,
    fontSize: sf(16),
    fontWeight: '900',
  },
  bottomScrimDark: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: sv(250),
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.sm,
    paddingHorizontal: s(24),
    paddingBottom: sv(24),
    paddingTop: sv(96),
  },
  title: {
    color: colors.text,
    fontSize: sf(42),
    lineHeight: sv(48),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: sv(4) },
    textShadowRadius: s(9),
  },
  description: {
    color: colors.textSecondary,
    fontSize: sf(20),
    lineHeight: sv(28),
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(10),
  },
  meta: {
    color: colors.textSecondary,
    fontSize: sf(17),
    fontWeight: '800',
  },
  divider: {
    height: sv(1),
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginTop: sv(6),
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: s(14),
    paddingVertical: sv(5),
  },
  difficultyText: {
    color: colors.textDark,
    fontSize: sf(15),
    fontWeight: '900',
  },
});
