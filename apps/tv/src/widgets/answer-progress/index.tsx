/**
 * AnswerProgress — полоса «Ответили N / M» с анимированными точками игроков.
 *
 * Мемоизирован: перерисовывается только при изменении answeredCount, playerCount
 * или compact. Тики таймера НЕ вызывают перерисовку.
 *
 * Использует AnswerDot из @entities/player — каждая точка сама управляет
 * своей spring-анимацией при переходе false → true.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnswerDot } from '@entities/player';
import { colors } from '@shared/config/theme';

type Props = {
  answeredCount: number;
  compact: boolean;
  playerCount: number;
};

export const AnswerProgress = memo(function AnswerProgress({
  answeredCount,
  compact,
  playerCount,
}: Props) {
  const totalSlots = Math.max(
    4,
    Math.min(12, playerCount || answeredCount || 8),
  );
  const totalDisplay = playerCount > 0 ? playerCount : totalSlots;

  console.log('AnswerProgress render', {
    answeredCount,
    playerCount,
    totalSlots,
  });

  return (
    <View style={[styles.container, compact && styles.container_compact]}>
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>👥</Text>
      </View>
      <Text style={[styles.label, compact && styles.label_compact]}>
        Ответили
      </Text>
      <Text style={[styles.value, compact && styles.value_compact]}>
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
    minWidth: 860,
    maxWidth: 960,
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 14,
    borderColor: 'rgba(255, 224, 168, 0.48)',
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: 'rgba(25, 27, 45, 0.94)',
    marginTop: 14,
    paddingHorizontal: 28,
  },
  container_compact: {
    minWidth: 620,
    minHeight: 58,
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 18,
  },
  iconWrap: {
    width: 56,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconText: { fontSize: 28 },
  label: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  label_compact: { fontSize: 22 },
  value: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: '900',
  },
  value_compact: { fontSize: 23 },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
});
