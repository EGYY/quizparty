/**
 * RoundBadge — бейдж «★ Раунд X / Y».
 *
 * Используется в фазах question и reveal.
 * Мемоизирован — перерисовывается только при смене номеров раунда или compact.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';

type Props = {
  compact: boolean;
  roundNumber: number | string;
  totalRounds: number | string;
};

export const RoundBadge = memo(function RoundBadge({
  compact,
  roundNumber,
  totalRounds,
}: Props) {
  return (
    <View style={[styles.badge, compact && styles.badge_compact]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>★</Text>
      </View>
      <Text style={[styles.label, compact && styles.label_compact]}>
        Раунд {roundNumber} / {totalRounds}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    width: 340,
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(255, 209, 102, 0.58)',
    borderRadius: 26,
    borderWidth: 3,
    backgroundColor: 'rgba(25, 27, 45, 0.9)',
    paddingLeft: 72,
    paddingRight: 22,
  },
  badge_compact: {
    width: 278,
    height: 66,
    borderRadius: 22,
    paddingLeft: 58,
    paddingRight: 14,
  },
  icon: {
    position: 'absolute',
    left: -18,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 209, 102, 0.7)',
    borderRadius: 48,
    borderWidth: 4,
    backgroundColor: 'rgba(31, 32, 52, 0.96)',
  },
  iconText: {
    color: colors.gold,
    fontSize: 42,
    fontWeight: '900',
  },
  label: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    paddingLeft: 15,
  },
  label_compact: { fontSize: 25 },
});
