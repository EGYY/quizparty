import { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameMode } from '@quizparty/shared';
import { modeLabels } from '@shared/config/labels';
import { colors, radii } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { Focusable } from '@shared/ui/focusable';
import { LightningIcon, TimerBoltIcon, TrophyIcon } from '@shared/assets/icons';

const GAME_MODES = Object.values(GameMode);

const modeAccents: Record<GameMode, string> = {
  [GameMode.FAST]: colors.gold,
  [GameMode.CLASSIC]: colors.blue,
  [GameMode.REACTION]: colors.mint,
};

function getModeDescription(mode: GameMode): string {
  switch (mode) {
    case GameMode.FAST:
      return 'Короткие раунды и максимум драйва.';
    case GameMode.REACTION:
      return 'Сначала читаем вопрос, потом отвечаем на скорость.';
    case GameMode.CLASSIC:
      return 'Спокойный темп и больше времени подумать.';
  }
}

function renderModeIcon(mode: GameMode, color: string) {
  switch (mode) {
    case GameMode.FAST:
      return <TimerBoltIcon color={color} size={s(30)} />;
    case GameMode.REACTION:
      return <LightningIcon color={color} size={s(28)} />;
    case GameMode.CLASSIC:
      return <TrophyIcon color={color} size={s(28)} />;
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
              borderColor: `${accentColor}66`,
              backgroundColor: `${accentColor}1f`,
            },
          ]}
        >
          {renderModeIcon(value, accentColor)}
        </View>
        <View style={styles.modeTextBlock}>
          <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>
            {modeLabels[value]}
          </Text>
          <Text style={styles.modeDescription}>
            {getModeDescription(value)}
          </Text>
        </View>
        <View
          style={[
            styles.modeStatus,
            active && {
              borderColor: `${accentColor}88`,
              backgroundColor: `${accentColor}24`,
            },
          ]}
        >
          <Text
            style={[styles.modeStatusText, active && { color: accentColor }]}
          >
            {active ? 'Выбран' : 'OK'}
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
    gap: sv(7),
  },
  sectionTitle: {
    color: colors.text,
    fontSize: sf(19),
    fontWeight: '900',
  },
  modeGrid: {
    gap: sv(7),
  },
  modeWrapper: {
    width: '100%',
  },
  modeOption: {
    width: '100%',
    minHeight: sv(90),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    borderRadius: radii.md,
    borderWidth: s(1.5),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: s(14),
    paddingVertical: sv(8),
  },
  modeOptionActive: {
    backgroundColor: 'rgba(94, 215, 255, 0.10)',
    shadowColor: colors.purple,
    shadowOpacity: 0.3,
    shadowRadius: s(16),
    shadowOffset: { width: 0, height: 0 },
  },
  modeIcon: {
    width: s(46),
    height: s(46),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(16),
    borderWidth: s(1.5),
  },
  modeTextBlock: {
    flex: 1,
    gap: sv(3),
    minWidth: 0,
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
    fontSize: sf(14),
    lineHeight: sv(17),
  },
  modeStatus: {
    minWidth: s(76),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(999),
    borderWidth: s(1),
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: s(10),
    paddingVertical: sv(5),
  },
  modeStatusText: {
    color: colors.textMuted,
    fontSize: sf(13),
    fontWeight: '900',
  },
});
