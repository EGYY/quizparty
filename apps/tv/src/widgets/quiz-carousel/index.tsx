import { memo, useCallback, useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { s, sv } from '@shared/config/scale';
import { QuizCard } from './ui/quiz-card';

type QuizCarouselItemProps = {
  quiz: TvQuiz;
  index: number;
  isActive: boolean;
  onFocusItem: (index: number, quiz: TvQuiz) => void;
  onOpenQuiz: (quiz: TvQuiz) => void;
};

const QuizCarouselItem = memo(function QuizCarouselItem({
  quiz,
  index,
  isActive,
  onFocusItem,
  onOpenQuiz,
}: QuizCarouselItemProps) {
  const handleFocus = useCallback(
    (focusedQuiz: TvQuiz) => onFocusItem(index, focusedQuiz),
    [index, onFocusItem],
  );

  return (
    <QuizCard
      isActive={isActive}
      quiz={quiz}
      onFocus={handleFocus}
      onPress={onOpenQuiz}
    />
  );
});

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
  const listRef = useRef<FlatList<TvQuiz>>(null);

  const keyExtractor = useCallback((quiz: TvQuiz) => quiz.id, []);

  const handleScrollToIndexFailed = useCallback(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const handleFocusItem = useCallback(
    (index: number, focusedQuiz: TvQuiz) => {
      listRef.current?.scrollToIndex({
        animated: true,
        index,
        viewPosition: 0.18,
      });
      onFocusQuiz(focusedQuiz);
    },
    [onFocusQuiz],
  );

  const renderItem = useCallback(
    ({ item: quiz, index }: ListRenderItemInfo<TvQuiz>) => {
      return (
        <QuizCarouselItem
          index={index}
          isActive={
            quiz.id === selectedQuizId || (!selectedQuizId && index === 0)
          }
          quiz={quiz}
          onFocusItem={handleFocusItem}
          onOpenQuiz={onOpenQuiz}
        />
      );
    },
    [handleFocusItem, onOpenQuiz, selectedQuizId],
  );

  return (
    <FlatList
      ref={listRef}
      data={quizzes}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      initialNumToRender={8}
      keyExtractor={keyExtractor}
      maxToRenderPerBatch={6}
      removeClippedSubviews={false}
      renderItem={renderItem}
      updateCellsBatchingPeriod={40}
      windowSize={5}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
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
