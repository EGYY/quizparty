import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import type { TvQuiz } from '@entities/quiz';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { QuizCard } from '@widgets/quiz-carousel/ui/quiz-card';

const GRID_COLUMNS = 4;
const ITEM_HEIGHT = sv(590);
const ITEM_GAP = s(14);
const BOTTOM_SAFE_SPACE = sv(420);

export type QuizGridHandle = {
  focusFirst: () => void;
};

type QuizGridItemProps = {
  hasTVPreferredFocus: boolean;
  index: number;
  quiz: TvQuiz;
  onFocusItem: (index: number, quiz: TvQuiz) => void;
  onOpenQuiz: (quiz: TvQuiz) => void;
};

const QuizGridItem = memo(function QuizGridItem({
  hasTVPreferredFocus,
  index,
  quiz,
  onFocusItem,
  onOpenQuiz,
}: QuizGridItemProps) {
  const handleFocus = useCallback(
    (focusedQuiz: TvQuiz) => onFocusItem(index, focusedQuiz),
    [index, onFocusItem],
  );

  return (
    <QuizCard
      hasTVPreferredFocus={hasTVPreferredFocus}
      isActive={false}
      quiz={quiz}
      variant="grid"
      onFocus={handleFocus}
      onPress={onOpenQuiz}
    />
  );
});

export const QuizGrid = memo(
  forwardRef<
    QuizGridHandle,
    {
      hasMore: boolean;
      isLoadingMore: boolean;
      quizzes: TvQuiz[];
      onEndReached: () => void;
      onFocusIndexChange: (index: number) => void;
      onOpenQuiz: (quiz: TvQuiz) => void;
    }
  >(function QuizGrid(
    {
      hasMore,
      isLoadingMore,
      quizzes,
      onEndReached,
      onFocusIndexChange,
      onOpenQuiz,
    },
    ref,
  ) {
    const listRef = useRef<FlatList<TvQuiz>>(null);
    const [focusRequest, setFocusRequest] = useState(0);
    const quizzesRef = useRef(quizzes);
    const focusedIndexRef = useRef(0);
    const scrolledRowRef = useRef(0);
    quizzesRef.current = quizzes;

    useEffect(() => {
      if (focusedIndexRef.current < quizzes.length) return;
      focusedIndexRef.current = 0;
      scrolledRowRef.current = 0;
    }, [quizzes.length]);

    const focusFirst = useCallback(() => {
      if (!quizzes.length) return;
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
      focusedIndexRef.current = 0;
      scrolledRowRef.current = 0;
      onFocusIndexChange(0);
      setFocusRequest(value => value + 1);
    }, [onFocusIndexChange, quizzes]);

    useEffect(() => {
      if (!focusRequest) return undefined;
      const timer = setTimeout(() => setFocusRequest(0), 0);
      return () => clearTimeout(timer);
    }, [focusRequest]);

    useImperativeHandle(ref, () => ({ focusFirst }), [focusFirst]);

    const keyExtractor = useCallback((quiz: TvQuiz) => quiz.id, []);

    const getItemLayout = useCallback(
      (_: ArrayLike<TvQuiz> | null | undefined, index: number) => ({
        length: ITEM_HEIGHT + ITEM_GAP,
        offset: Math.floor(index / GRID_COLUMNS) * (ITEM_HEIGHT + ITEM_GAP),
        index,
      }),
      [],
    );

    const handleScrollToIndexFailed = useCallback(() => {
      listRef.current?.scrollToOffset({ animated: false, offset: 0 });
    }, []);

    const handleFocusItem = useCallback(
      (index: number, focusedQuiz: TvQuiz) => {
        const currentQuizzes = quizzesRef.current;
        if (
          index < 0 ||
          index >= currentQuizzes.length ||
          currentQuizzes[index]?.id !== focusedQuiz.id
        ) {
          return;
        }

        if (focusedIndexRef.current !== index) {
          focusedIndexRef.current = index;
          onFocusIndexChange(index);
        }

        const row = Math.floor(index / GRID_COLUMNS);
        if (row === scrolledRowRef.current) return;
        scrolledRowRef.current = row;
        listRef.current?.scrollToOffset({
          animated: false,
          offset: Math.max(0, row * (ITEM_HEIGHT + ITEM_GAP)),
        });
      },
      [onFocusIndexChange],
    );

    const renderItem = useCallback(
      ({ item: quiz, index }: ListRenderItemInfo<TvQuiz>) => {
        return (
          <QuizGridItem
            hasTVPreferredFocus={focusRequest > 0 && index === 0}
            index={index}
            quiz={quiz}
            onFocusItem={handleFocusItem}
            onOpenQuiz={onOpenQuiz}
          />
        );
      },
      [focusRequest, handleFocusItem, onOpenQuiz],
    );

    return (
      <FlatList
        ref={listRef}
        data={quizzes}
        numColumns={GRID_COLUMNS}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        extraData={focusRequest}
        getItemLayout={getItemLayout}
        initialNumToRender={12}
        keyExtractor={keyExtractor}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.gold} size="large" />
              <Text style={styles.footerText}>Загружаем еще квизы</Text>
            </View>
          ) : hasMore ? (
            <View style={styles.footerSpace} />
          ) : null
        }
        maxToRenderPerBatch={8}
        removeClippedSubviews={false}
        renderItem={renderItem}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.7}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />
    );
  }),
);

const styles = StyleSheet.create({
  content: {
    gap: ITEM_GAP,
    paddingBottom: BOTTOM_SAFE_SPACE,
    paddingHorizontal: s(16),
    paddingTop: sv(32),
  },
  row: {
    gap: ITEM_GAP,
  },
  footer: {
    height: sv(96),
    alignItems: 'center',
    justifyContent: 'center',
    gap: sv(8),
  },
  footerSpace: {
    height: sv(72),
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: sf(18),
    fontWeight: '800',
  },
});
