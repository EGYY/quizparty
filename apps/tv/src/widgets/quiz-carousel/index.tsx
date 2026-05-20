import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { s, sv } from '@shared/config/scale';
import { QuizCard } from './ui/quiz-card';

const ITEM_WIDTH = s(432);
const ITEM_GAP = s(12);
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP;
const ROW_PADDING_LEFT = s(32);

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
  onOpenQuiz,
}: {
  quizzes: TvQuiz[];
  onOpenQuiz: (quiz: TvQuiz) => void;
}) {
  const listRef = useRef<FlatList<TvQuiz>>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | undefined>(
    quizzes[0]?.id,
  );
  // Ref mirrors state so renderItem closure can read the latest value
  // without being recreated on every focus change.
  const activeQuizIdRef = useRef(activeQuizId);
  activeQuizIdRef.current = activeQuizId;

  useEffect(() => {
    setActiveQuizId(current => {
      if (!quizzes.length) return undefined;
      if (current && quizzes.some(quiz => quiz.id === current)) return current;
      return quizzes[0]?.id;
    });
  }, [quizzes]);

  const keyExtractor = useCallback((quiz: TvQuiz) => quiz.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<TvQuiz> | null | undefined, index: number) => ({
      length: ITEM_WIDTH,
      offset: ROW_PADDING_LEFT + ITEM_STEP * index,
      index,
    }),
    [],
  );

  const handleScrollToIndexFailed = useCallback(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const handleFocusItem = useCallback((index: number, focusedQuiz: TvQuiz) => {
    setActiveQuizId(current =>
      current === focusedQuiz.id ? current : focusedQuiz.id,
    );
    listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.18,
    });
  }, []);

  const renderItem = useCallback(
    ({ item: quiz, index }: ListRenderItemInfo<TvQuiz>) => {
      // Read from ref, not from state — keeps this callback stable across
      // focus changes so FlatList never reconciles all cells at once.
      // Only the 2 items whose isActive prop changed will actually re-render
      // (QuizCarouselItem is memo'd). extraData on FlatList triggers the
      // per-cell re-render check when activeQuizId changes.
      const id = activeQuizIdRef.current;
      return (
        <QuizCarouselItem
          index={index}
          isActive={quiz.id === id || (!id && index === 0)}
          quiz={quiz}
          onFocusItem={handleFocusItem}
          onOpenQuiz={onOpenQuiz}
        />
      );
    },
    [handleFocusItem, onOpenQuiz], // activeQuizId removed — renderItem is now stable
  );

  return (
    <FlatList
      ref={listRef}
      data={quizzes}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      extraData={activeQuizId}
      getItemLayout={getItemLayout}
      // Visible count on 1920px screen: ~3.5 cards × 432px + gap.
      // Rendering 4 on first pass covers all visible cards without extra work.
      initialNumToRender={4}
      keyExtractor={keyExtractor}
      // Small batch = shorter per-batch JS work = smoother scroll on weak CPU.
      maxToRenderPerBatch={2}
      // Android: frees GPU memory for off-screen views.
      // tvOS: false — TV focus engine needs off-screen views mounted to handle
      // D-pad navigation to items outside the current viewport.
      removeClippedSubviews={Platform.OS === 'android'}
      renderItem={renderItem}
      updateCellsBatchingPeriod={40}
      // 3 viewport-widths is enough for TV (no fast fling gestures).
      windowSize={3}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
  );
});

const styles = StyleSheet.create({
  row: {
    gap: ITEM_GAP,
    paddingLeft: ROW_PADDING_LEFT,
    paddingRight: s(420),
    paddingVertical: sv(18),
  },
});
