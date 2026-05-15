import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { QuizDetail } from '@quizparty/shared';
import { QuizCarousel } from '@widgets/quiz-carousel';
import { colors, spacing } from '@shared/config/theme';
import { sf } from '@shared/config/scale';
import { PageState } from '@shared/ui/page-state';

type AsyncState = {
  isLoading: boolean;
  error: Error | undefined;
  refetch: () => void;
};

type Props = {
  quizzes: AsyncState;
  visibleQuizzes: QuizDetail[];
  selectedQuizId: string | undefined;
  onFocusQuiz: (quiz: QuizDetail) => void;
  onOpenQuiz: (quiz: QuizDetail) => void;
};

export const QuizzesSection = memo(function QuizzesSection({
  quizzes,
  visibleQuizzes,
  selectedQuizId,
  onFocusQuiz,
  onOpenQuiz,
}: Props) {
  return (
    <>
      {quizzes.isLoading ? (
        <PageState
          title="Загружаем квизы"
          message="Подтягиваем одобренные подборки с backend."
        />
      ) : null}

      {quizzes.error && !visibleQuizzes.length ? (
        <PageState
          actionLabel="Повторить"
          message="Backend недоступен или вернул ошибку. Проверьте сервер и попробуйте еще раз."
          title="Не удалось загрузить квизы"
          onAction={quizzes.refetch}
        />
      ) : null}

      {visibleQuizzes.length ? (
        <>
          {quizzes.error ? (
            <Text style={styles.offlineNote}>
              Backend недоступен, показаны локальные демо-квизы.
            </Text>
          ) : null}
          <QuizCarousel
            quizzes={visibleQuizzes}
            selectedQuizId={selectedQuizId}
            onFocusQuiz={onFocusQuiz}
            onOpenQuiz={onOpenQuiz}
          />
        </>
      ) : null}
    </>
  );
});

const styles = StyleSheet.create({
  offlineNote: {
    color: colors.gold,
    fontSize: sf(18),
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
});
