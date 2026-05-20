import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { colors } from '@shared/config/theme';
import { sf, sv } from '@shared/config/scale';

export const QuizDetailDescription = memo(function QuizDetailDescription({
  quiz,
}: {
  quiz: TvQuiz;
}) {
  return (
    <Text numberOfLines={3} style={styles.description}>
      {quiz.fullDescription ?? quiz.description}
    </Text>
  );
});

const styles = StyleSheet.create({
  description: {
    color: colors.text,
    fontSize: sf(22),
    lineHeight: sv(31),
  },
});
