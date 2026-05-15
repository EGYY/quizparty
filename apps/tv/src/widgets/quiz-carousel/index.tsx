import { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { s, sv } from '@shared/config/scale';
import { QuizCard } from './ui/quiz-card';

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
      {quizzes.map((quiz, index) => (
        <QuizCard
          key={quiz.id}
          isActive={
            quiz.id === selectedQuizId || (!selectedQuizId && index === 0)
          }
          quiz={quiz}
          onFocus={onFocusQuiz}
          onPress={onOpenQuiz}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  row: {
    gap: s(2),
    paddingLeft: s(4),
    paddingRight: s(420),
    paddingVertical: sv(18),
  },
});
