/**
 * RoundBadge — бейдж «★ Раунд X / Y».
 *
 * Используется в фазах question и reveal.
 * Мемоизирован — перерисовывается только при смене номеров раунда.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf } from '@shared/config/scale';

type Props = {
  roundNumber: number | string;
  totalRounds: number | string;
};

export const RoundBadge = memo(function RoundBadge({
  roundNumber,
  totalRounds,
}: Props) {
  return (
    <View style={[styles.badge]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>★</Text>
      </View>
      <Text style={[styles.label]}>
        Раунд {roundNumber} / {totalRounds}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    width: s(340),
    height: s(82),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(255, 209, 102, 0.58)',
    borderRadius: 26,
    borderWidth: 3,
    backgroundColor: 'rgba(25, 27, 45, 0.9)',
    paddingLeft: 72,
    paddingRight: 22,
  },
  icon: {
    position: 'absolute',
    left: -18,
    width: s(96),
    height: s(96),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 209, 102, 0.7)',
    borderRadius: 48,
    borderWidth: 4,
    backgroundColor: 'rgba(31, 32, 52, 0.96)',
  },
  iconText: {
    color: colors.gold,
    fontSize: sf(42),
    fontWeight: '900',
  },
  label: {
    color: colors.text,
    fontSize: sf(28),
    fontWeight: '900',
    marginLeft: -20,
  },
});
