import { memo } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Difficulty } from '@quizparty/shared';
import type { TvQuiz } from '@entities/quiz';
import {
  categoryIcons,
  categoryLabels,
  difficultyLabels,
} from '@shared/config/labels';
import { colors, spacing } from '@shared/config/theme';
import { Focusable } from '@shared/ui/focusable';

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: '#7ff2ad',
  [Difficulty.MEDIUM]: '#ffd166',
  [Difficulty.HARD]: '#ff7a7a',
};

export const QuizCarousel = memo(function QuizCarousel({
  quizzes,
  selectedQuizId,
  onFocusQuiz,
  onOpenQuiz,
}: {
  quizzes: TvQuiz[];
  selectedQuizId: string | undefined;
  onFocusQuiz: (quiz: TvQuiz) => void;
  onOpenQuiz: (quiz: TvQuiz) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {quizzes.map((quiz, index) => {
        const active =
          quiz.id === selectedQuizId || (!selectedQuizId && index === 0);
        const rotateY = '5deg';
        const canUseCover = Boolean(
          quiz.coverUrl &&
          !quiz.coverUrl.endsWith('.svg') &&
          !quiz.coverUrl.includes('assets.quizparty.local'),
        );
        const posterContent = (
          <>
            <View style={styles.posterDim} />
            {!canUseCover ? (
              <View style={styles.fallbackPoster}>
                <Text style={styles.coverIcon}>
                  {categoryIcons[quiz.category]}
                </Text>
                <View style={styles.coverShine} />
              </View>
            ) : null}
            <View
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              <Text style={styles.categoryChipText}>
                {categoryIcons[quiz.category]}{' '}
                {categoryLabels[quiz.category].toUpperCase()}
              </Text>
            </View>
            <View style={[styles.bottomScrimDark]} />
            <View style={styles.cardBody}>
              <Text
                numberOfLines={3}
                style={[styles.title, active && styles.titleActive]}
              >
                {quiz.title}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.description, active && styles.descriptionActive]}
              >
                {quiz.description}
              </Text>
              <View style={styles.divider} />
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        difficultyColors[quiz.difficulty ?? Difficulty.MEDIUM],
                    },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {difficultyLabels[quiz.difficulty ?? Difficulty.MEDIUM]}
                  </Text>
                </View>
                <Text style={styles.meta}>◉ {quiz.questionCount} вопросов</Text>
              </View>
            </View>
          </>
        );

        return (
          <Focusable
            key={quiz.id}
            onFocus={() => onFocusQuiz(quiz)}
            onPress={() => onOpenQuiz(quiz)}
            style={[
              styles.frame,
              active ? styles.activeFrame : styles.inactiveFrame,
            ]}
          >
            {canUseCover && quiz.coverUrl ? (
              <ImageBackground
                resizeMode="cover"
                source={{ uri: quiz.coverUrl }}
                style={[
                  styles.card,
                  active && styles.activeCard,
                  {
                    backgroundColor: quiz.themeColor ?? colors.purple,
                    transform: [
                      { perspective: 950 },
                      { rotateY },
                      //  { rotate }
                    ],
                  },
                ]}
              >
                {posterContent}
              </ImageBackground>
            ) : (
              <View
                style={[
                  styles.card,
                  active && styles.activeCard,
                  {
                    backgroundColor: quiz.themeColor ?? colors.purple,
                    transform: [
                      { perspective: 950 },
                      { rotateY },
                      // { rotate }
                    ],
                  },
                ]}
              >
                {posterContent}
              </View>
            )}
          </Focusable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    gap: 2,
    paddingLeft: 4,
    paddingRight: 420,
    paddingVertical: 18,
  },
  frame: {
    justifyContent: 'center',
    borderWidth: 0,
    paddingHorizontal: 8,
  },
  activeFrame: {
    width: 456,
    height: 590,
    zIndex: 2,
  },
  inactiveFrame: {
    width: 340,
    height: 500,
    opacity: 0.78,
  },
  card: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderColor: 'rgba(255, 224, 168, 0.22)',
    borderWidth: 2,
  },
  activeCard: {
    borderColor: '#fff0b2',
    borderWidth: 3,
    shadowColor: '#ffe8a3',
    shadowOpacity: 0.62,
    shadowRadius: 26,
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
    fontSize: 136,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 10,
  },
  coverShine: {
    position: 'absolute',
    left: -120,
    top: -40,
    width: 180,
    height: 340,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    transform: [{ rotate: '22deg' }],
  },
  categoryChip: {
    position: 'absolute',
    left: 16,
    top: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 209, 102, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: colors.gold,
  },
  categoryChipText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '900',
  },
  bottomScrimDark: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(4, 6, 19, 0) 0%, rgba(4, 6, 19, 1) 100%)',
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.sm,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 96,
  },
  title: {
    color: colors.text,
    fontSize: 33,
    lineHeight: 38,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 9,
  },
  titleActive: {
    fontSize: 42,
    lineHeight: 48,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 25,
  },
  descriptionActive: {
    fontSize: 20,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginTop: 6,
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  difficultyText: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: '900',
  },
});
