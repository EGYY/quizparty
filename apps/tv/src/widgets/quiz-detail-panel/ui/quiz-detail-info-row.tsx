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
          style={[
            styles.statCard,
            { borderColor: `${difficultyColor}55` },
          ]}
        >
          <SignalBarsIcon size={s(30)} color={difficultyColor} />
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
    gap: s(12),
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    borderRadius: radii.md,
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: s(16),
    paddingVertical: sv(12),
  },
  authorMark: {
    width: s(44),
    height: s(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.purple,
    borderRadius: s(22),
    borderWidth: s(2),
    backgroundColor: 'rgba(155, 124, 255, 0.16)',
  },
  authorMarkText: {
    color: colors.gold,
    fontSize: sf(18),
    fontWeight: '900',
  },
  authorLabel: {
    color: colors.textMuted,
    fontSize: sf(16),
    fontWeight: '800',
  },
  authorName: {
    color: colors.text,
    fontSize: sf(18),
    fontWeight: '900',
  },
  statGroup: {
    flexDirection: 'row',
    gap: s(10),
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    borderRadius: radii.md,
    borderWidth: s(1.5),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.065)',
    paddingHorizontal: s(14),
    paddingVertical: sv(12),
    minWidth: s(112),
  },
  statEmoji: {
    fontSize: sf(22),
  },
  statValue: {
    color: colors.text,
    fontSize: sf(20),
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: sf(13),
    fontWeight: '700',
  },
});
