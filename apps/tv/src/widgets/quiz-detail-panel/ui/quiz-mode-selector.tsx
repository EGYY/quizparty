import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameMode } from '@quizparty/shared';
import { modeLabels } from '@shared/config/labels';
import { colors, radii, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { LightningIcon, TrophyIcon } from '@shared/assets/icons';

const GAME_MODES = Object.values(GameMode);

type ModeOptionProps = {
  active: boolean;
  onModeChange: (mode: GameMode) => void;
  value: GameMode;
};

const ModeOption = memo(function ModeOption({
  active,
  onModeChange,
  value,
}: ModeOptionProps) {
  const handlePress = useCallback(
    () => onModeChange(value),
    [onModeChange, value],
  );

  return (
    <View style={styles.modeWrapper}>
      <Focusable
        onPress={handlePress}
        style={[styles.modeOption, active && styles.modeOptionActive]}
      >
        {value === GameMode.FAST ? (
          <LightningIcon color={colors.blue} size={s(32)} />
        ) : (
          <TrophyIcon color={colors.blue} size={s(32)} />
        )}
        <View style={styles.modeTextBlock}>
          <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>
            {modeLabels[value]} режим
          </Text>
          <Text style={styles.modeDescription}>
            {value === GameMode.FAST
              ? 'Быстрые вопросы, больше драйва!'
              : 'Больше времени на размышление.'}
          </Text>
        </View>
      </Focusable>
    </View>
  );
});

export const QuizModeSelector = memo(function QuizModeSelector({
  mode,
  onModeChange,
}: {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Режим игры</Text>
      <View style={styles.modeGrid}>
        {GAME_MODES.map(value => (
          <ModeOption
            active={mode === value}
            key={value}
            value={value}
            onModeChange={onModeChange}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: s(8),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: sf(20),
    fontWeight: '900',
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeWrapper: {
    flex: 1,
  },
  modeOption: {
    width: '100%',
    minHeight: sv(80),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    borderRadius: radii.md,
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    paddingHorizontal: s(18),
  },
  modeOptionActive: {
    borderColor: colors.blue,
    backgroundColor: 'rgba(94, 215, 255, 0.13)',
    shadowColor: colors.blue,
    shadowOpacity: 0.42,
    shadowRadius: s(16),
    shadowOffset: { width: 0, height: 0 },
  },
  modeTextBlock: {
    flex: 1,
    gap: s(4),
  },
  modeTitle: {
    color: colors.textSecondary,
    fontSize: sf(18),
    fontWeight: '900',
  },
  modeTitleActive: {
    color: colors.text,
  },
  modeDescription: {
    color: colors.textSecondary,
    fontSize: sf(16),
    lineHeight: sv(20),
  },
});
