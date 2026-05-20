import { tvCategories } from '@entities/quiz';
import { QuizCategory } from '@quizparty/shared';
import { categoryIcons, categoryLabels } from '@shared/config/labels';
import { colors, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

// All categories fit on screen at normal count, but the list is scrollable
// if more are added. Pre-render all items so D-pad navigation is instant.
const ITEM_COUNT = tvCategories.length;

type CategoryRailItemProps = {
  active: boolean;
  category: QuizCategory;
  hasTVPreferredFocus: boolean;
  index: number;
  onFocusItem: (index: number) => void;
  onSelect: (category: QuizCategory) => void;
};

const CategoryRailItem = memo(function CategoryRailItem({
  active,
  category,
  hasTVPreferredFocus,
  index,
  onFocusItem,
  onSelect,
}: CategoryRailItemProps) {
  const handlePress = useCallback(
    () => onSelect(category),
    [category, onSelect],
  );

  const handleFocus = useCallback(
    () => onFocusItem(index),
    [index, onFocusItem],
  );

  const itemStyle = useMemo(
    () => [styles.item, active ? styles.active : null],
    [active],
  );
  const textStyle = useMemo(
    () => [styles.icon, active ? styles.activeText : null],
    [active],
  );
  const labelStyle = useMemo(
    () => [styles.label, active ? styles.activeText : null],
    [active],
  );

  return (
    <Focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={handleFocus}
      onPress={handlePress}
      style={itemStyle}
    >
      <Text style={textStyle}>{categoryIcons[category]}</Text>
      <Text style={labelStyle}>{categoryLabels[category]}</Text>
    </Focusable>
  );
});

export const CategoryRail = memo(function CategoryRail({
  selected,
  onSelect,
}: {
  selected: QuizCategory;
  onSelect: (category: QuizCategory) => void;
}) {
  const listRef = useRef<FlatList<QuizCategory>>(null);

  // Ref mirrors prop so renderItem closure stays stable across selection changes.
  // extraData={selected} tells FlatList to re-run per-cell isActive check.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Scroll to the selected category whenever it changes from outside
  // (e.g. deep-link or programmatic navigation).
  useEffect(() => {
    const idx = tvCategories.indexOf(selected);
    if (idx !== -1) {
      listRef.current?.scrollToIndex({
        animated: true,
        index: idx,
        viewPosition: 0.5,
      });
    }
  }, [selected]);

  const keyExtractor = useCallback((item: QuizCategory) => item, []);

  const handleScrollToIndexFailed = useCallback(() => {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, []);

  // Called when a category item receives TV focus (D-pad navigation).
  // Scrolls the rail so the focused item is visible without changing selection.
  const handleFocusItem = useCallback((index: number) => {
    listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5,
    });
  }, []);

  const renderItem = useCallback(
    ({ item: category, index }: ListRenderItemInfo<QuizCategory>) => {
      // Read from ref — renderItem stays stable (selected not in deps).
      // Only the 2 items whose active flag changed will actually re-render
      // (CategoryRailItem is memo'd). extraData signals the change.
      const active = selectedRef.current === category;
      return (
        <CategoryRailItem
          active={active}
          category={category}
          hasTVPreferredFocus={index === 0}
          index={index}
          onFocusItem={handleFocusItem}
          onSelect={onSelect}
        />
      );
    },
    [handleFocusItem, onSelect],
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={tvCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.row}
        extraData={selected}
        // Small fixed list — render everything upfront for instant D-pad response.
        initialNumToRender={ITEM_COUNT}
        maxToRenderPerBatch={ITEM_COUNT}
        keyExtractor={keyExtractor}
        // TV focus engine needs off-screen items mounted for D-pad navigation;
        // on Android, removeClippedSubviews frees GPU memory safely here because
        // the list is short and rarely has off-screen items anyway.
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={renderItem}
        windowSize={3}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
    // Allow shadows of child items to paint outside the rail bounds.
    overflow: 'visible',
  },
  list: {
    // FlatList itself must also allow overflow so shadows aren't clipped.
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    // Extra padding so the active-item shadow isn't cropped at the edges.
    paddingBottom: sv(10),
    paddingHorizontal: s(4),
  },
  item: {
    minWidth: s(148),
    height: sv(68),
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    gap: s(8),
    backgroundColor: 'rgba(36, 39, 70, 0.82)',
    borderWidth: s(1.5),
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  active: {
    backgroundColor: colors.gold,
    borderColor: 'rgba(255, 224, 130, 0.6)',
    ...Platform.select({
      android: { elevation: 8 },
      default: {
        shadowColor: colors.gold,
        shadowOpacity: 0.45,
        shadowRadius: s(18),
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  icon: {
    color: colors.gold,
    fontSize: sf(26),
  },
  label: {
    color: colors.text,
    fontSize: sf(22),
    fontWeight: '900',
  },
  activeText: {
    color: colors.textDark,
  },
});
