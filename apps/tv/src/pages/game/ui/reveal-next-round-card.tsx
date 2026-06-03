/** Shows only the server countdown to the next round. */
import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  /** state.nextRound?.remainingSeconds — статичный счётчик от сервера */
  staticSeconds: number | undefined;
};

export const RevealNextRoundCard = memo(function RevealNextRoundCard({
  staticSeconds,
}: Props) {
  const displaySeconds =
    typeof staticSeconds === 'number' ? staticSeconds : undefined;

  return (
    <View style={[styles.card]}>
      <Text style={[styles.label]}>Следующий раунд через</Text>
      <View style={styles.valueSlot}>
        {typeof displaySeconds === 'number' ? (
          <Text style={[styles.value]}>{displaySeconds}</Text>
        ) : (
          <ActivityIndicator color={colors.gold} size="large" />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: s(340),
    minHeight: sv(170),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 224, 168, 0.36)',
    borderRadius: s(24),
    borderWidth: s(2),
    backgroundColor: 'rgba(18, 22, 39, 0.92)',
    paddingHorizontal: s(20),
    gap: s(6),
  },
  label: {
    color: colors.text,
    fontSize: sf(24),
    fontWeight: '900',
    textAlign: 'center',
  },
  value: {
    color: colors.gold,
    fontSize: sf(82),
    lineHeight: sv(90),
    fontWeight: '900',
    textShadowColor: 'rgba(255, 209, 102, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },
  valueSlot: {
    height: sv(90),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
