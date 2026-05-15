import { memo, useCallback } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
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
const ROTATE_Y = '5deg';

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: '#7ff2ad',
  [Difficulty.MEDIUM]: '#ffd166',
  [Difficulty.HARD]: '#ff7a7a',
};

type Props = {
  quiz: TvQuiz;
  isActive: boolean;
  onFocus: (quiz: TvQuiz) => void;
  onPress: (quiz: TvQuiz) => void;
};

export const QuizCard = memo(function QuizCard({
  quiz,
  isActive,
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

  const cardInnerStyle = [
    styles.card,
    isActive && styles.activeCard,
    {
      backgroundColor: quiz.themeColor ?? colors.purple,
      transform: [{ perspective: 950 }, { rotateY: ROTATE_Y }],
    },
  ];

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
      <View
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
      >
        <Text style={styles.categoryChipText}>
          {categoryIcons[quiz.category]}{' '}
          {categoryLabels[quiz.category].toUpperCase()}
        </Text>
      </View>
      <View style={styles.bottomScrimDark} />
      <View style={styles.cardBody}>
        <Text
          numberOfLines={3}
          style={[styles.title, isActive && styles.titleActive]}
        >
          {quiz.title}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.description, isActive && styles.descriptionActive]}
        >
          {quiz.description}
        </Text>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColors[quizDifficulty] },
            ]}
          >
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
      onFocus={handleFocus}
      onPress={handlePress}
      style={[
        styles.frame,
        isActive ? styles.activeFrame : styles.inactiveFrame,
      ]}
    >
      {canUseCover && quiz.coverUrl ? (
        <ImageBackground
          resizeMode="cover"
          source={{ uri: getMediaUrl(quiz.coverUrl) }}
          style={cardInnerStyle}
        >
          {posterContent}
        </ImageBackground>
      ) : (
        <View style={cardInnerStyle}>{posterContent}</View>
      )}
    </Focusable>
  );
});

const styles = StyleSheet.create({
  frame: {
    justifyContent: 'center',
    borderWidth: 0,
    paddingHorizontal: s(8),
  },
  activeFrame: {
    width: s(456),
    height: sv(590),
    zIndex: 2,
  },
  inactiveFrame: {
    width: s(340),
    height: sv(500),
    opacity: 0.78,
  },
  card: {
    flex: 1,
    borderRadius: s(30),
    overflow: 'hidden',
    borderColor: 'rgba(255, 224, 168, 0.22)',
    borderWidth: s(2),
  },
  activeCard: {
    borderColor: '#fff0b2',
    borderWidth: s(3),
    shadowColor: '#ffe8a3',
    shadowOpacity: 0.62,
    shadowRadius: s(26),
    shadowOffset: { width: 0, height: 0 },
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
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(4, 6, 19, 0) 0%, rgba(4, 6, 19, 1) 100%)',
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
    fontSize: sf(33),
    lineHeight: sv(38),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: sv(4) },
    textShadowRadius: s(9),
  },
  titleActive: {
    fontSize: sf(42),
    lineHeight: sv(48),
  },
  description: {
    color: colors.textSecondary,
    fontSize: sf(18),
    lineHeight: sv(25),
  },
  descriptionActive: {
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
