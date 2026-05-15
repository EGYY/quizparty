/**
 * RoundTimer — полоса таймера с сегментами, свечением и текстом.
 *
 * Перерисовывается каждую секунду (получает timer из QuestionView).
 * НЕ мемоизирован намеренно — должен всегда отражать актуальный countdown.
 *
 * Анимации:
 *   timerPulse    (hot zone ≤ 5 с)   — native driver: scale пульсации
 *   timerFillAnim (ширина свечения)   — JS driver: плавная интерполяция 900 мс,
 *                                       чтобы glow не прыгал при каждом тике
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import type { TimerTickEvent } from '@quizparty/shared';
import { colors } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';

const SEGMENT_COUNT = 18;
/** Сегменты, которые становятся красными (меньше всего времени = левая сторона) */
const HOT_THRESHOLD = 5;

function getProgressPercent(timer: TimerTickEvent): number {
  if (!timer.totalSeconds) return 0;
  return Math.max(
    0,
    Math.min(100, (timer.remainingSeconds / timer.totalSeconds) * 100),
  );
}

type Props = {
  timer: TimerTickEvent;
};

export function RoundTimer({ timer }: Props) {
  const progress = getProgressPercent(timer);
  const isHot = timer.remainingSeconds > 0 && timer.remainingSeconds <= 5;
  const activeSegments = Math.ceil((progress / 100) * SEGMENT_COUNT);

  // ── Hot-zone pulse (native driver) ──────────────────────────────────────────
  const timerPulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isHot) {
      if (!pulseLoop.current) {
        pulseLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(timerPulse, {
              toValue: 1.05,
              duration: 380,
              useNativeDriver: true,
              isInteraction: false,
            }),
            Animated.timing(timerPulse, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
              isInteraction: false,
            }),
          ]),
        );
        pulseLoop.current.start();
      }
    } else {
      pulseLoop.current?.stop();
      pulseLoop.current = null;
      timerPulse.setValue(1);
    }
    return () => {
      pulseLoop.current?.stop();
      pulseLoop.current = null;
    };
  }, [isHot]);

  // ── Smooth glow fill (JS driver — width не поддерживает native driver) ──────
  // Инициализируется текущим progress, чтобы первый рендер не прыгал.
  const timerFillAnim = useRef(new Animated.Value(progress)).current;
  const fillAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Memoized: interpolate() creates a new AnimatedInterpolation node each call.
  // timerFillAnim is a stable ref, so this runs exactly once per component instance.
  const fillGlowWidth = useMemo(
    () =>
      timerFillAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      }),
    [timerFillAnim],
  );

  useEffect(() => {
    fillAnimRef.current?.stop();
    fillAnimRef.current = Animated.timing(timerFillAnim, {
      toValue: progress,
      duration: 900, // ~1 тик → glow плавно тянется между секундами
      useNativeDriver: false,
      isInteraction: false,
    });
    fillAnimRef.current.start();
    return () => {
      fillAnimRef.current?.stop();
    };
  }, [progress]);

  // ── Стили сегментов — пересчитываются только при изменении activeSegments ──
  const segmentStyles = useMemo(
    () =>
      Array.from({ length: SEGMENT_COUNT }, (_, i) => {
        const active = i < activeSegments;
        return [
          styles.segment,
          active && styles.segment_active,
          active && i < HOT_THRESHOLD && styles.segment_hot,
        ];
      }),
    [activeSegments],
  );

  return (
    <Animated.View
      style={[styles.frame, { transform: [{ scale: timerPulse }] }]}
    >
      <View style={styles.segments}>
        {segmentStyles.map((segStyle, i) => (
          <View key={i} style={segStyle} />
        ))}
      </View>

      {/* Декоративное свечение - плавная анимированная ширина */}
      <Animated.View style={[styles.fillGlow, { width: fillGlowWidth }]} />

      <View style={[styles.center]}>
        <Text style={[styles.centerText]}>{timer.remainingSeconds}с</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    maxWidth: s(980),
    height: sv(106),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: s(7),
    backgroundColor: 'rgba(19, 20, 38, 0.92)',
    paddingHorizontal: s(34),
    shadowColor: colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: s(22),
    shadowOffset: { width: 0, height: 0 },
    marginLeft: sv(Dimensions.get('window').width / 20),
  },
  segments: {
    width: '100%',
    height: sv(52),
    flexDirection: 'row',
    gap: s(5),
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: s(4),
  },
  segment: {
    flex: 1,
    borderRadius: s(18),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  segment_active: { backgroundColor: '#ffd966' },
  segment_hot: { backgroundColor: '#f05e7b' },

  fillGlow: {
    position: 'absolute',
    left: s(40),
    height: sv(50),
    borderRadius: 999,
    backgroundColor: 'rgba(255, 209, 102, 0.2)',
  },

  center: {
    position: 'absolute',
    width: s(230),
    height: sv(108),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(38),
    backgroundColor: 'rgba(25, 29, 55, 0.98)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.42,
    shadowRadius: s(18),
    shadowOffset: { width: 0, height: 0 },
  },
  centerText: {
    color: colors.text,
    fontSize: sf(66),
    lineHeight: sv(76),
    fontWeight: '900',
    textShadowColor: 'rgba(126, 164, 255, 0.78)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(14),
  },
});
