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
import { s, sf, sv } from '@shared/config/scale';

type Props = {
  answerStats: AnswerStatsType[];
  correctIndex: number;
  /** Меняется при смене раунда — сигнал для перезапуска анимации. */
  roundNumber: number | undefined;
};

export const AnswerStats = memo(function AnswerStats({
  answerStats,
  correctIndex,
  roundNumber,
}: Props) {
  const statFills = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current?.stop();
    animationRef.current = null;
    statFills.forEach(v => v.setValue(0));

    const id = setTimeout(() => {
      const animation = Animated.parallel(
        answerStats.map((stat, i) =>
          Animated.timing(statFills[i], {
            toValue: stat.percentage,
            duration: 680,
            useNativeDriver: false, // width — только JS-драйвер
            isInteraction: false,
          }),
        ),
      );
      animationRef.current = animation;
      animation.start(({ finished }) => {
        if (finished && animationRef.current === animation) {
          animationRef.current = null;
        }
      });
    }, 450);

    return () => {
      clearTimeout(id);
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [answerStats, roundNumber, statFills]);

  return (
    <View style={[styles.panel]}>
      <Text style={[styles.title]}>Выбор игроков</Text>

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
    minHeight: sv(170),
    borderColor: 'rgba(255, 224, 168, 0.34)',
    borderRadius: s(24),
    borderWidth: s(2),
    backgroundColor: 'rgba(18, 22, 39, 0.9)',
    paddingHorizontal: s(24),
    paddingVertical: sv(14),
    gap: s(5),
  },

  title: {
    color: colors.text,
    fontSize: sf(24),
    fontWeight: '900',
    marginBottom: sv(2),
  },
  row: {
    minHeight: sv(28),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  letter: {
    width: s(30),
    fontSize: sf(23),
    fontWeight: '900',
  },
  letter_correct: { color: '#befe5d' },
  letter_wrong: { color: '#ff715f' },
  track: {
    flex: 1,
    height: sv(20),
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
    width: s(30),
    color: colors.gold,
    fontSize: sf(26),
    fontWeight: '900',
    textAlign: 'right',
  },
});
