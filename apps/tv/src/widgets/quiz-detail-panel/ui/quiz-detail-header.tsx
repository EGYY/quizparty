import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { categoryIcons, categoryLabels } from '@shared/config/labels';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export const QuizDetailHeader = memo(function QuizDetailHeader({
  quiz,
}: {
  quiz: TvQuiz;
}) {
  return (
    <View style={styles.titleBlock}>
      <View style={styles.categoryPill}>
        <Text style={styles.categoryPillText}>
          {categoryIcons[quiz.category]} {categoryLabels[quiz.category]}
        </Text>
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {quiz.title}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  titleBlock: {
    paddingRight: s(66),
    gap: sv(10),
  },
  title: {
    color: colors.text,
    fontSize: sf(46),
    fontWeight: '900',
    lineHeight: sv(54),
  },
  categoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: s(18),
    paddingVertical: sv(8),
  },
  categoryPillText: {
    color: colors.textSecondary,
    fontSize: sf(20),
    fontWeight: '800',
  },
});
