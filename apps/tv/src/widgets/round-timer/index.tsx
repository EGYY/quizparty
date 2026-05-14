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
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { TimerTickEvent } from '@quizparty/shared';
import { colors } from '@shared/config/theme';

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
  compact: boolean;
  timer: TimerTickEvent;
};

export function RoundTimer({ compact, timer }: Props) {
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
      style={[
        styles.frame,
        compact && styles.frame_compact,
        { transform: [{ scale: timerPulse }] },
      ]}
    >
      <View style={styles.segments}>
        {segmentStyles.map((segStyle, i) => (
          <View key={i} style={segStyle} />
        ))}
      </View>

      {/* Декоративное свечение - плавная анимированная ширина */}
      <Animated.View
        style={[
          styles.fillGlow,
          {
            width: timerFillAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />

      <View style={[styles.center, compact && styles.center_compact]}>
        <Text style={[styles.centerText, compact && styles.centerText_compact]}>
          {timer.remainingSeconds}с
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    maxWidth: 980,
    height: 106,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.gold,
    borderRadius: 999,
    borderWidth: 7,
    backgroundColor: 'rgba(19, 20, 38, 0.92)',
    paddingHorizontal: 34,
    shadowColor: colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  frame_compact: {
    height: 82,
    maxWidth: 760,
    borderWidth: 5,
    paddingHorizontal: 24,
  },

  segments: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    gap: 5,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  segment_active: { backgroundColor: '#ffd966' },
  segment_hot: { backgroundColor: '#f05e7b' },

  fillGlow: {
    position: 'absolute',
    left: 40,
    height: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 209, 102, 0.2)',
  },

  center: {
    position: 'absolute',
    width: 230,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: 'rgba(25, 29, 55, 0.98)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  center_compact: { width: 172, height: 82, borderRadius: 30 },
  centerText: {
    color: colors.text,
    fontSize: 66,
    lineHeight: 76,
    fontWeight: '900',
    textShadowColor: 'rgba(126, 164, 255, 0.78)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  centerText_compact: { fontSize: 48, lineHeight: 56 },
});
