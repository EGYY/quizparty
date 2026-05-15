/**
 * AnswerProgress — полоса «Ответили N / M» с анимированными точками игроков.
 *
 * Мемоизирован: перерисовывается только при изменении answeredCount, playerCount.
 * Тики таймера НЕ вызывают перерисовку.
 *
 * Использует AnswerDot из @entities/player — каждая точка сама управляет
 * своей spring-анимацией при переходе false → true.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnswerDot } from '@entities/player';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  answeredCount: number;
  playerCount: number;
};

export const AnswerProgress = memo(function AnswerProgress({
  answeredCount,
  playerCount,
}: Props) {
  const totalSlots = Math.max(
    4,
    Math.min(12, playerCount || answeredCount || 8),
  );
  const totalDisplay = playerCount > 0 ? playerCount : totalSlots;

  return (
    <View style={[styles.container]}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>👥</Text>
      </View>
      <Text style={[styles.label]}>Ответили</Text>
      <Text style={[styles.value]}>
        {answeredCount} / {totalDisplay}
      </Text>
      <View style={styles.dots}>
        {Array.from({ length: totalSlots }, (_, i) => (
          <AnswerDot key={i} isAnswered={i < answeredCount} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minWidth: s(860),
    maxWidth: s(960),
    minHeight: sv(78),
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: s(14),
    borderColor: 'rgba(255, 224, 168, 0.48)',
    borderRadius: 999,
    borderWidth: s(3),
    backgroundColor: 'rgba(25, 27, 45, 0.94)',
    marginTop: sv(14),
    paddingHorizontal: s(28),
  },
  iconWrap: {
    width: s(56),
    height: sv(46),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(20),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconText: { fontSize: sf(28) },
  label: {
    color: colors.text,
    fontSize: sf(30),
    fontWeight: '900',
  },
  value: {
    color: colors.gold,
    fontSize: sf(32),
    fontWeight: '900',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginLeft: s(8),
  },
});
