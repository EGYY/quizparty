/**
 * AnswerStats — блок «Как ответили игроки» с анимированными полосами.
 *
 * Мемоизирован — не перерисовывается при каждом WS-событии.
 * Полосы заполняются через setTimeout + useNativeDriver:false.
 * Не используем Animated.delay — внутри он использует useNativeDriver:true,
 * что ломает последующие JS-анимации в Animated.sequence.
 */
import { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { AnswerStats as AnswerStatsType } from '@quizparty/shared';
import { colors } from '@shared/config/theme';

type Props = {
  answerStats: AnswerStatsType[];
  compact: boolean;
  correctIndex: number;
  /** Меняется при смене раунда — сигнал для перезапуска анимации. */
  roundNumber: number | undefined;
};

export const AnswerStats = memo(function AnswerStats({
  answerStats,
  compact,
  correctIndex,
  roundNumber,
}: Props) {
  const statFills = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    statFills.forEach(v => v.setValue(0));

    const id = setTimeout(() => {
      Animated.parallel(
        answerStats.map((stat, i) =>
          Animated.timing(statFills[i]!, {
            toValue: stat.percentage,
            duration: 680,
            useNativeDriver: false, // width — только JS-драйвер
            isInteraction: false,
          }),
        ),
      ).start();
    }, 450);

    return () => clearTimeout(id);
  }, [roundNumber]);

  return (
    <View style={[styles.panel, compact && styles.panel_compact]}>
      <Text style={[styles.title, compact && styles.title_compact]}>
        Как ответили игроки
      </Text>

      {answerStats.map((stat, index) => (
        <View key={stat.optionIndex} style={styles.row}>
          <Text
            style={[
              styles.letter,
              index === correctIndex
                ? styles.letter_correct
                : styles.letter_wrong,
            ]}
          >
            {String.fromCharCode(65 + index)}
          </Text>

          <View style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                index === correctIndex
                  ? styles.fill_correct
                  : styles.fill_wrong,
                {
                  width: statFills[index]?.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <Text style={styles.count}>{stat.count}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minHeight: 194,
    borderColor: 'rgba(255, 224, 168, 0.34)',
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(18, 22, 39, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 6,
  },
  panel_compact: {
    minHeight: 148,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  title_compact: { fontSize: 16, marginBottom: 2 },
  row: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  letter: {
    width: 30,
    fontSize: 23,
    fontWeight: '900',
  },
  letter_correct: { color: '#befe5d' },
  letter_wrong: { color: '#ff715f' },
  track: {
    flex: 1,
    height: 22,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  fill_correct: { backgroundColor: '#a9e95c' },
  fill_wrong: { backgroundColor: '#f0644d' },
  count: {
    width: 30,
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
  },
});
