import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameMode } from '@quizparty/shared';
import { modeLabels } from '@shared/config/labels';
import { colors, radii } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { LightningIcon, TrophyIcon } from '@shared/assets/icons';

const GAME_MODES = Object.values(GameMode);

const modeAccents: Record<GameMode, string> = {
  [GameMode.CLASSIC]: colors.blue,
  [GameMode.REACTION]: colors.mint,
};

function getModeDescription(mode: GameMode): string {
  switch (mode) {
    case GameMode.REACTION:
      return 'Сначала читаем вопрос, потом отвечаем на скорость.';
    case GameMode.CLASSIC:
      return 'Спокойный темп и больше времени подумать.';
  }
}

function renderModeIcon(mode: GameMode, color: string) {
  switch (mode) {
    case GameMode.REACTION:
      return <LightningIcon color={color} size={s(34)} />;
    case GameMode.CLASSIC:
      return <TrophyIcon color={color} size={s(34)} />;
  }
}

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
  const accentColor = modeAccents[value];
  const handlePress = useCallback(
    () => onModeChange(value),
    [onModeChange, value],
  );

  return (
    <View style={styles.modeWrapper}>
      <Focusable
        onPress={handlePress}
        style={[
          styles.modeOption,
          active && styles.modeOptionActive,
          active && { borderColor: accentColor },
        ]}
      >
        <View
          style={[
            styles.modeIcon,
            {
              backgroundColor: `${accentColor}24`,
            },
          ]}
        >
          {renderModeIcon(value, accentColor)}
        </View>
        <View style={styles.modeTextBlock}>
          <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>
            {modeLabels[value]}
          </Text>
          <Text numberOfLines={3} style={styles.modeDescription}>
            {getModeDescription(value)}
          </Text>
        </View>
        <View style={styles.modeStatus}>
          {active ? (
            <Text style={[styles.modeStatusIcon, { color: accentColor }]}>
              ✓
            </Text>
          ) : null}
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
    gap: sv(10),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: sf(25),
    fontWeight: '900',
  },
  modeGrid: {
    flexDirection: 'row',
    gap: s(16),
  },
  modeWrapper: {
    flex: 1,
    minWidth: 0,
  },
  modeOption: {
    width: '100%',
    height: sv(126),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    borderRadius: radii.md,
    borderWidth: s(1.5),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: s(18),
    paddingVertical: sv(14),
  },
  modeOptionActive: {
    backgroundColor: 'rgba(94, 215, 255, 0.10)',
  },
  modeIcon: {
    width: s(58),
    height: s(58),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(18),
  },
  modeTextBlock: {
    flex: 1,
    gap: sv(5),
    minWidth: 0,
  },
  modeTitle: {
    color: colors.textSecondary,
    fontSize: sf(25),
    fontWeight: '900',
  },
  modeTitleActive: {
    color: colors.text,
  },
  modeDescription: {
    color: colors.textSecondary,
    fontSize: sf(18),
    lineHeight: sv(24),
  },
  modeStatus: {
    width: s(42),
    height: s(42),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeStatusIcon: {
    fontSize: sf(34),
    lineHeight: sv(40),
    fontWeight: '900',
  },
});
