import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Difficulty } from '@quizparty/shared';
import type { TvQuiz } from '@entities/quiz';
import { difficultyLabels } from '@shared/config/labels';
import { colors, radii } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { SignalBarsIcon } from '@shared/assets/icons';

const difficultyColors: Record<Difficulty, string> = {
  [Difficulty.EASY]: colors.mint,
  [Difficulty.MEDIUM]: colors.gold,
  [Difficulty.HARD]: colors.red,
};

export const QuizDetailInfoRow = memo(function QuizDetailInfoRow({
  quiz,
}: {
  quiz: TvQuiz;
}) {
  const quizDifficulty = quiz.difficulty ?? Difficulty.MEDIUM;
  const difficultyColor = difficultyColors[quizDifficulty];

  return (
    <View style={styles.infoRow}>
      <View style={styles.author}>
        <View style={styles.authorMark}>
          <Text style={styles.authorMarkText}>Q+</Text>
        </View>
        <View>
          <Text style={styles.authorLabel}>Автор</Text>
          <Text style={styles.authorName}>{quiz.authorName}</Text>
        </View>
      </View>

      <View style={styles.statGroup}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🎯</Text>
          <View>
            <Text style={styles.statValue}>{quiz.questionCount}</Text>
            <Text style={styles.statLabel}>вопросов</Text>
          </View>
        </View>

        <View
          style={[styles.statCard, { borderColor: `${difficultyColor}55` }]}
        >
          <SignalBarsIcon size={s(26)} color={difficultyColor} />
          <View>
            <Text style={[styles.statValue, { color: difficultyColor }]}>
              {difficultyLabels[quizDifficulty]}
            </Text>
            <Text style={styles.statLabel}>сложность</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(10),
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    borderRadius: radii.md,
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: s(14),
    paddingVertical: sv(9),
  },
  authorMark: {
    width: s(40),
    height: s(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.purple,
    borderRadius: s(20),
    borderWidth: s(2),
    backgroundColor: 'rgba(155, 124, 255, 0.16)',
  },
  authorMarkText: {
    color: colors.gold,
    fontSize: sf(17),
    fontWeight: '900',
  },
  authorLabel: {
    color: colors.textMuted,
    fontSize: sf(14),
    fontWeight: '800',
  },
  authorName: {
    color: colors.text,
    fontSize: sf(17),
    fontWeight: '900',
  },
  statGroup: {
    flexDirection: 'row',
    gap: s(8),
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    borderRadius: radii.md,
    borderWidth: s(1.5),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.065)',
    paddingHorizontal: s(12),
    paddingVertical: sv(9),
    minWidth: s(104),
  },
  statEmoji: {
    fontSize: sf(20),
  },
  statValue: {
    color: colors.text,
    fontSize: sf(18),
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: sf(12),
    fontWeight: '700',
  },
});
