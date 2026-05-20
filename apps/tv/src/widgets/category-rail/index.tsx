import { tvCategories } from '@entities/quiz';
import { QuizCategory } from '@quizparty/shared';
import { categoryIcons, categoryLabels } from '@shared/config/labels';
import { colors, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CategoryRailItemProps = {
  active: boolean;
  category: QuizCategory;
  hasTVPreferredFocus: boolean;
  onSelect: (category: QuizCategory) => void;
};

const CategoryRailItem = memo(function CategoryRailItem({
  active,
  category,
  hasTVPreferredFocus,
  onSelect,
}: CategoryRailItemProps) {
  const handlePress = useCallback(
    () => onSelect(category),
    [category, onSelect],
  );

  return (
    <Focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={handlePress}
      style={[styles.item, active && styles.active]}
    >
      <Text style={[styles.icon, active && styles.activeText]}>
        {categoryIcons[category]}
      </Text>
      <Text style={[styles.label, active && styles.activeText]}>
        {categoryLabels[category]}
      </Text>
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
  const [preferInitialFocus, setPreferInitialFocus] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPreferInitialFocus(false), 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.row}>
      {tvCategories.map((category, index) => {
        const active = selected === category;
        return (
          <CategoryRailItem
            active={active}
            category={category}
            hasTVPreferredFocus={preferInitialFocus && index === 0}
            key={category}
            onSelect={onSelect}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
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
