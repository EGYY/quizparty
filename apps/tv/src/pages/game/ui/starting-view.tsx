import { StyleSheet, Text, View } from 'react-native';
import { useCountdown } from '@shared/lib/use-countdown';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

export function StartingView({ startsAt }: { startsAt: number }) {
  const remaining = useCountdown(startsAt) ?? 0;
  return (
    <View style={styles.startingPanel}>
      <Text style={styles.startingEyebrow}>Все на местах?</Text>
      <Text style={styles.startingCount}>{remaining || 1}</Text>
      <Text style={styles.startingText}>Первый вопрос уже на подходе</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  startingPanel: {
    width: s(820),
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: colors.gold,
    borderRadius: s(46),
    borderWidth: s(3),
    backgroundColor: 'rgba(24, 24, 49, 0.94)',
    marginTop: sv(120),
    paddingVertical: sv(58),
    shadowColor: colors.gold,
    shadowOpacity: 0.48,
    shadowRadius: s(30),
    shadowOffset: { width: 0, height: 0 },
  },
  startingEyebrow: {
    color: colors.gold,
    fontSize: sf(28),
    fontWeight: '900',
  },
  startingCount: {
    color: colors.text,
    fontSize: sf(164),
    lineHeight: sv(178),
    fontWeight: '900',
  },
  startingText: {
    color: colors.textSecondary,
    fontSize: sf(28),
    fontWeight: '800',
  },
});
