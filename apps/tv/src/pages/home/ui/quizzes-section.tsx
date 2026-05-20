import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { QuizDetail } from '@quizparty/shared';
import { QuizCarousel } from '@widgets/quiz-carousel';
import { colors, spacing } from '@shared/config/theme';
import { sf } from '@shared/config/scale';
import { PageState } from '@shared/ui/page-state';

// Props are flat primitives/stable refs instead of an object so that
// React.memo shallow-equality check works correctly.
// Previously `quizzes: AsyncState` was passed as a prop — useAsyncResource
// returns a new object reference on every call even when values are unchanged,
// causing QuizzesSection to re-render on every HomePage state change
// (e.g. detailMode D-pad, overlay open/close) even though data hadn't changed.
type Props = {
  isLoading: boolean;
  loadError: Error | undefined;
  onRefetch: () => void;
  visibleQuizzes: QuizDetail[];
  onOpenQuiz: (quiz: QuizDetail) => void;
};

export const QuizzesSection = memo(function QuizzesSection({
  isLoading,
  loadError,
  onRefetch,
  visibleQuizzes,
  onOpenQuiz,
}: Props) {
  if (isLoading) {
    return (
      <PageState
        title="Загружаем квизы"
        message="Подтягиваем одобренные подборки с backend."
      />
    );
  }
  return (
    <>
      {loadError && !visibleQuizzes.length ? (
        <PageState
          actionLabel="Повторить"
          message="Backend недоступен или вернул ошибку. Проверьте сервер и попробуйте еще раз."
          title="Не удалось загрузить квизы"
          onAction={onRefetch}
        />
      ) : null}

      {visibleQuizzes.length ? (
        <>
          {loadError ? (
            <Text style={styles.offlineNote}>
              Backend недоступен, показаны локальные демо-квизы.
            </Text>
          ) : null}
          <QuizCarousel quizzes={visibleQuizzes} onOpenQuiz={onOpenQuiz} />
        </>
      ) : (
        <PageState
          title="Список квизов пуст"
          message="Для этой категории не нашлось подходящих квизов."
        />
      )}
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
