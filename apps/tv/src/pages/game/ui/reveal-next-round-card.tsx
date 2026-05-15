/**
 * RevealNextRoundCard — карточка таймера следующего раунда / окна реакций.
 *
 * Вынесена в отдельный компонент, чтобы изолировать useCountdown:
 * setInterval каждые 500 мс вызывает setState только здесь,
 * не заставляя перерисовываться весь RevealView.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { useCountdown } from '@shared/lib/use-countdown';

type Props = {
  /** state.nextRound?.remainingSeconds — статичный счётчик от сервера */
  staticSeconds: number | undefined;
  /** state.reactionWindow?.closesAt — timestamp для live-обратного отсчёта */
  reactionWindowClosesAt: number | undefined;
};

export const RevealNextRoundCard = memo(function RevealNextRoundCard({
  staticSeconds,
  reactionWindowClosesAt,
}: Props) {
  const reactionCountdown = useCountdown(reactionWindowClosesAt);

  const displaySeconds =
    typeof staticSeconds === 'number'
      ? staticSeconds
      : typeof reactionCountdown === 'number'
        ? reactionCountdown
        : undefined;

  const label =
    typeof staticSeconds === 'number'
      ? 'Следующий раунд через'
      : 'Окно реакций';

  return (
    <View style={[styles.card]}>
      <Text style={[styles.label]}>{label}</Text>
      <Text style={[styles.value]}>
        {typeof displaySeconds === 'number' ? displaySeconds : '...'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: s(340),
    minHeight: sv(194),
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
    fontSize: sf(26),
    fontWeight: '900',
    textAlign: 'center',
  },
  value: {
    color: colors.gold,
    fontSize: sf(96),
    lineHeight: sv(104),
    fontWeight: '900',
    textShadowColor: 'rgba(255, 209, 102, 0.65)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(18),
  },
});
